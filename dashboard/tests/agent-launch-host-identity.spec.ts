// A predecessor Claude record and another host's equal opaque ID remain
// distinct across machine reads and host-qualified actions. No Codex runtime
// is substituted: its observation/control capabilities are not delivered yet.
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  deleteRecord,
  launchRequest,
  markDone,
  recordsOf,
} from "./agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import { rawRequest } from "./support/rawHttp.ts";

const sessionId = "same-native-conversation-id";

test("predecessor Claude evidence and an equal ID from another host retain distinct reads and actions without fallback", async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-host-records-"));
  const storeFile = path.join(
    machine,
    "home",
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
  const oldClaude = {
    request: launchRequest,
    session: {
      host: "claude",
      sessionId,
      shortId: "native-alias",
      name: "Predecessor",
    },
    launchedAt: new Date().toISOString(),
  };
  const other = {
    ...oldClaude,
    request: { ...launchRequest, host: "codex" },
    session: { host: "codex", sessionId, name: "Another host" },
  };
  mkdirSync(path.dirname(storeFile), { recursive: true });
  writeFileSync(
    storeFile,
    JSON.stringify({ "open-dough": [oldClaude, other] }),
  );
  const server = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine,
    projectFolders: ["open-dough"],
  });
  try {
    // Only the host that supports observation is listed; no observation of
    // the other conversation means unknown, never unlisted.
    expect(await recordsOf(server, "open-dough")).toEqual([
      { ...oldClaude, sessionState: { kind: "unlisted" } },
      { ...other, sessionState: { kind: "unknown" } },
    ]);
    const before = server.claudeCalls().length;
    const done = await markDone(server, {
      source: "open-dough",
      session: sessionId,
      host: "codex",
    });
    expect(done.status).toBe(400);
    const terminal = await rawRequest({
      url: `${server.baseURL}/__agent-terminal?source=open-dough&session=${sessionId}&host=codex`,
      headers: {
        Origin: server.origin,
        Connection: "Upgrade",
        Upgrade: "websocket",
        "Sec-WebSocket-Version": "13",
        "Sec-WebSocket-Key": "dGhlIHNhbXBsZSBub25jZQ==",
      },
    });
    expect(terminal.status).toBe(400);
    expect(
      server
        .claudeCalls()
        .slice(before)
        .filter((call) => call.argv[0] !== "agents"),
    ).toEqual([]);
    expect(server.claudeAttaches()).toEqual([]);

    // A predecessor action omitting host addresses Claude only. It writes
    // the valid store without quarantining old records or touching the other.
    expect(
      (await markDone(server, { source: "open-dough", session: sessionId }))
        .status,
    ).toBe(200);
    const marked = (
      JSON.parse(readFileSync(storeFile, "utf8")) as Record<string, unknown[]>
    )["open-dough"] as unknown[];
    expect(marked).toEqual([
      expect.objectContaining({ ...oldClaude, doneAt: expect.any(String) }),
      other,
    ]);
    expect(readdirSync(path.dirname(storeFile))).toEqual([
      "agent-launches.json",
    ]);
    const deleted = await deleteRecord(server, {
      source: "open-dough",
      session: sessionId,
      host: "codex",
    });
    expect(deleted.status).toBe(200);
    expect(JSON.parse(deleted.body)).toEqual({ kind: "deleted" });
    expect(
      (
        JSON.parse(readFileSync(storeFile, "utf8")) as Record<string, unknown[]>
      )["open-dough"],
    ).toEqual([marked[0]]);
  } finally {
    await server.close();
    rmSync(machine, { recursive: true, force: true });
  }
});
