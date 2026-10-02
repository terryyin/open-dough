// One native terminal client and the sockets joined to it. Output is fanned
// out; input and resize from any socket reach the process. Keep leaves the
// process running when its last socket drops, and an idle screen then hangs
// it up after the settle period. Otherwise the last close hangs it up.
// The registry decides which clients are still live.
import type { IPty } from "@lydell/node-pty";
import type { WebSocket } from "ws";
import type { DetachedIdle, UnavailableWorkspace } from "./launchHosts.ts";
import { setRecordDoneAt } from "./launchRecordStore.ts";
import type { TerminalSession } from "./agentTerminals.ts";
import {
  detachedIdleWatch,
  type DetachedIdleWatch,
} from "./detachedIdleWatch.ts";
import {
  closeClientSocket,
  sendControl,
  terminalMessage,
} from "./terminalSocketFrame.ts";

const notTerminalMessage = 1008;

type LiveSocket = {
  readonly ws: WebSocket;
  readonly reopen: () => Promise<unknown>;
  ready: boolean;
  reopened: Promise<unknown>;
};

type LiveTerminalClientInput = {
  readonly pty: IPty;
  readonly key: string;
  readonly hostName: string;
  readonly keep: boolean;
  readonly admitted: boolean;
  readonly size: { readonly cols: number; readonly rows: number };
  readonly readiness:
    ((screen: string, cursorVisible: boolean) => boolean) | undefined;
  readonly startupFailure: (() => UnavailableWorkspace | undefined) | undefined;
  readonly detachedIdle?: DetachedIdle;
  // The registry's live set. Messages are ignored once the client is gone,
  // and hangup is a no-op the second time.
  readonly isTracked: () => boolean;
  readonly untrack: () => boolean;
};

export class LiveTerminalClient {
  readonly pty: IPty;
  readonly key: string;
  readonly keep: boolean;
  private readonly hostName: string;
  private readonly sockets: LiveSocket[] = [];
  private readonly readiness:
    ((screen: string, cursorVisible: boolean) => boolean) | undefined;
  private readonly startupFailure:
    (() => UnavailableWorkspace | undefined) | undefined;
  private readonly isTracked: () => boolean;
  private readonly untrack: () => boolean;
  private idle: DetachedIdleWatch | undefined;
  private admitted: boolean;
  private size: { cols: number; rows: number };

  constructor(input: LiveTerminalClientInput) {
    this.pty = input.pty;
    this.key = input.key;
    this.keep = input.keep;
    this.hostName = input.hostName;
    this.readiness = input.readiness;
    this.startupFailure = input.startupFailure;
    this.isTracked = input.isTracked;
    this.untrack = input.untrack;
    this.idle = detachedIdleWatch(input.detachedIdle, input.size, {
      isTracked: () => this.isTracked(),
      detached: () => this.sockets.length === 0,
      hangup: () => {
        this.hangup();
      },
    });
    this.admitted = input.admitted;
    this.size = { cols: input.size.cols, rows: input.size.rows };
  }

  // Registers process output and exit. Call once, after the registry tracks
  // this client, so an exit can still find it.
  watch(): void {
    this.pty.onData((output) => {
      this.idle?.write(output);
      if (this.sockets.length === 0) this.idle?.watch();
      for (const socket of [...this.sockets]) {
        void socket.reopened.then(() => {
          if (socket.ws.readyState === socket.ws.OPEN) {
            socket.ws.send(output);
          }
        });
      }
    });
    // Exited on its own. A socket-only detach does not reach this for a
    // kept client, because that client stays tracked.
    this.pty.onExit(() => {
      this.releaseIdle();
      if (!this.untrack()) return;
      for (const socket of [...this.sockets]) {
        this.closeSocket(socket);
      }
    });
  }

