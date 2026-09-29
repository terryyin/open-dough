// The terminal boundary's WebSocket upgrades and attachments, mounted by the
// launch boundary (`./agentLaunchPlugin.ts`), which admits a recorded session
// first (`./agentLaunches.ts`); a refused upgrade gets an HTTP error and no
// socket. One socket is one attachment: opening it runs
// `claude attach <short id>` in the project folder through a PTY
// (`./claudeCode.ts`), the process's output goes out as text frames, and the
// page's messages (`../src/agentTerminal.ts`) become its input or its size.
// Anything else closes the socket. Closing the socket from either side, or
// closing the server, ends that attach process, which detaches only: the
// session keeps running. Nothing else is ever run here, and never a shell.

import { STATUS_CODES, type IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import type { IPty } from "@lydell/node-pty";
import type { HttpServer } from "vite";
import { WebSocketServer, type RawData, type WebSocket } from "ws";
import {
  agentTerminalEndpoint,
  terminalMessageSchema,
  type TerminalMessage,
} from "../src/agentTerminal.ts";
import { attachClaude } from "./claudeCode.ts";
import { RefusedRequest } from "./localOrigin.ts";
import type { ProjectFolder } from "./projectFolders.ts";

// The one recorded session an admitted upgrade attaches to.
export type TerminalSession = {
  readonly shortId: string;
  readonly folder: ProjectFolder;
};

// Admits an upgrade to one session, or throws the `RefusedRequest` it gets.
export type AdmitTerminal = (
  req: IncomingMessage,
  url: URL,
) => Promise<TerminalSession>;

// Until the page sends its own size.
const initialSize = { cols: 80, rows: 24 } as const;

// WebSocket close codes (RFC 6455): a message this boundary does not accept,
// and an attach process that could not start.
const notTerminalMessage = 1008;
const attachFailed = 1011;

function terminalMessage(
  data: RawData,
  isBinary: boolean,
): TerminalMessage | undefined {
  if (isBinary) {
    return undefined;
  }
  try {
    const parsed = terminalMessageSchema.safeParse(
      JSON.parse((data as Buffer).toString("utf8")),
    );
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

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
  // Each attach process still running, ended by its socket's close.
  private readonly attached = new Set<IPty>();
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
      this.connect(ws, session);
    });
  }

  private connect(ws: WebSocket, session: TerminalSession): void {
    let pty: IPty;
    try {
      pty = attachClaude(session.shortId, session.folder, initialSize);
    } catch {
      ws.close(attachFailed, "Claude Code could not be attached.");
      return;
    }
    this.attached.add(pty);
    pty.onData((output) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(output);
      }
    });
    pty.onExit(() => {
      this.attached.delete(pty);
      ws.close();
    });
    ws.on("message", (data, isBinary) => {
      const message = terminalMessage(data, isBinary);
      if (message === undefined) {
        ws.close(notTerminalMessage, "Not a terminal message.");
      } else if (this.attached.has(pty)) {
        if ("input" in message) {
          pty.write(message.input);
        } else {
          pty.resize(message.resize.cols, message.resize.rows);
        }
      }
    });
    ws.on("close", () => {
      this.detach(pty);
    });
  }

  // SIGHUP, as a closed terminal sends: Claude Code detaches and the session
  // keeps running.
  private detach(pty: IPty): void {
    if (!this.attached.delete(pty)) {
      return;
    }
    try {
      pty.kill("SIGHUP");
    } catch {
      // Already gone.
    }
  }

  // Ends every attach process and its socket when the server closes.
  close(): void {
    this.closed = true;
    this.httpServer?.off("upgrade", this.onUpgrade);
    for (const pty of [...this.attached]) {
      this.detach(pty);
    }
    for (const ws of this.sockets.clients) {
      ws.terminate();
    }
    this.sockets.close();
  }
}
