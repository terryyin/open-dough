// One admitted session per WebSocket, attached through its host boundary.
// Socket/server closure detaches the PTY; output and input use the shared
// terminal protocol. A successful attachment clears a local done mark before
// exposing output; marking done can type into and end those attachments.

import { STATUS_CODES, type IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import type { IPty } from "@lydell/node-pty";
import type { HttpServer } from "vite";
import { WebSocketServer, type RawData, type WebSocket } from "ws";
import {
  agentTerminalEndpoint,
  terminalEndedCode,
  terminalMessageSchema,
  type TerminalMessage,
} from "../src/agentTerminal.ts";
import { launchHost } from "./launchHosts.ts";
import type { HostSession } from "../src/agentLaunch.ts";
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import { setRecordDoneAt } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
import type { ProjectFolder } from "./projectFolders.ts";

// The one recorded session an admitted upgrade attaches to, in its project,
// and whether its record is marked done.
export type TerminalSession = {
  readonly sourceId: string;
  readonly session: HostSession;
  readonly markedDone: boolean;
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
  // Each attach process still running, oldest first, with the session it
  // attaches to and its socket, whose close ends it.
  private readonly attached = new Map<
    IPty,
    { readonly key: string; readonly ws: WebSocket }
  >();
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
    const host = launchHost(session.session.host);
    try {
      if (host?.attach === undefined) {
        throw new Error("This host cannot attach.");
      }
      pty = host.attach(session.session, session.folder, initialSize);
    } catch {
      ws.close(
        attachFailed,
        `${host?.name ?? session.session.host} could not be attached.`,
      );
      return;
    }
    this.attached.set(pty, { key: sessionKey(session.session), ws });
    // The attach has started, so a session marked done is reopened; a clear
    // that fails leaves it marked and the terminal attached.
    const reopened = session.markedDone
      ? setRecordDoneAt(session.sourceId, session.session, undefined).catch(
          () => undefined,
        )
      : Promise.resolve();
    pty.onData((output) => {
      void reopened.then(() => {
        if (ws.readyState === ws.OPEN) {
          ws.send(output);
        }
      });
    });
    // Exited on its own, not ended by `detach`, whose socket is already
    // closing.
    pty.onExit(() => {
      if (this.attached.delete(pty)) {
        void reopened.then(() => {
          ws.close(terminalEndedCode, "The terminal ended.");
        });
      }
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

  // Types `input` into the newest open attachment to this session, and
  // answers whether one was open.
  type(session: SessionReference, input: string): boolean {
    const newest = [...this.attached]
      .filter(([, attachment]) => attachment.key === sessionKey(session))
      .at(-1);
    newest?.[0].write(input);
    return newest !== undefined;
  }

  // Ends every attachment to this session: its attach process detaches, and
  // its socket closes as an ended terminal.
  endAttachments(session: SessionReference): void {
    for (const [pty, attachment] of [...this.attached]) {
      if (attachment.key === sessionKey(session)) {
        this.detach(pty);
        attachment.ws.close(terminalEndedCode, "The terminal ended.");
      }
    }
  }

  // Ends every attach process and its socket when the server closes.
  close(): void {
    this.closed = true;
    this.httpServer?.off("upgrade", this.onUpgrade);
    for (const pty of [...this.attached.keys()]) {
      this.detach(pty);
    }
    for (const ws of this.sockets.clients) {
      ws.terminate();
    }
    this.sockets.close();
  }
}
