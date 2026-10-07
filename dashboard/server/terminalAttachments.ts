// Native PTY/WebSocket attachments and readiness, ordered by attachment time.
// A host attach result may declare `keep`. This registry then retains that
// one live client for the session. The client fans its output out, takes
// input from any joined socket, and stays running when a socket closes.
// A keep declaration may also name an idle screen. A kept client with no
// socket whose screen matches that for the declared settle period is hung
// up; any other screen keeps it. Hosts that declare nothing still receive
// SIGHUP when their socket closes. A launch may keep its client before any
// socket: a later open joins that client. A private client, opened for one
// call with no socket, is hung up when that call settles. `close()` hangs up
// every client.
import type { IPty } from "@lydell/node-pty";
import type { WebSocket } from "ws";
import {
  terminalAttachFailedCode,
  terminalEndedCode,
} from "../src/agentTerminal.ts";
import type { HostSession } from "../src/agentLaunch.ts";
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import { TerminalAttachmentUnopened } from "./hostLaunch.ts";
import { launchHost, type DetachedIdle } from "./launchHosts.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import type { TerminalSession } from "./agentTerminals.ts";
import type { LaunchInstructionInput } from "./launchInstruction.ts";
import {
  LiveTerminalClient,
  type LiveTerminalClientOptions,
} from "./liveTerminalClient.ts";
import { nativeAttach } from "./nativeAttach.ts";
import { refuseWorkspace } from "./terminalSocketFrame.ts";
import { directoryState } from "./sessionWorkspace.ts";

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
    const existing = this.keptClient(sessionKey(session.session));
    if (existing !== undefined) {
      existing.attach(ws, session, true);
      return;
    }
    const attached = nativeAttach(session.session, session.folder, false);
    if ("failedHost" in attached) {
      const unavailable = workspaceUnavailable();
      if (unavailable !== undefined) {
        refuseWorkspace(ws, unavailable);
        return;
      }
      ws.close(
        terminalAttachFailedCode,
        `${attached.failedHost} could not be attached.`,
      );
      return;
    }
    if ("workspaceUnavailable" in attached) {
      refuseWorkspace(ws, attached.workspaceUnavailable);
      return;
    }
    this.watchClient(attached.pty, attached.options).attach(ws, session, false);
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
    input: LiveTerminalClientOptions,
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

  // Runs `use` against the newest open attachment to this session, which
  // stays open. With none, a private client is attached from `folder`, with
  // no saved-workspace check, and `use` runs once its first screen has
  // settled; that client is hung up when `use` settles.
  async withAttachment<T>(
    session: HostSession,
    folder: ProjectFolder,
    use: (type: (input: string) => void) => Promise<T>,
  ): Promise<T> {
    const open = this.newestOpen(session);
    if (open !== undefined) {
      return use((input) => {
        open.pty.write(input);
      });
    }
    const client = await this.openPrivate(session, folder);
    try {
      return await use((input) => {
        client.pty.write(input);
      });
    } finally {
      client.hangup();
    }
  }

  private newestOpen(
    session: SessionReference,
  ): LiveTerminalClient | undefined {
    const key = sessionKey(session);
    return [...this.clients.values()]
      .filter((client) => client.key === key && client.hasOpenSocket())
      .at(-1);
  }

  // A socketless client with no idle rule, tracked so `close()` hangs it up,
  // once it has shown a settled screen.
  private async openPrivate(
    session: HostSession,
    folder: ProjectFolder,
  ): Promise<LiveTerminalClient> {
    const attached = nativeAttach(session, folder, true);
    if (!("pty" in attached)) throw new TerminalAttachmentUnopened();
    const client = this.watchClient(attached.pty, attached.options);
    const shown = await client.firstOutput;
    await client.screenText();
    if (!shown || !this.clients.has(client.pty)) {
      client.hangup();
      throw new TerminalAttachmentUnopened();
    }
    return client;
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
