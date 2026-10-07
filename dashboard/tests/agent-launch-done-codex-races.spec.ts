// Refusal/race substitutions supply vendor replies, never local done semantics.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { launched } from "./agentTerminalBoundary.ts";
import { test, expect, stored } from "./support/codexLaunch.ts";
import { launch, refinementRequest, markDone } from "./agentLaunchBoundary.ts";
import { repoRoot } from "./support/repositoryRoot.ts";

test.use({ projectFolders: ["open-dough"] });
for (const refusal of ["rename", "interrupt"] as const) {
  test(`${refusal} refusal preserves local intent and actual working/interrupted outcome`, async ({
    dashboard,
    codexProtocol,
  }) => {
    const native = codexProtocol;
    if (native === undefined) throw new Error("Missing native fixture");
    await launch(dashboard, { ...refinementRequest, host: "codex" });
    native.observations.set(native.threadId, {
      status: { type: "active", activeFlags: [] },
      turns: [{ id: "running-turn", status: "inProgress" }],
    });
    const error = { code: -32000, message: `Native ${refusal} refused.` };
    if (refusal === "rename") native.renameError = error;
    else native.interruptError = error;
    const response = await markDone(dashboard, {
      source: "open-dough",
      session: native.threadId,
      host: "codex",
    });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      record: {
        doneAt: expect.any(String),
        doneProblem: expect.stringContaining(`Native ${refusal} refused.`),
        sessionState: {
          kind: "available",
          activity: refusal === "interrupt" ? "working" : "interrupted",
        },
      },
    });
    expect(stored(dashboard.home)[0]?.doneAt).toBeDefined();
    expect(stored(dashboard.home)[0]?.doneProblem).toContain(
      `Codex ${refusal === "interrupt" ? "stop" : "rename"} failed`,
    );
    expect(
      native.calls.filter((call) => call.method === "turn/interrupt"),
    ).toEqual([
      {
        method: "turn/interrupt",
        params: { threadId: native.threadId, turnId: "running-turn" },
      },
    ]);
  });
}

test("a turn finishing during interruption never redirects the request to a newer turn", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  await launch(dashboard, { ...refinementRequest, host: "codex" });
  const observation = {
    status: { type: "active", activeFlags: [] },
    turns: [{ id: "observed-turn", status: "inProgress" }],
  };
  native.observations.set(native.threadId, observation);
  native.beforeInterrupt = (threadId, turnId) => {
    expect(threadId).toBe(native.threadId);
    expect(turnId).toBe("observed-turn");
    const first = observation.turns[0];
    if (first === undefined) throw new Error("Missing observed turn");
    first.status = "completed";
    observation.turns.push({ id: "newer-turn", status: "inProgress" });
  };
  const response = await markDone(dashboard, {
    source: "open-dough",
    session: native.threadId,
    host: "codex",
  });
  expect(response.status).toBe(200);
  expect(JSON.parse(response.body)).toMatchObject({
    record: {
      doneAt: expect.any(String),
      doneProblem: expect.stringContaining(
        "expected active turn id observed-turn but found newer-turn",
      ),
      sessionState: { kind: "available", activity: "working" },
    },
  });
  expect(
    native.calls.filter((call) => call.method === "turn/interrupt"),
  ).toEqual([
    {
      method: "turn/interrupt",
      params: { threadId: native.threadId, turnId: "observed-turn" },
    },
  ]);
  expect(observation.turns).toEqual([
    { id: "observed-turn", status: "completed" },
    { id: "newer-turn", status: "inProgress" },
  ]);
});

test("active metadata followed by a completed latest turn never invents an interrupt target", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  await launch(dashboard, { ...refinementRequest, host: "codex" });
  native.observations.set(native.threadId, {
    status: { type: "active", activeFlags: [] },
    turns: [{ id: "finished-turn", status: "completed" }],
  });
  const response = await markDone(dashboard, {
    source: "open-dough",
    session: native.threadId,
    host: "codex",
  });
  expect(response.status).toBe(200);
  expect(stored(dashboard.home)[0]?.doneAt).toBeDefined();
  expect(
    native.calls.filter((call) => call.method === "turn/interrupt"),
  ).toEqual([]);
});

test("an unreadable active-turn identity remains unknown rather than a guessed stop", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  await launch(dashboard, { ...refinementRequest, host: "codex" });
  native.observations.set(native.threadId, {
    status: { type: "active", activeFlags: [] },
    turns: [],
    historyError: { code: -32601, message: "Latest turn unreadable." },
  });
  const response = await markDone(dashboard, {
    source: "open-dough",
    session: native.threadId,
    host: "codex",
  });
  expect(response.status).toBe(200);
  expect(JSON.parse(response.body)).toMatchObject({
    record: {
      doneProblem: expect.stringContaining("Latest turn unreadable"),
      sessionState: { kind: "available", activity: "working" },
    },
  });
  expect(
    native.calls.filter((call) => call.method === "turn/interrupt"),
  ).toEqual([]);
});

test("shared Claude stop failure retains intent and current Working without exposing raw subprocess errors", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  // Native process substitute fails only stop; ordinary fixture supplies launch/listing.
  const fixturePath = path.join(
    repoRoot,
    "dashboard",
    "tests",
    "fixtures",
    "fake-claude",
  );
  writeFileSync(
    path.join(native.binDir, "claude"),
    `#!/usr/bin/env node
if (process.argv[2] === "stop") {
  require("node:fs").appendFileSync(require("node:path").join(process.env.FAKE_CLAUDE_DIR, "calls.jsonl"), JSON.stringify({ argv: process.argv.slice(2), cwd: process.cwd() }) + "\\n");
  process.stderr.write("private-native-subprocess-detail");
  process.exit(1);
}
require(${JSON.stringify(fixturePath)});
`,
    { mode: 0o755 },
  );
  const session = await launched(dashboard);
  // Idle between steps, so the rename succeeds and only the stop fails.
  dashboard.claudeSessionBecomes(session.sessionId, "working-idle");
  const response = await markDone(dashboard, {
    source: "open-dough",
    session: session.sessionId,
  });
  expect(response.status).toBe(200);
  expect(JSON.parse(response.body)).toMatchObject({
    record: {
      doneAt: expect.any(String),
      doneProblem:
        "Local done mark retained. Claude Code stop failed: The native operation could not be confirmed.",
      sessionState: { kind: "available", activity: "working" },
    },
  });
  expect(response.body).not.toContain("private-native-subprocess-detail");
  expect(stored(dashboard.home)[0]?.doneAt).toBeDefined();
  expect(dashboard.claudeStopCalls()).toHaveLength(1);
});
