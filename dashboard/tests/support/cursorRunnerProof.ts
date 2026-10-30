// Fixture and stand-ins for the runner build-proof boundary proof: a
// fake-Cursor home and workspace, a real runner kept through it, a
// stand-in runner answering the wire protocol, and a bridged terminal.
import { spawn, type ChildProcess } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { WebSocket, WebSocketServer } from "ws";
import { expect } from "../support/pageTest.ts";
import {
  execOnRunner,
  keepCursorClient,
  stopCursorRunner,
} from "../../server/hosts/cursor/runnerClient.ts";
import { writeRunnerAddress } from "./cursorRunnerRecordedAddress.ts";
import { bridgeCursorTerminal } from "../../server/hosts/cursor/terminalBridge.ts";
import type { TerminalSession } from "../../server/agentTerminals.ts";
import { installFakeCursor, type FakeCursor } from "./fakeCursor.ts";

export type RunnerProofFixture = {
  readonly root: string;
  readonly home: string;
  readonly workspace: string;
  readonly cursor: FakeCursor;
  restore: () => Promise<void>;
};

export function startRunnerProofFixture(): RunnerProofFixture {
  const cursor = installFakeCursor({ working: true });
  const root = mkdtempSync(path.join(tmpdir(), "dough-runner-proof-"));
  const home = path.join(root, "home");
  const workspace = path.join(root, "workspace");
  mkdirSync(home, { recursive: true });
  mkdirSync(workspace, { recursive: true });
  const keys = ["HOME", "PATH", ...Object.keys(cursor.env)];
  const previous = new Map(keys.map((key) => [key, process.env[key]]));
  process.env["HOME"] = home;
  process.env["PATH"] = [cursor.binDir, previous.get("PATH") ?? ""].join(
    path.delimiter,
  );
  for (const [key, value] of Object.entries(cursor.env)) {
    process.env[key] = value;
  }
  return {
    root,
    home,
    workspace,
    cursor,
    restore: async () => {
      await stopCursorRunner(home).catch(() => undefined);
      for (const [key, value] of previous) {
        if (value === undefined) Reflect.deleteProperty(process.env, key);
        else process.env[key] = value;
      }
      cursor.cleanup();
      rmSync(root, { recursive: true, force: true });
    },
  };
}

export function cursorProofSession(
  fixture: RunnerProofFixture,
  sessionId = fixture.cursor.sessionId,
) {
  const args = [
    "--workspace",
    fixture.workspace,
    "--resume",
    sessionId,
  ] as const;
  return {
    host: "cursor" as const,
    sessionId,
    name: "proof",
    continuation: {
      workspace: fixture.workspace,
      args: ["cursor-agent", ...args],
    },
  };
}

export async function keepWorkingClient(
  fixture: RunnerProofFixture,
  sessionId = fixture.cursor.sessionId,
): Promise<void> {
  const kept = await keepCursorClient(
    {
      command: "cursor-agent",
      args: ["--workspace", fixture.workspace, "--resume", sessionId],
      cwd: fixture.workspace,
      cols: 80,
      rows: 24,
      sourceId: "open-dough",
      session: cursorProofSession(fixture, sessionId),
      instruction: "",
    },
    fixture.home,
  );
  expect(kept).toMatchObject({ kind: "kept" });
}

export function createChatOnRunner(fixture: RunnerProofFixture) {
  return execOnRunner(
    ["create-chat"],
    fixture.workspace,
    new AbortController().signal,
    fixture.home,
  );
}

const standInSource = `
import http from "node:http";
import { writeFileSync } from "node:fs";
const mode = process.argv[2];
const portFile = process.argv[3];
const server = http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    res.writeHead(200, { "content-type": "application/json" });
    if (req.method === "GET" && req.url === "/sessions") {
      res.end(JSON.stringify(mode === "wrong" ? { buildId: "stale-build", sessions: [] } : { sessions: [] }));
      return;
    }
    if (req.url === "/exec") {
      res.end(JSON.stringify({ failed: false, stdout: "stand-in\\n", stderr: "" }));
      return;
    }
    res.end(JSON.stringify({ kind: "failed" }));
  });
});
server.listen(0, "127.0.0.1", () => {
  writeFileSync(portFile, String(server.address().port));
});
`;

export async function startStandInRunner(
  fixture: RunnerProofFixture,
  mode: "wrong" | "missing",
): Promise<{ child: ChildProcess; pid: number }> {
  const script = path.join(fixture.root, `stand-in-${mode}.mjs`);
  const portFile = path.join(fixture.root, `stand-in-${mode}.port`);
  writeFileSync(script, standInSource);
  const child = spawn(process.execPath, [script, mode, portFile], {
    stdio: "ignore",
  });
  await expect
    .poll(() => {
      try {
        return Number(readFileSync(portFile, "utf8")) > 0;
      } catch {
        return false;
      }
    })
    .toBe(true);
  const port = Number(readFileSync(portFile, "utf8"));
  const pid = child.pid;
  if (pid === undefined) throw new Error("Stand-in has no pid.");
  writeRunnerAddress(fixture, {
    port,
    pid,
    ...(mode === "wrong" ? { buildId: "stale-build" } : {}),
  });
  return { child, pid };
}

export async function bridgedProofTerminal(
  fixture: RunnerProofFixture,
  sessionId: string,
): Promise<{ output: () => string; close: () => Promise<void> }> {
  const session: TerminalSession = {
    sourceId: "open-dough",
    session: cursorProofSession(fixture, sessionId),
    markedDone: false,
    folder: { path: fixture.workspace, shown: fixture.workspace },
  };
  const sockets = new WebSocketServer({ port: 0, host: "127.0.0.1" });
  await new Promise<void>((resolve) => {
    sockets.once("listening", () => {
      resolve();
    });
  });
  const address = sockets.address();
  if (address === null || typeof address === "string") {
    throw new Error("No bridge port.");
  }
  sockets.on("connection", (ws) => {
    void bridgeCursorTerminal(ws, session, fixture.home);
  });
  const browser = new WebSocket(`ws://127.0.0.1:${String(address.port)}`);
  let output = "";
  browser.on("message", (data: Buffer) => {
    output += data.toString("utf8");
  });
  await new Promise<void>((resolve, reject) => {
    browser.once("open", () => {
      resolve();
    });
    browser.once("error", reject);
  });
  return {
    output: () => output,
    close: async () => {
      browser.close();
      await new Promise<void>((resolve) => {
        sockets.close(() => {
          resolve();
        });
      });
    },
  };
}
