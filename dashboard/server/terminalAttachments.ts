// Native PTY/WebSocket attachments and readiness, ordered by attachment time.
// A host attach result may declare `keep`. This registry then retains that
// one live client for the session. The client fans its output out, takes
// input from any joined socket, and stays running when a socket closes.
// A keep declaration may also name an idle screen. A kept client with no
// socket whose screen matches that for the declared settle period is hung
// up; any other screen keeps it. Hosts that declare nothing still receive
// SIGHUP when their socket closes. A launch may keep its client before any
// socket: a later open joins that client. `close()` hangs up every client.
import type { IPty } from "@lydell/node-pty";
import type { WebSocket } from "ws";
import {
  terminalAttachFailedCode,
  terminalEndedCode,
} from "../src/agentTerminal.ts";
import type { HostSession } from "../src/agentLaunch.ts";
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import {
  launchHost,
  type DetachedIdle,
  type UnavailableWorkspace,
} from "./launchHosts.ts";
import type { TerminalSession } from "./agentTerminals.ts";
import type { LaunchInstructionInput } from "./launchInstruction.ts";
import { LiveTerminalClient } from "./liveTerminalClient.ts";
import { refuseWorkspace } from "./terminalSocketFrame.ts";
import { directoryState } from "./sessionWorkspace.ts";

const initialSize = { cols: 80, rows: 24 } as const;

export type KeptLaunch = LaunchInstructionInput & {
  readonly detachedIdle?: DetachedIdle;
};

export class TerminalAttachments {
  private readonly clients = new Map<IPty, LiveTerminalClient>();

  connect(ws: WebSocket, session: TerminalSession): void {
    const workspaceUnavailable = () => {
      if (session.savedWorkspace === undefined) return undefined;
      const state = directoryState(session.savedWorkspace);
      return state.kind === "available" ? undefined : state;
    };
    const unavailable = workspaceUnavailable();
    if (unavailable !== undefined) {
      refuseWorkspace(ws, unavailable);
      return;
    }
    const key = sessionKey(session.session);
    const existing = this.keptClient(key);
    if (existing !== undefined) {
      existing.attach(ws, session, true);
      return;
    }
    const host = launchHost(session.session.host);
    let hostName = host?.name ?? session.session.host;
    let attachment;
    try {
      if (host?.attach === undefined) {
        throw new Error("This host cannot attach.");
      }
      hostName = host.name;
      attachment = host.attach(session.session, session.folder, initialSize);
    } catch {
      const unavailable = workspaceUnavailable();
      if (unavailable !== undefined) {
        refuseWorkspace(ws, unavailable);
        return;
      }
      ws.close(terminalAttachFailedCode, `${hostName} could not be attached.`);
      return;
    }
    if ("workspaceUnavailable" in attachment) {
      refuseWorkspace(ws, attachment.workspaceUnavailable);
      return;
    }
    const pty = attachment.pty;
    const client = this.watchClient(pty, {
      key,
      hostName,
      keep: attachment.keep === true,
      session: session.session,
      admitted: attachment.ready === undefined,
      size: { cols: initialSize.cols, rows: initialSize.rows },
      readiness: attachment.ready,
      startupFailure: attachment.startupFailure,
      ...(attachment.detachedIdle !== undefined
        ? { detachedIdle: attachment.detachedIdle }
        : {}),
    });
    client.attach(ws, session, false);
  }

  // Starts one kept client before any socket. A later open joins it. The
  // promise resolves when the first screen has been judged or the client
  // has exited. The launch wait's abort does not reach this process.
  keep(session: HostSession, pty: IPty, launch: KeptLaunch): Promise<void> {
    const key = sessionKey(session);
    if (this.keptClient(key) !== undefined) {
      try {
        pty.kill("SIGHUP");
      } catch {
        // The client already kept for this session is the one that stays.
      }
      return Promise.resolve();
    }
    const client = this.watchClient(pty, {
      key,
      hostName: launchHost(session.host)?.name ?? session.host,
      keep: true,
      session,
      admitted: false,
      size: { cols: pty.cols, rows: pty.rows },
      readiness: launch.ready,
      startupFailure: undefined,
      ...(launch.detachedIdle === undefined
        ? {}
        : { detachedIdle: launch.detachedIdle }),
      launchInput: launch,
    });
    return client.firstScreen;
  }

  // Tracks the client before `watch`, so an exit during startup can still
  // find it. The screen size is the caller's: attach uses the size it
  // spawned, and a launch uses the process it already started.
  private watchClient(
    pty: IPty,
    input: {
      readonly key: string;
      readonly hostName: string;
      readonly keep: boolean;
      readonly session: HostSession;
      readonly admitted: boolean;
      readonly size: { readonly cols: number; readonly rows: number };
      readonly readiness:
        ((screen: string, cursorVisible: boolean) => boolean) | undefined;
      readonly startupFailure:
        (() => UnavailableWorkspace | undefined) | undefined;
      readonly detachedIdle?: DetachedIdle;
      readonly launchInput?: LaunchInstructionInput;
    },
  ): LiveTerminalClient {
    const client = new LiveTerminalClient({
      ...input,
      pty,
      isTracked: () => this.clients.has(pty),
      untrack: () => this.clients.delete(pty),
    });
    this.clients.set(pty, client);
    client.watch();
    return client;
  }

  // Types `input` into the newest open attachment to this session, and
  // answers whether one was open.
  type(session: SessionReference, input: string): boolean {
    const key = sessionKey(session);
    const newest = [...this.clients.values()]
      .filter((client) => client.key === key && client.hasOpenSocket())
      .at(-1);
    newest?.pty.write(input);
    return newest !== undefined;
  }

  // Ends every attachment to this session: its client hangs up, and its
  // sockets close as an ended terminal.
  endAttachments(session: SessionReference): void {
    const key = sessionKey(session);
    for (const client of [...this.clients.values()]) {
      if (client.key !== key) continue;
      const sockets = client.attachedSockets();
      client.hangup();
      for (const socket of sockets) {
        socket.close(terminalEndedCode, "The terminal ended.");
      }
    }
  }

  // Launch handoffs end here. A client with no socket then follows the idle
  // rule. One the page already joined stays until that socket drops.
  releaseHandoffs(): void {
    for (const client of this.clients.values()) client.releaseHandoff();
  }

  // Hangs up every native client, including one kept with no socket. The
  // admission boundary closes its sockets.
  close(): void {
    for (const client of [...this.clients.values()]) {
      client.hangup();
    }
  }

  // The kept clients this registry still holds, each with its current screen.
  // Reading the screen starts nothing.
  async held(): Promise<
    readonly { readonly session: HostSession; readonly screen: string }[]
  > {
    const clients = [...this.clients.values()].filter((client) => client.keep);
    return Promise.all(
      clients.map(async (client) => ({
        session: client.session,
        screen: await client.screenText(),
      })),
    );
  }

  // The one live client whose attach result declared keep for this session.
  private keptClient(key: string): LiveTerminalClient | undefined {
    return [...this.clients.values()].find(
      (client) => client.keep && client.key === key,
    );
  }
}
