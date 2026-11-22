// Refresh at its HTTP boundary over Claude Code transcripts under
// `<home>/.claude/projects`. Each response is the transcript builder's counted
// Opus response, weighing 1,450 + 5×O input tokens for O output tokens.
import { appendFileSync, cpSync, readFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import { usageTaskSummaryFile } from "../../server/usageTaskSummary.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  nativeFile,
  readImported,
  runImport,
  writeClaudeSession,
} from "../../test-support/usage-history/importHarness.ts";
import {
  day,
  expect,
  storedUsage,
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
// Session `claude-<at>`'s root transcript from its launch input.
const rootTranscript = (at: number) =>
  makeMe.aClaudeTranscript
    .forSession(`claude-${at}`)
    .withLaunchInput({ reference: reference(at), command: "report" });

// The home's Claude projects root, imported once with launch 1's session.
function importedOnce(home: string) {
  const projects = path.join(home, ".claude/projects"),
    transcripts = path.join(projects, "open-dough");
  keepLaunchStore(home, { "open-dough": [finished(1)] });
  writeClaudeSession(
    transcripts,
    rootTranscript(1)
      .withCountedOpusResponse({ uuid: "first", outputTokens: 100 })
      .please(),
  );
  runImport(home, path.join(home, ".codex/sessions"), [
    "--claude-root",
    projects,
  ]);
  return { projects, transcripts };
}

test("Refresh brings in a Claude launch finished since the last check with its worker, each response once, ignores a session no launch names, and changes nothing when repeated", async ({
  machine,
}) => {
  const { home } = machine;
  const { projects, transcripts } = importedOnce(home);
  const usage = await usageServer(machine);
  await usage.refresh();

  keepLaunchStore(home, { "open-dough": [finished(1), finished(2)] });
  writeClaudeSession(
    transcripts,
    rootTranscript(2)
      .withCountedOpusResponse({ uuid: "root", outputTokens: 100 })
      // The same API message written again in its transcript.
      .withCountedOpusResponse({
        uuid: "root-again",
        messageId: "msg-root",
        outputTokens: 100,
      })
      .withWorkerResult({ agentId: "worker" })
      .please(),
  );
  // Worker path under `subagents/` is layout under proof.
  nativeFile(path.join(transcripts, "claude-2", "subagents"), "agent-worker", [
    ...makeMe.aClaudeTranscript
      .forSession("claude-2")
      .asSidechain({ agentId: "worker" })
      .withUser({ uuid: "worker-input", parentUuid: null, content: "work" })
      .withCountedOpusResponse({ uuid: "worker", outputTokens: 300 })
      .please(),
  ]);
  writeClaudeSession(
    transcripts,
    makeMe.aClaudeTranscript
      .forSession("elsewhere")
      .withUser({ uuid: "own-input", parentUuid: null, content: "other work" })
      .withCountedOpusResponse({ uuid: "elsewhere", outputTokens: 900 })
      .please(),
  );
  await usage.refresh();

  const chart = await usage.chart("?tool=claude");
  expect(
    chart.tasks.map(({ identity, coverage, index }) => [
      identity,
      coverage.kind,
      index,
    ]),
  ).toEqual([
    ["SEED-7#claude-1", "measured", 1_950],
    // Root 1,450 + 5×100 and worker 1,450 + 5×300.
    ["SEED-7#claude-2", "measured", 4_900],
  ]);
  const refreshed = await storedUsage(home);
  // The root's response once and the worker's, both in the launch's session.
  expect(refreshed.get("SEED-7#claude-2")).toMatchObject([
    { root: true, responses: 2, tokens: { output: 400 } },
  ]);
  // Neither the unnamed session's usage nor its gaps are kept.
  const stored = readImported(home);
  expect(Object.keys(stored.sessions)).toEqual([
    "claude:claude-1",
    "claude:claude-2",
  ]);
  expect(stored.gaps.map(({ sessionId }) => sessionId)).not.toContain(
    "elsewhere",
  );

  // The offline import of the same transcripts stores the same usage.
  const imported = path.join(machine.machine, "imported-home");
  cpSync(home, imported, {
    recursive: true,
    filter: (source) => !path.basename(source).startsWith("usage"),
  });
  runImport(imported, path.join(imported, ".codex/sessions"), [
    "--claude-root",
    path.join(imported, path.relative(home, projects)),
  ]);
  expect((await storedUsage(imported)).get("SEED-7#claude-2")).toEqual(
    refreshed.get("SEED-7#claude-2"),
  );

  const store = usageHistoryFile(home);
  const history = readFileSync(store),
    summary = readFileSync(usageTaskSummaryFile(store));
  const again = await usage.refresh();
  expect(await usage.chart("?tool=claude")).toEqual({
    ...chart,
    checkedAt: again,
  });
  expect(readFileSync(store)).toEqual(history);
  expect(readFileSync(usageTaskSummaryFile(store))).toEqual(summary);
});

test("a Refresh while a Claude task runs brings in what its transcript holds so far, and a later one replaces it", async ({
  machine,
}) => {
  const { home } = machine;
  const { transcripts } = importedOnce(home);
  const usage = await usageServer(machine);
  await usage.refresh();

  keepLaunchStore(home, {
    "open-dough": [finished(1), launch(2).please()],
  });
  const transcript = writeClaudeSession(
    transcripts,
    rootTranscript(2)
      .withCountedOpusResponse({ uuid: "early", outputTokens: 100 })
      .please(),
  );
  await usage.refresh();
  expect((await storedUsage(home)).get("SEED-7#claude-2")).toMatchObject([
    { root: true, responses: 1, tokens: { output: 100 } },
  ]);

  const [late] = makeMe.aClaudeTranscript
    .forSession("claude-2")
    .withCountedOpusResponse({
      uuid: "late",
      outputTokens: 50,
      parentUuid: "early",
    })
    .please();
  appendFileSync(transcript, `${JSON.stringify(late)}\n`);
  await usage.refresh();
  expect((await storedUsage(home)).get("SEED-7#claude-2")).toMatchObject([
    { root: true, responses: 2, tokens: { output: 150 } },
  ]);
});
