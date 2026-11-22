// Refresh keeps a launch's coverage gaps current: a session read again
// replaces the gaps it recorded, so usage missing at one Refresh stops marking
// the launch partial once a later one finds it. Each Claude response is the
// transcript builder's counted Opus response with 100 output tokens, weighing
// 1,950 input tokens.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  nativeFile,
  readImported,
  runImport,
  writeClaudeSession,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";
import {
  day,
  expect,
  finished as codexLaunch,
  rootRollout,
  sol,
  test,
  usageServer,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

const reference = (at: number) =>
  `ca7430bd-0d52-499d-a1bd-${String(at).padStart(12, "0")}`;
// Launch `at` of a Claude story in session `claude-<at>`.
const launch = (at: number) =>
  makeMe.aLaunchRecord
    .executing({ identity: `SEED-7#claude-${at}`, title: `Story ${at}` })
    .inClaudeSession({ sessionId: `claude-${at}` })
    .reportingThrough({
      origin: "http://localhost:4318",
      reference: reference(at),
      command: "report",
    });
const finished = (at: number) =>
  launch(at)
    .completedWith({ message: "", receivedAt: day(at) })
    .please();
const rootTranscript = (at: number) =>
  makeMe.aClaudeTranscript
    .forSession(`claude-${at}`)
    .withLaunchInput({ reference: reference(at), command: "report" });
const answered = (at: number) =>
  rootTranscript(at)
    .withCountedOpusResponse({ uuid: `root-${at}`, outputTokens: 100 })
    .please();

// The home's Claude projects root, imported with launches `1…count`, each
// answered once; refreshed once so later Refreshes read only what changes.
async function importedLaunches(
  machine: Parameters<typeof usageServer>[0],
  count: number,
) {
  const { home } = machine;
  const projects = path.join(home, ".claude/projects"),
    transcripts = path.join(projects, "open-dough");
  const imported = [...Array<number>(count).keys()].map((at) => at + 1);
  keepLaunchStore(home, { "open-dough": imported.map(finished) });
  for (const at of imported) writeClaudeSession(transcripts, answered(at));
  runImport(home, path.join(home, ".codex/sessions"), [
    "--claude-root",
    projects,
  ]);
  const usage = await usageServer(machine);
  await usage.refresh();
  const coverage = async (identity: string) =>
    (await usage.chart("?tool=claude")).tasks.find(
      (task) => task.identity === identity,
    )?.coverage;
  return { imported, transcripts, usage, coverage };
}

test("a Claude launch refreshed before its first response is partial until a later Refresh finds its response, then joins the rolling median", async ({
  machine,
}) => {
  const { imported, transcripts, usage, coverage } = await importedLaunches(
    machine,
    9,
  );
  // Launch 10 runs; its transcript holds only its launch input.
  keepLaunchStore(machine.home, {
    "open-dough": [...imported.map(finished), launch(10).please()],
  });
  writeClaudeSession(transcripts, rootTranscript(10).please());
  await usage.refresh();
  const rootGaps = () =>
    readImported(machine.home)
      .gaps.filter(({ sessionId }) => sessionId === "claude-10")
      .map(({ code }) => code);
  // A running launch is not charted; the store records its missing usage.
  expect(rootGaps()).toEqual([
    "auxiliary-usage-not-covered",
    "missing-root-transcript-usage",
  ]);

  writeClaudeSession(transcripts, answered(10));
  keepLaunchStore(machine.home, {
    "open-dough": [...imported, 10].map(finished),
  });
  await usage.refresh();
  expect(rootGaps()).toEqual(["auxiliary-usage-not-covered"]);
  expect(await coverage("SEED-7#claude-10")).toEqual({ kind: "measured" });
  // Ten measured launches of 1,950 each: the one median point, at and
  // anchored on the tenth.
  const refreshed = await usage.chart("?tool=claude");
  const tenth = refreshed.tasks.find(
    ({ identity }) => identity === "SEED-7#claude-10",
  );
  expect(refreshed.average).toEqual([
    { at: day(10), task: tenth?.id, value: 1_950 },
  ]);
});

test("a Claude worker that answers after a Refresh clears its gap, while a worker it spawned whose transcript stays missing keeps the launch partial", async ({
  machine,
}) => {
  const { imported, transcripts, usage, coverage } = await importedLaunches(
    machine,
    1,
  );
  keepLaunchStore(machine.home, {
    "open-dough": [...imported, 2].map(finished),
  });
  writeClaudeSession(
    transcripts,
    rootTranscript(2)
      .withCountedOpusResponse({ uuid: "root-2", outputTokens: 100 })
      .withWorkerResult({ agentId: "worker" })
      .please(),
  );
  const workerTranscript = makeMe.aClaudeTranscript
    .forSession("claude-2")
    .asSidechain({ agentId: "worker" })
    .withUser({ uuid: "worker-input", parentUuid: null, content: "work" });
  const subagents = path.join(transcripts, "claude-2", "subagents");
  nativeFile(subagents, "agent-worker", workerTranscript.please());
  await usage.refresh();
  expect(await coverage("SEED-7#claude-2")).toEqual({
    kind: "partial",
    gaps: ["incomplete-worker-evidence"],
  });

  // The worker answers and spawns a worker of its own, whose transcript is
  // gone: its gap lies in the worker's transcript under `subagents/`.
  nativeFile(
    subagents,
    "agent-worker",
    workerTranscript
      .withCountedOpusResponse({ uuid: "worker", outputTokens: 100 })
      .withWorkerResult({ agentId: "nested" })
      .please(),
  );
  await usage.refresh();
  expect(await coverage("SEED-7#claude-2")).toEqual({
    kind: "partial",
    gaps: ["missing-worker-evidence"],
  });

  // The nested worker's transcript arrives with its response.
  nativeFile(
    subagents,
    "agent-nested",
    makeMe.aClaudeTranscript
      .forSession("claude-2")
      .asSidechain({ agentId: "nested" })
      .withUser({ uuid: "nested-input", parentUuid: null, content: "work" })
      .withCountedOpusResponse({ uuid: "nested", outputTokens: 100 })
      .please(),
  );
  await usage.refresh();
  expect(await coverage("SEED-7#claude-2")).toEqual({ kind: "measured" });
});

test("a Codex session refreshed before its first response loses its no-response gap once a later Refresh reads its response", async ({
  machine,
}) => {
  const { home } = machine;
  const sessions = path.join(home, ".codex/sessions"),
    rollouts = path.join(sessions, "2026/11/14");
  keepLaunchStore(home, { "open-dough": [codexLaunch("first")] });
  writeCodexSession(rollouts, rootRollout("first", 100).please());
  runImport(home, sessions);
  const usage = await usageServer(machine);
  await usage.refresh();

  keepLaunchStore(home, {
    "open-dough": [codexLaunch("first"), codexLaunch("second")],
  });
  writeCodexSession(
    rollouts,
    makeMe.aCodexRollout
      .forSession("second")
      .withTurnContext("second-turn", sol, "xhigh")
      .please(),
  );
  await usage.refresh();
  const second = async () =>
    (await usage.chart()).tasks.find(
      ({ identity }) => identity === "SEED-7#second",
    )?.coverage;
  expect(await second()).toEqual({
    kind: "partial",
    gaps: ["no-response-usage-evidence", "no-attributable-response-usage"],
  });

  writeCodexSession(rollouts, rootRollout("second", 200).please());
  await usage.refresh();
  expect(await second()).toEqual({ kind: "measured" });
});
