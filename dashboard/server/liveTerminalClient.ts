// One native terminal client and the sockets joined to it. Output is fanned
// out; input and resize from any socket reach the process. Keep leaves the
// process running when its last socket drops. A declared idle screen then
// hangs it up after the settle period. With no idle screen, that process
// stays. A client that did not declare keep hangs up on the last close.
// A launch instruction is entered from the server-side screen and holds that
// idle rule until the write. The registry decides which clients are still live.
import type { IPty } from "@lydell/node-pty";
import type { WebSocket } from "ws";
import type { HostSession } from "../src/hostSession.ts";
import type { DetachedIdle, UnavailableWorkspace } from "./launchHosts.ts";
import type { TerminalSession } from "./agentTerminals.ts";
import {
  detachedIdleWatch,
  type DetachedIdleWatch,
} from "./detachedIdleWatch.ts";
import { JoinedSockets } from "./joinedSockets.ts";
import {
  LaunchInstruction,
  type LaunchInstructionInput,
} from "./launchInstruction.ts";

type LiveTerminalClientInput = {
  readonly pty: IPty;
  readonly key: string;
  readonly hostName: string;
  readonly keep: boolean;
  readonly session: HostSession;
  readonly admitted: boolean;
  readonly size: { readonly cols: number; readonly rows: number };
  readonly readiness:
    ((screen: string, cursorVisible: boolean) => boolean) | undefined;
  readonly startupFailure: (() => UnavailableWorkspace | undefined) | undefined;
  readonly detachedIdle?: DetachedIdle;
  // Absent when this client was not started with a launch instruction.
  readonly launchInput?: LaunchInstructionInput;
  // The registry's live set. Messages are ignored once the client is gone,
  // and hangup is a no-op the second time.
  readonly isTracked: () => boolean;
  readonly untrack: () => boolean;
};

export class LiveTerminalClient {
  readonly pty: IPty;
  readonly key: string;
  readonly keep: boolean;
  readonly session: HostSession;
  // Resolves when the first completed screen has been judged, or the client
  // has exited. Later screens can still accept the instruction. Already
  // resolved when this client has no launch instruction.
  readonly firstScreen: Promise<void>;
  private readonly sockets: JoinedSockets;
  private readonly isTracked: () => boolean;
  private readonly untrack: () => boolean;
  private idle: DetachedIdleWatch | undefined;
  private size: { cols: number; rows: number };
  private readonly launch: LaunchInstruction | undefined;

  constructor(input: LiveTerminalClientInput) {
    this.pty = input.pty;
    this.key = input.key;
    this.keep = input.keep;
    this.session = input.session;
    this.isTracked = input.isTracked;
    this.untrack = input.untrack;
    this.size = { cols: input.size.cols, rows: input.size.rows };
    this.sockets = new JoinedSockets({
      hostName: input.hostName,
      admitted: input.admitted,
      readiness: input.readiness,
      startupFailure: input.startupFailure,
      isTracked: () => this.isTracked(),
      writeInput: (data) => {
        this.pty.write(data);
      },
      resize: (cols, rows) => {
        this.resize(cols, rows);
      },
      onDropped: (remaining) => {
        this.socketDropped(remaining);
      },
    });
    this.idle = detachedIdleWatch(
      input.detachedIdle,
      input.size,
      {
        isTracked: () => this.isTracked(),
        detached: () => !this.sockets.hasOpen(),
        hangup: () => {
          this.hangup();
        },
      },
      input.keep,
    );
    this.launch =
      input.launchInput === undefined
        ? undefined
        : new LaunchInstruction(input.launchInput, input.size, {
            tracked: () => this.isTracked(),
            writeInstruction: (data) => {
              try {
                this.pty.write(data);
                return true;
              } catch {
                return false;
              }
            },
            holdReleased: () => {
              if (!this.sockets.hasOpen()) this.idle?.watch();
            },
          });
    this.firstScreen = this.launch?.firstScreen ?? Promise.resolve();
  }

  // Registers process output and exit. Call once, after the registry tracks
  // this client, so an exit can still find it.
  watch(): void {
    this.pty.onData((output) => {
      this.idle?.write(output);
      this.launch?.write(output);
      if (!this.sockets.hasOpen() && !this.launch?.holdsIdle()) {
        this.idle?.watch();
      }
      this.sockets.send(output);
    });
    // Exited on its own. A socket-only detach does not reach this for a
    // kept client, because that client stays tracked.
    this.pty.onExit(() => {
      this.launch?.clientExited();
      this.releaseIdle();
      if (!this.untrack()) return;
      this.sockets.closeAll();
    });
  }

  attach(ws: WebSocket, session: TerminalSession, joining: boolean): void {
    this.idle?.hold();
    this.sockets.attach(ws, session, joining);
    // The socket is open, so releasing a launch handoff does not start idle.
    this.launch?.releaseHandoff();
    if (joining) {
      // Output from before this socket is still on the client. The nudge
      // makes it paint that screen again.
      this.redraw();
    }
  }

  // The client's current screen, after its writes have settled.
  screenText(): Promise<string> {
    return this.idle?.text() ?? Promise.resolve("");
  }

  releaseHandoff(): void {
    this.launch?.releaseHandoff();
  }

  hasOpenSocket(): boolean {
    return this.sockets.hasOpen();
  }

  attachedSockets(): readonly WebSocket[] {
    return this.sockets.attached();
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

  private resize(cols: number, rows: number): void {
    try {
      this.idle?.resize(cols, rows);
      this.launch?.resize(cols, rows);
      this.pty.resize(cols, rows);
      this.size = { cols, rows };
    } catch {
      // The native descriptor can close before its exit callback arrives.
      this.lostDescriptor();
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
      this.launch?.resize(cols + 1, rows);
      this.pty.resize(cols + 1, rows);
      this.idle?.resize(cols, rows);
      this.launch?.resize(cols, rows);
      this.pty.resize(cols, rows);
    } catch {
      this.lostDescriptor();
    }
  }

  private releaseIdle(): void {
    const idle = this.idle;
    this.idle = undefined;
    idle?.dispose();
    this.launch?.dispose();
  }

  private socketDropped(remaining: number): void {
    if (!this.keep) this.hangup();
    else if (remaining === 0 && !this.launch?.holdsIdle()) this.idle?.watch();
  }

  private lostDescriptor(): void {
    this.hangup();
    this.sockets.closeAll();
  }
}
