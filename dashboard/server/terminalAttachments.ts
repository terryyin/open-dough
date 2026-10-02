// Native PTY/WebSocket attachments and readiness, ordered by attachment time.
// A host attach result may declare `keep`. This registry then retains that
// one live client for the session. The client fans its output out, takes
// input from any joined socket, and stays running when a socket closes.
// Hosts that declare nothing still receive SIGHUP when their socket closes.
// `close()` hangs up every client.
import type { IPty } from "@lydell/node-pty";
import type { WebSocket } from "ws";
import {
  terminalAttachFailedCode,
  terminalEndedCode,
} from "../src/agentTerminal.ts";
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import { launchHost } from "./launchHosts.ts";
import type { TerminalSession } from "./agentTerminals.ts";
import { LiveTerminalClient } from "./liveTerminalClient.ts";
import { refuseWorkspace } from "./terminalSocketFrame.ts";

const initialSize = { cols: 80, rows: 24 } as const;

export class TerminalAttachments {
  private readonly clients = new Map<IPty, LiveTerminalClient>();

  connect(ws: WebSocket, session: TerminalSession): void {
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
      ws.close(terminalAttachFailedCode, `${hostName} could not be attached.`);
      return;
    }
    if ("workspaceUnavailable" in attachment) {
      refuseWorkspace(ws, attachment.workspaceUnavailable);
      return;
    }
    const pty = attachment.pty;
    const client = new LiveTerminalClient({
      pty,
      key,
      hostName,
      keep: attachment.keep === true,
      admitted: attachment.ready === undefined,
      size: { cols: initialSize.cols, rows: initialSize.rows },
      readiness: attachment.ready,
      startupFailure: attachment.startupFailure,
      isTracked: () => this.clients.has(pty),
      untrack: () => this.clients.delete(pty),
    });
    this.clients.set(pty, client);
    client.watch();
    client.attach(ws, session, false);
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

  // Hangs up every native client, including one kept with no socket. The
  // admission boundary closes its sockets.
  close(): void {
    for (const client of [...this.clients.values()]) {
      client.hangup();
    }
  }

  // The one live client whose attach result declared keep for this session.
  private keptClient(key: string): LiveTerminalClient | undefined {
    return [...this.clients.values()].find(
      (client) => client.keep && client.key === key,
    );
  }
}
