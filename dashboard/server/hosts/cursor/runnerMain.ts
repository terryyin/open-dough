// The machine-local Cursor runner. The dashboard starts this process in its
// own session when nothing is already accepting, and does not signal it on
// the way out. SIGTERM hangs up the clients this process holds and exits.
import http from "node:http";
import { existsSync } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { WebSocketServer } from "ws";
import type { TerminalSession } from "../../agentTerminals.ts";
import { TerminalAttachments } from "../../terminalAttachments.ts";
import { cursorHeldLabel } from "../../../src/cursorHeldLabel.ts";
import { execCursor } from "./exec.ts";
import { cursorSessionLabel } from "./idleScreen.ts";
import { answerHangup, answerKeep } from "./runnerKeep.ts";
import { showsCursorWorkspaceTrust } from "./workspaceTrust.ts";
import {
  cursorRunnerAddressFile,
  cursorRunnerDirectory,
  cursorRunnerDirectoryVariable,
  readCursorRunnerAddress,
} from "./runnerPaths.ts";
import {
  cursorRunnerAttachSession,
  cursorRunnerExecRequest,
} from "./runnerProtocol.ts";
import { computeRunnerBuildId } from "./runnerBuild.ts";
import { cursorRunnerPublishedSpawnHelper } from "./runnerSpawnHelper.ts";

// The identity of the code this process is running, from the entry it was
// actually started with (process.argv[1], not import.meta.url, which
// bundles preserve as the original source location): the bundled file
// itself, or the source entry and its reached modules.
const buildId = computeRunnerBuildId(process.argv[1] ?? "");
const spawnHelper = cursorRunnerPublishedSpawnHelper();

const attachments = new TerminalAttachments();
// The starter passes the directory it created. This process's own HOME can
// be a different directory than that home, and the starter's directory can
// be removed while this process is still loading. Creating it again would
// leave the runner up after the home's owner has finished. An empty value
// is the same as an absent one: this process then uses its own home.
const suppliedStarterDirectory = process.env[cursorRunnerDirectoryVariable];
const starterDirectory =
  suppliedStarterDirectory !== undefined && suppliedStarterDirectory !== ""
    ? suppliedStarterDirectory
    : undefined;
const directory = starterDirectory ?? cursorRunnerDirectory();
let stopping = false;

async function prepareRunnerDirectory(): Promise<void> {
  if (starterDirectory !== undefined && !existsSync(starterDirectory)) {
    process.exit(0);
  }
  if (!existsSync(directory)) await mkdir(directory, { recursive: true });
}

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

async function publishAddress(port: number): Promise<void> {
  await prepareRunnerDirectory();
  const file = cursorRunnerAddressFile();
  const temporary = `${file}.${String(process.pid)}.tmp`;
  await writeFile(
    temporary,
    JSON.stringify({ port, pid: process.pid, buildId, spawnHelper }),
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
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  // A read of the clients already held. It starts no process.
  if (req.method === "GET" && url.pathname === "/sessions") {
    const held = await attachments.held();
    sendJson(res, 200, {
      buildId,
      spawnHelper,
      sessions: held.flatMap((client) => {
        if (client.session.host !== "cursor") return [];
        const label = cursorSessionLabel(client.screen);
        return [
          {
            session: client.session,
            label,
            workspaceTrust: showsCursorWorkspaceTrust(client.screen),
            // Only a waiting-labeled screen travels, so the dashboard's
            // Cursor boundary can extract a proved question from it.
            ...(label === cursorHeldLabel.waiting
              ? { screen: client.screen }
              : {}),
          },
        ];
      }),
    });
    return;
  }
  if (req.method !== "POST") {
    sendJson(res, 404, { kind: "failed" });
    return;
  }
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
  if (url.pathname === "/release-handoffs") {
    await readJson(req).catch(() => undefined);
    attachments.releaseHandoffs();
    sendJson(res, 200, { kind: "kept" });
    return;
  }
  if (url.pathname === "/hangup") {
    answerHangup(await readJson(req), attachments, (status, body) => {
      sendJson(res, status, body);
    });
    return;
  }
  if (url.pathname !== "/keep") {
    sendJson(res, 404, { kind: "failed" });
    return;
  }
  await answerKeep(await readJson(req), attachments, (status, body) => {
    sendJson(res, status, body);
  });
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

await prepareRunnerDirectory();
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
