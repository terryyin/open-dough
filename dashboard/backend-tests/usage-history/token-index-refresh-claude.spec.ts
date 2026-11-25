// Refresh persists Claude Code contributions from the launch and its workers.
import { appendFile, mkdtemp, readFile, rm, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { retainedLaunchEnds } from "../../server/retainedUsageTasks.ts";
import { tokenIndexAnswer } from "../../server/tokenIndexRead.ts";
import { lastUsageCheck, recordUsageCheck } from "../../server/usageCheck.ts";
import {
  readUsageHistory,
  usageHistoryFile,
} from "../../server/usageHistory.ts";
import {
  importUsageHistory,
  usageHistorySince,
} from "../../server/usageImport.ts";
import { refreshUsageHistory } from "../../server/usageRefresh.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import { usageTariffs } from "../../server/usageTariffs.ts";
import { defaultCohort } from "../../src/usageTokenIndex.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import {
  nativeFile,
  writeClaudeSession,
} from "../../test-support/usage-history/importHarness.ts";

const project = makeMe.aPublishedSource.openDough.please();
const cohort = { ...defaultCohort, tool: "claude" as const };
const day = (date: number) =>
  `2026-11-${String(date).padStart(2, "0")}T12:00:00.000Z`;
const reference = (at: number) =>
  `ca7430bd-0d52-499d-a1bd-${String(at).padStart(12, "0")}`;
const checkAt = new Date(day(4));
const repeatAt = new Date(day(5));

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

async function firstImport() {
  const home = await mkdtemp(
    path.join(tmpdir(), "token-index-claude-refresh-"),
  );
  onTestFinished(() => rm(home, { recursive: true, force: true }));
  onTestFinished(() => {
    vi.useRealTimers();
  });
  const projects = path.join(home, ".claude", "projects");
  const transcripts = path.join(projects, "open-dough");
  const store = usageHistoryFile(home);
  const sources = { home, store, codexRoots: [], claudeRoots: [projects] };
  keepLaunchRecords(home, [finished(1)]);
  const first = writeClaudeSession(
    transcripts,
    rootTranscript(1)
      .withCountedOpusResponse({ uuid: "first", outputTokens: 100 })
      .please(),
  );
  const importedAt = new Date(day(1));
  await utimes(first, importedAt, importedAt);
  await importUsageHistory({ ...sources, since: usageHistorySince });
  await recordUsageCheck(store, "2026-11-02T09:00:00.000Z");
  return { sources, transcripts };
}

async function chartContext({ home, store }: { home: string; store: string }) {
  return {
    projects: [project],
    launches: await retainedLaunchEnds(home),
    tariff: usageTariffs.claude,
    checkedAt: await lastUsageCheck(store),
  };
}

