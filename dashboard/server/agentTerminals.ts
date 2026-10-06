// One admitted session per WebSocket, attached through its host boundary.
// Socket closure hangs up the PTY unless that host's attach result declares
// keep; server closure hangs up every client this process holds. A Cursor
// session is bridged to the machine-local runner, which holds that client,
// so closing this server does not hang it up. Output and input use the shared
// terminal protocol. Native startup remains interactive while readiness controls
// reopening; marking done can type into and end those attachments.

import { STATUS_CODES, type IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import type { HttpServer } from "vite";
import { WebSocketServer } from "ws";
import { agentTerminalEndpoint } from "../src/agentTerminal.ts";
import type { HostSession } from "../src/agentLaunch.ts";
import { TerminalAttachments } from "./terminalAttachments.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import { bridgeCursorTerminal } from "./hosts/cursor/runnerClient.ts";
import { RefusedRequest } from "./localOrigin.ts";
import type { ProjectFolder } from "./projectFolders.ts";

// The one recorded session an admitted upgrade attaches to, in its project,
// and whether its record is marked done.
export type TerminalSession = {
  readonly sourceId: string;
  readonly session: HostSession;
  readonly markedDone: boolean;
  readonly folder: ProjectFolder;
  // Recorded Claude launch context to recheck before attachment. Absent for
  // legacy Claude; Codex checks its native continuation inside its host.
  readonly savedWorkspace?: string;
};

// Admits an upgrade to one session, or throws the `RefusedRequest` it gets.
export type AdmitTerminal = (
  req: IncomingMessage,
  url: URL,
) => Promise<TerminalSession>;

// A refused upgrade gets a plain HTTP answer on its raw socket, and no
// WebSocket.
function refuseUpgrade(socket: Duplex, { status, message }: RefusedRequest) {
  if (socket.destroyed) {
    return;
  }
  const body = JSON.stringify({ error: message });
  socket.end(
    `HTTP/1.1 ${String(status)} ${STATUS_CODES[status] ?? ""}\r\n` +
      "Connection: close\r\n" +
      "Cache-Control: no-store\r\n" +
      "Content-Type: application/json\r\n" +
      `Content-Length: ${String(Buffer.byteLength(body))}\r\n\r\n${body}`,
  );
}

export class AgentTerminals {
  private readonly sockets = new WebSocketServer({ noServer: true });
  private readonly attachments = new TerminalAttachments();
  private closed = false;
  private readonly httpServer: HttpServer | null;
  private readonly admit: AdmitTerminal;

  // Takes upgrades to this boundary's own path from `httpServer` (null in
  // Vite's middleware mode, which has none); every other upgrade, such as
  // Vite's HMR socket, is left to its own listener.
  constructor(httpServer: HttpServer | null, admit: AdmitTerminal) {
    this.httpServer = httpServer;
    this.admit = admit;
    httpServer?.on("upgrade", this.onUpgrade);
  }

  private readonly onUpgrade = (
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer,
  ) => {
    const url = new URL(req.url ?? "", "http://placeholder");
    if (url.pathname !== agentTerminalEndpoint) {
      return;
    }
    // A client may reset the connection while it is being admitted.
    socket.on("error", () => {});
    this.admit(req, url).then(
      (session) => {
        this.attach(req, socket, head, session);
      },
      (error: unknown) => {
        refuseUpgrade(
          socket,
          error instanceof RefusedRequest
            ? error
            : new RefusedRequest(500, "The session could not be attached."),
        );
      },
    );
  };

  // Takes an admitted upgrade as one attachment to this session.
  private attach(
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer,
    session: TerminalSession,
  ): void {
    if (this.closed || socket.destroyed) {
      socket.destroy();
      return;
    }
    this.sockets.handleUpgrade(req, socket, head, (ws) => {
      if (session.session.host === "cursor") {
        void bridgeCursorTerminal(ws, session);
        return;
      }
      this.attachments.connect(ws, session);
    });
  }

  type(session: SessionReference, input: string): boolean {
    return this.attachments.type(session, input);
  }

  endAttachments(session: SessionReference): void {
    this.attachments.endAttachments(session);
  }

  close(): void {
    this.closed = true;
    this.httpServer?.off("upgrade", this.onUpgrade);
    this.attachments.close();
    for (const ws of this.sockets.clients) {
      ws.terminate();
    }
    this.sockets.close();
  }
}