  attach(ws: WebSocket, session: TerminalSession, joining: boolean): void {
    this.idle?.hold();
    const socket: LiveSocket = {
      ws,
      reopen: () =>
        session.markedDone
          ? setRecordDoneAt(session.sourceId, session.session, undefined).catch(
              () => undefined,
            )
          : Promise.resolve(),
      ready: false,
      reopened: Promise.resolve(),
    };
    if (this.admitted) {
      socket.ready = true;
      socket.reopened = joining ? Promise.resolve() : socket.reopen();
    }
    this.sockets.push(socket);
    this.listen(socket);
    if (!this.admitted && this.readiness !== undefined) {
      sendControl(ws, { readiness: "observe" });
    } else if (joining && this.admitted) {
      // The client was already admitted, so the new socket does not wait.
      // The one-column nudge makes the native client redraw for this socket.
      sendControl(ws, { readiness: "attached" });
      this.redraw();
    }
  }

  hasOpenSocket(): boolean {
    return this.sockets.length > 0;
  }

  attachedSockets(): readonly WebSocket[] {
    return this.sockets.map((socket) => socket.ws);
  }

  // SIGHUP. The registry uses this for a host that did not declare keep, and
  // for every client when the server shuts down.
  hangup(): void {
    this.releaseIdle();
    if (!this.untrack()) return;
    try {
      this.pty.kill("SIGHUP");
    } catch {
      // Already gone.
    }
  }

  private listen(socket: LiveSocket): void {
    socket.ws.on("message", (data, isBinary) => {
      const message = terminalMessage(data, isBinary);
      if (message === undefined) {
        socket.ws.close(notTerminalMessage, "Not a terminal message.");
        return;
      }
      if (!this.isTracked()) return;
      if ("screen" in message) {
        if (
          !this.admitted &&
          this.readiness?.(message.screen.join("\n"), message.cursorVisible)
        ) {
          this.admit();
        }
      } else if ("input" in message) {
        this.pty.write(message.input);
      } else {
        try {
          this.idle?.resize(message.resize.cols, message.resize.rows);
          this.pty.resize(message.resize.cols, message.resize.rows);
          this.size = {
            cols: message.resize.cols,
            rows: message.resize.rows,
          };
        } catch {
          // The native descriptor can close before its exit callback arrives.
          this.lostDescriptor();
        }
      }
    });
    socket.ws.on("close", () => {
      this.dropSocket(socket);
    });
  }

  private admit(): void {
    if (this.admitted) return;
    this.admitted = true;
    for (const socket of [...this.sockets]) {
      if (socket.ready) continue;
      socket.ready = true;
      socket.reopened = socket.reopen();
      void socket.reopened.then(() => {
        sendControl(socket.ws, { readiness: "attached" });
      });
    }
  }

  // Moves one column away and back so the native client emits a fresh screen.
  // Both updates are synchronous: the process still receives SIGWINCH and
  // redraws, and a later real resize is not left one column wide.
  private redraw(): void {
    if (!this.isTracked()) return;
    const { cols, rows } = this.size;
    try {
      this.idle?.resize(cols + 1, rows);
      this.pty.resize(cols + 1, rows);
      this.idle?.resize(cols, rows);
      this.pty.resize(cols, rows);
    } catch {
      this.lostDescriptor();
    }
  }

  private releaseIdle(): void {
    const idle = this.idle;
    this.idle = undefined;
    idle?.dispose();
  }

  private dropSocket(socket: LiveSocket): void {
    const index = this.sockets.indexOf(socket);
    if (index < 0) return;
    this.sockets.splice(index, 1);
    if (!this.keep) this.hangup();
    else if (this.sockets.length === 0) this.idle?.watch();
  }

  private lostDescriptor(): void {
    const sockets = [...this.sockets];
    this.hangup();
    for (const socket of sockets) this.closeSocket(socket);
  }

  private closeSocket(socket: LiveSocket): void {
    void socket.reopened.then(() => {
      closeClientSocket(
        socket.ws,
        socket.ready,
        this.hostName,
        socket.ready ? undefined : this.startupFailure?.(),
      );
    });
  }
}
