import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { executionCheckout } from "../../server/executionCheckout.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { bindRecord, keptRecords } from "../../server/launchRecordStore.ts";
import { machineFolder, type LocalFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { TerminalAttachments } from "../../server/terminalAttachments.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import {
  fakeClaudeHost,
  installFakeClaude,
} from "../../test-support/support/fakeClaude.ts";
import {
  codexEndpoint,
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";

const source = makeMe.aPublishedSource.openDough.please();

let machine: string;
let folder: LocalFolder;
let marks: NativeDoneMarks;
let launches: AgentLaunches;

beforeEach(() => {
  machine = realpathSync(mkdtempSync(path.join(tmpdir(), "dough-races-")));
  vi.stubEnv("HOME", path.join(machine, "home"));
  const unmount = mountProjectConfiguration("production");
  folder = executionCheckout(source);
  const terminals = new TerminalAttachments();
  marks = new NativeDoneMarks({
    terminals,
    hostFor: launchHost,
    reportingFolder: machineFolder,
  });
  launches = new AgentLaunches(marks);
  onTestFinished(async () => {
    await marks.close();
    terminals.close();
    launches.close();
    await launches.drain();
    unmount();
    vi.unstubAllEnvs();
    rmSync(machine, { recursive: true, force: true });
  });
  mkdirSync(folder.path, { recursive: true });
});

async function keepConversation() {
  const native = await installFakeCodex(machine, process.env.PATH ?? "", true);
  onTestFinished(() => native.close());
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  native.cwd = folder.path;
  const record = makeMe.aLaunchRecord
    .refining({ identity: "SEED-867#codex-race", title: "Refine" })
    .inCodexSession({
      sessionId: native.threadId,
      continuation: { endpoint: codexEndpoint(native), workspace: folder.path },
    })
    .please();
  await bindRecord(source.id, record);
  return { native, record };
}

const interruptions = (native: FakeCodex) =>
  native.calls
    .filter(({ method }) => method === "turn/interrupt")
    .map(({ params }) => params);

async function expectKeptDone(marked: LaunchRecord) {
  expect(Date.parse(marked.doneAt ?? "")).not.toBeNaN();
  const [kept] = await keptRecords(source.id);
  expect(kept).toMatchObject({
    session: marked.session,
    doneAt: marked.doneAt,
  });
  expect(kept?.doneProblem).toBe(marked.doneProblem);
}

for (const refusal of ["rename", "interrupt"] as const) {
  test(`${refusal} refusal preserves local intent and actual working/interrupted outcome`, async () => {
    const { native, record } = await keepConversation();
    native.observations.set(native.threadId, {
      status: { type: "active", activeFlags: [] },
      turns: [{ id: "running-turn", status: "inProgress" }],
    });
    const error = { code: -32000, message: `Native ${refusal} refused.` };
    if (refusal === "rename") native.renameError = error;
    else native.interruptError = error;

    const marked = await marks.markDone(source, record, folder, launches);

    const operation = refusal === "interrupt" ? "stop" : "rename";
    expect(marked.doneProblem).toContain(
      `Codex ${operation} failed: ${error.message}`,
    );
    expect((await launches.stateOf(source, marked)).sessionState).toMatchObject(
      {
        kind: "available",
        activity: refusal === "interrupt" ? "working" : "interrupted",
      },
    );
    expect(interruptions(native)).toEqual([
      { threadId: native.threadId, turnId: "running-turn" },
    ]);
    await expectKeptDone(marked);
  });
}

test("a turn finishing during interruption never redirects the request to a newer turn", async () => {
  const { native, record } = await keepConversation();
  const observed = { id: "observed-turn", status: "inProgress" };
  const turns = [observed];
  native.observations.set(native.threadId, {
    status: { type: "active", activeFlags: [] },
    turns,
  });
  native.beforeInterrupt = () => {
    observed.status = "completed";
    turns.push({ id: "newer-turn", status: "inProgress" });
  };

  const marked = await marks.markDone(source, record, folder, launches);

  expect(marked.doneProblem).toContain(
    "expected active turn id observed-turn but found newer-turn",
  );
  expect((await launches.stateOf(source, marked)).sessionState).toMatchObject({
    kind: "available",
    activity: "working",
  });
  expect(interruptions(native)).toEqual([
    { threadId: native.threadId, turnId: observed.id },
  ]);
  expect(turns.find(({ id }) => id === "newer-turn")?.status).toBe(
    "inProgress",
  );
  await expectKeptDone(marked);
});

test.each([
  {
    title:
      "active metadata followed by a completed latest turn never invents an interrupt target",
    nativeOutcome: { turns: [{ id: "finished-turn", status: "completed" }] },
    problem: undefined,
  },
  {
    title:
      "an unreadable active-turn identity remains unknown rather than a guessed stop",
    nativeOutcome: {
      turns: [],
      historyError: { code: -32601, message: "Latest turn unreadable." },
    },
    problem:
      "Local done mark retained. Codex stop failed: Latest turn unreadable.",
  },
])("$title", async ({ nativeOutcome, problem }) => {
  const { native, record } = await keepConversation();
  native.observations.set(native.threadId, {
    ...nativeOutcome,
    status: { type: "active", activeFlags: [] },
  });

  const marked = await marks.markDone(source, record, folder, launches);

  expect(
    native.calls.filter(({ method }) => method === "thread/turns/list"),
  ).toMatchObject([{ params: { threadId: native.threadId } }]);
  expect(interruptions(native)).toEqual([]);
  expect(marked.doneProblem).toBe(problem);
  expect((await launches.stateOf(source, marked)).sessionState).toMatchObject({
    kind: "available",
    activity: "working",
  });
  await expectKeptDone(marked);
});

test("shared Claude stop failure retains intent and current Working without exposing raw subprocess errors", async () => {
  const claude = installFakeClaude(
    machine,
    { binDir: machine, path: process.env.PATH ?? "" },
    {},
  );
  for (const [key, value] of Object.entries(claude.env)) vi.stubEnv(key, value);
  const executable = path.join(machine, fakeClaudeHost.binDir, "claude");
  const privateDetail = "private-native-subprocess-detail";
  // The installed fake can be a hard link. Move that link before substituting stop.
  renameSync(executable, `${executable}-fixture.cjs`);
  writeFileSync(
    executable,
    `#!/usr/bin/env node
if (process.argv[2] === "stop") {
  require("node:fs").appendFileSync(require("node:path").join(process.env.FAKE_CLAUDE_DIR, "calls.jsonl"), JSON.stringify({ argv: process.argv.slice(2), cwd: process.cwd() }) + "\\n");
  process.stderr.write(${JSON.stringify(privateDetail)});
  process.exit(1);
}
require("./claude-fixture.cjs");
`,
    { mode: 0o755 },
  );
  const sessionId = "588c4c19-0000-4000-8000-000000000007";
  const shortId = sessionId.slice(0, 8);
  const record = makeMe.aLaunchRecord
    .executing({ identity: "SEED-867#stop-fails", title: "Finish" })
    .inClaudeSession({ sessionId, shortId })
    .please();
  await bindRecord(source.id, record);
  claude.controls.claudeListingBecomes([
    makeMe.aClaudeListingRow
      .background({
        sessionId,
        name: record.session.name,
        cwd: folder.path,
        startedAt: Date.parse(record.launchedAt),
      })
      .as("working-idle")
      .please(),
  ]);

  const marked = await marks.markDone(source, record, folder, launches);
  const observed = await launches.stateOf(source, marked);

  expect(observed.doneProblem).toBe(
    "Local done mark retained. Claude Code stop failed: The native operation could not be confirmed.",
  );
  expect(observed.sessionState).toMatchObject({
    kind: "available",
    activity: "working",
  });
  expect(JSON.stringify(observed)).not.toContain(privateDetail);
  expect(claude.controls.claudeStopCalls()).toEqual([
    { argv: ["stop", shortId], cwd: folder.path },
  ]);
  await expectKeptDone(marked);
});