test("Refresh imports the new Claude launch and its worker once and excludes unrelated sessions", async () => {
  const { sources, transcripts } = await firstImport();
  const { home, store } = sources;
  keepLaunchRecords(home, [finished(1), finished(2)]);
  const root = writeClaudeSession(
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
  const worker = nativeFile(
    path.join(transcripts, "claude-2", "subagents"),
    "agent-worker",
    makeMe.aClaudeTranscript
      .forSession("claude-2")
      .asSidechain({ agentId: "worker" })
      .withUser({ uuid: "worker-input", parentUuid: null, content: "work" })
      .withCountedOpusResponse({ uuid: "worker", outputTokens: 300 })
      .please(),
  );
  const unrelated = writeClaudeSession(
    transcripts,
    makeMe.aClaudeTranscript
      .forSession("elsewhere")
      .withUser({ uuid: "own-input", parentUuid: null, content: "other work" })
      .withCountedOpusResponse({ uuid: "elsewhere", outputTokens: 900 })
      .please(),
  );
  const changed = new Date(day(3));
  for (const file of [root, worker, unrelated])
    await utimes(file, changed, changed);
  vi.setSystemTime(checkAt);

  expect(await refreshUsageHistory(sources)).toEqual({
    checkedAt: checkAt.toISOString(),
  });
  const summary = await deriveUsageTaskSummary(store);
  const chart = tokenIndexAnswer(
    { ...(await chartContext(sources)), summary },
    cohort,
  );

  expect(chart.checkedAt).toBe(checkAt.toISOString());
  expect(
    chart.tasks.map(({ identity, coverage, index }) => [
      identity,
      coverage.kind,
      index,
    ]),
  ).toEqual([
    ["SEED-7#claude-1", "measured", 1_950],
    ["SEED-7#claude-2", "measured", 4_900],
  ]);
  const refreshed = summary.tasks.find(
    (task) => task.identity === "SEED-7#claude-2",
  )?.usage;
  expect(refreshed).toMatchObject([
    { root: true, responses: 2, tokens: { output: 400 } },
  ]);
  const stored = await readUsageHistory(store);
  expect(Object.keys(stored.sessions)).toEqual([
    "claude:claude-1",
    "claude:claude-2",
  ]);
  expect(stored.gaps.map(({ sessionId }) => sessionId)).not.toContain(
    "elsewhere",
  );

  const fullStore = path.join(home, "full-usage.json");
  await importUsageHistory({
    ...sources,
    store: fullStore,
    since: usageHistorySince,
  });
  const full = await deriveUsageTaskSummary(fullStore);
  expect(
    full.tasks.find((task) => task.identity === "SEED-7#claude-2")?.usage,
  ).toEqual(refreshed);

  const history = await readFile(store);
  // Reread the launch and worker with the same response IDs.
  await utimes(root, repeatAt, repeatAt);
  vi.setSystemTime(repeatAt);
  expect(await refreshUsageHistory(sources)).toEqual({
    checkedAt: repeatAt.toISOString(),
  });
  const repeated = await deriveUsageTaskSummary(store);
  expect(
    tokenIndexAnswer(
      { ...(await chartContext(sources)), summary: repeated },
      cohort,
    ),
  ).toEqual({ ...chart, checkedAt: repeatAt.toISOString() });
  expect(await readFile(store)).toEqual(history);
});

test("Refresh replaces a running Claude launch's stored contribution as its transcript grows", async () => {
  const { sources, transcripts } = await firstImport();
  const { home, store } = sources;
  keepLaunchRecords(home, [finished(1), launch(2).please()]);
  const transcript = writeClaudeSession(
    transcripts,
    rootTranscript(2)
      .withCountedOpusResponse({ uuid: "early", outputTokens: 100 })
      .please(),
  );
  const changed = new Date(day(3));
  await utimes(transcript, changed, changed);
  vi.setSystemTime(checkAt);

  await refreshUsageHistory(sources);
  const before = await deriveUsageTaskSummary(store);
  expect(
    before.tasks.find((task) => task.identity === "SEED-7#claude-2")?.usage,
  ).toMatchObject([{ root: true, responses: 1, tokens: { output: 100 } }]);

  const [late] = makeMe.aClaudeTranscript
    .forSession("claude-2")
    .withCountedOpusResponse({
      uuid: "late",
      outputTokens: 50,
      parentUuid: "early",
    })
    .please();
  await appendFile(transcript, `${JSON.stringify(late)}\n`);
  await utimes(transcript, repeatAt, repeatAt);
  vi.setSystemTime(repeatAt);

  expect(await refreshUsageHistory(sources)).toEqual({
    checkedAt: repeatAt.toISOString(),
  });
  const after = await deriveUsageTaskSummary(store);
  expect(
    after.tasks.find((task) => task.identity === "SEED-7#claude-2")?.usage,
  ).toMatchObject([{ root: true, responses: 2, tokens: { output: 150 } }]);
  expect(await lastUsageCheck(store)).toBe(repeatAt.toISOString());
});
