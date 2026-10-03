// The machine-local Cursor runner. The dashboard starts this process in its
// own session when nothing is already accepting, and does not signal it on
// the way out. SIGTERM hangs up the clients this process holds and exits.
import http from "node:http";
import { existsSync } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { WebSocketServer } from "ws";
import type { CursorSession } from "../../../src/launchRecord.ts";
import type { TerminalSession } from "../../agentTerminals.ts";
import { keptSession, updateRecord } from "../../launchRecordStore.ts";
import { TerminalAttachments } from "../../terminalAttachments.ts";
import { execCursor } from "./exec.ts";
import {
  cursorRunnerAddressFile,
  cursorRunnerDirectory,
  readCursorRunnerAddress,
} from "./runnerPaths.ts";
import {
  cursorRunnerAttachSession,
  cursorRunnerExecRequest,
  cursorRunnerKeepRequest,
} from "./runnerProtocol.ts";
import { cursorKeptTerminal, spawnCursorPty } from "./terminal.ts";

const attachments = new TerminalAttachments();
const directory = cursorRunnerDirectory();
let stopping = false;

async function readJson(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const piece = chunk as Buffer;
    size += piece.length;
    if (size > 1_000_000) throw new Error("The request is too large.");
    chunks.push(piece);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(
  res: http.ServerResponse,
  status: number,
  body: unknown,
): void {
  if (res.writableEnded) return;
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function confirmInstruction(
  sourceId: string,
  session: CursorSession,
  instruction: string,
): Promise<void> {
  const kept = await keptSession(sourceId, session);
  if (kept === undefined || kept.firstInput?.state === "confirmed") return;
  await updateRecord(sourceId, {
    ...kept,
    firstInput: { state: "confirmed", instruction },
  });
}

async function publishAddress(port: number): Promise<void> {
  await mkdir(directory, { recursive: true });
  const file = cursorRunnerAddressFile();
  const temporary = `${file}.${String(process.pid)}.tmp`;
  await writeFile(
    temporary,
    JSON.stringify({ port, pid: process.pid }),
    "utf8",
  );
  await rename(temporary, file);
}

async function shutdown(): Promise<void> {
  if (stopping) return;
  stopping = true;
  attachments.close();
  const current = readCursorRunnerAddress();
  if (current?.pid === process.pid) {
    await rm(cursorRunnerAddressFile(), { force: true });
  }
  server.close();
  process.exit(0);
}

const server = http.createServer((req, res) => {
  void answer(req, res).catch(() => {
    sendJson(res, 400, { kind: "failed" });
  });
});

async function answer(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 404, { kind: "failed" });
    return;
  }
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (url.pathname === "/exec") {
    const body = cursorRunnerExecRequest.parse(await readJson(req));
    const abort = new AbortController();
    req.on("close", () => {
      if (!res.writableEnded) abort.abort();
    });
    const run = await execCursor(body.args, body.cwd, abort.signal);
    sendJson(res, 200, {
      failed: run.error !== null,
      ...(typeof run.error?.code === "string"
        ? { errorCode: run.error.code }
        : {}),
      stdout: run.stdout,
      stderr: run.stderr,
    });
    return;
  }
  if (url.pathname !== "/keep") {
    sendJson(res, 404, { kind: "failed" });
    return;
  }
  const body = cursorRunnerKeepRequest.parse(await readJson(req));
  if (body.session.host !== "cursor") {
    sendJson(res, 400, { kind: "failed" });
    return;
  }
  let pty;
  try {
    pty = spawnCursorPty(body.command, body.args, body.cwd, {
      cols: body.cols,
      rows: body.rows,
    });
  } catch (error) {
    sendJson(res, 200, {
      kind:
        (error as NodeJS.ErrnoException).code === "ENOENT"
          ? "missing"
          : "failed",
    });
    return;
  }
  const session = body.session;
  try {
    await attachments.keep(session, pty, {
      instruction: body.instruction,
      ...cursorKeptTerminal,
      onEntered: () =>
        confirmInstruction(body.sourceId, session, body.instruction),
    });
  } catch {
    sendJson(res, 200, { kind: "failed" });
    return;
  }
  sendJson(res, 200, { kind: "kept" });
}

const sockets = new WebSocketServer({
  noServer: true,
  perMessageDeflate: false,
});

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (url.pathname !== "/attach") {
    socket.destroy();
    return;
  }
  let session: TerminalSession;
  try {
    const encoded = url.searchParams.get("session");
    if (encoded === null) throw new Error("Missing session.");
    const parsed = cursorRunnerAttachSession.parse(
      JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")),
    );
    if (parsed.session.host !== "cursor") throw new Error("Not Cursor.");
    session = parsed;
  } catch {
    socket.destroy();
    return;
  }
  sockets.handleUpgrade(req, socket, head, (ws) => {
    attachments.connect(ws, session);
  });
});

process.on("SIGTERM", () => {
  void shutdown();
});
process.on("SIGINT", () => {
  void shutdown();
});

await mkdir(directory, { recursive: true });
await new Promise<void>((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    resolve();
  });
});
const listening = server.address();
if (listening === null || typeof listening === "string") {
  throw new Error("The Cursor runner did not bind a port.");
}
await publishAddress(listening.port);

// A removed machine directory cannot keep this address. Stop the clients
// rather than leave them after the records they belong with are gone.
const watch = setInterval(() => {
  if (!existsSync(directory)) void shutdown();
}, 500);
watch.unref();
