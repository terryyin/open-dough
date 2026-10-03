// Sockets joined to one native terminal client. Output is fanned out; input
// and resize from any socket reach the process. Readiness observed on a
// socket admits every joined socket.
import type { WebSocket } from "ws";
import type { UnavailableWorkspace } from "./launchHosts.ts";
import { setRecordDoneAt } from "./launchRecordStore.ts";
import type { TerminalSession } from "./agentTerminals.ts";
import {
  closeClientSocket,
  closeUnlessTerminalMessage,
  sendControl,
} from "./terminalSocketFrame.ts";

type LiveSocket = {
  readonly ws: WebSocket;
  readonly reopen: () => Promise<unknown>;
  ready: boolean;
  reopened: Promise<unknown>;
};

export class JoinedSockets {
  private readonly sockets: LiveSocket[] = [];
  private admitted: boolean;

  constructor(
    private readonly client: {
      readonly hostName: string;
      readonly admitted: boolean;
      readonly readiness:
        ((screen: string, cursorVisible: boolean) => boolean) | undefined;
      readonly startupFailure:
        (() => UnavailableWorkspace | undefined) | undefined;
      readonly isTracked: () => boolean;
      readonly writeInput: (data: string) => void;
      readonly resize: (cols: number, rows: number) => void;
      readonly onDropped: (remaining: number) => void;
    },
  ) {
    this.admitted = client.admitted;
  }

  hasOpen(): boolean {
    return this.sockets.length > 0;
  }

  attached(): readonly WebSocket[] {
    return this.sockets.map((socket) => socket.ws);
  }

  send(output: string): void {
    for (const socket of [...this.sockets]) {
      void socket.reopened.then(() => {
        if (socket.ws.readyState === socket.ws.OPEN) {
          socket.ws.send(output);
        }
      });
    }
  }

  closeAll(): void {
    for (const socket of [...this.sockets]) this.closeSocket(socket);
  }

  attach(ws: WebSocket, session: TerminalSession, joining: boolean): void {
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
    if (!this.admitted && this.client.readiness !== undefined) {
      sendControl(ws, { readiness: "observe" });
    } else if (joining && this.admitted) {
      // The client was already admitted, so the new socket does not wait.
      sendControl(ws, { readiness: "attached" });
    }
  }

  private listen(socket: LiveSocket): void {
    socket.ws.on("message", (data, isBinary) => {
      const message = closeUnlessTerminalMessage(socket.ws, data, isBinary);
      if (message === undefined) return;
      if (!this.client.isTracked()) return;
      if ("screen" in message) {
        if (
          !this.admitted &&
          this.client.readiness?.(
            message.screen.join("\n"),
            message.cursorVisible,
          )
        ) {
          this.admit();
        }
      } else if ("input" in message) {
        this.client.writeInput(message.input);
      } else {
        this.client.resize(message.resize.cols, message.resize.rows);
      }
    });
    socket.ws.on("close", () => {
      this.drop(socket);
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

  private drop(socket: LiveSocket): void {
    const index = this.sockets.indexOf(socket);
    if (index < 0) return;
    this.sockets.splice(index, 1);
    this.client.onDropped(this.sockets.length);
  }

  private closeSocket(socket: LiveSocket): void {
    void socket.reopened.then(() => {
      closeClientSocket(
        socket.ws,
        socket.ready,
        this.client.hostName,
        socket.ready ? undefined : this.client.startupFailure?.(),
      );
    });
  }
}
