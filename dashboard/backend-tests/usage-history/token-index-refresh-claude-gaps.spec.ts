import { mkdtemp, rm, utimes } from "node:fs/promises";
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
import {
  refreshUsageHistory,
  type UsageRefreshOptions,
} from "../../server/usageRefresh.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import { usageTariffs } from "../../server/usageTariffs.ts";
import {
  defaultCohort,
  type TokenIndexAnswer,
  type TokenIndexCohort,
} from "../../src/usageTokenIndex.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import {
  nativeFile,
  writeClaudeSession,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";

const project = makeMe.aPublishedSource.openDough.please();
const claude = { ...defaultCohort, tool: "claude" as const };
const day = (date: number) =>
  `2026-11-${String(date).padStart(2, "0")}T12:00:00.000Z`;
const reference = (at: number) =>
  `ca7430bd-0d52-499d-a1bd-${String(at).padStart(12, "0")}`;
const claudeSession = (at: number) => `claude-${at}`;
const identity = (session: string) => `SEED-7#${session}`;
const launch = (at: number) =>
  makeMe.aLaunchRecord
    .executing({ identity: identity(claudeSession(at)), title: `Story ${at}` })
    .inClaudeSession({ sessionId: claudeSession(at) })
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
    .forSession(claudeSession(at))
    .withLaunchInput({ reference: reference(at), command: "report" });
const answered = (at: number) =>
  rootTranscript(at).withCountedOpusResponse({
    uuid: `root-${at}`,
    outputTokens: 100,
  });

async function privateHome() {
  const home = await mkdtemp(path.join(tmpdir(), "token-index-refresh-gaps-"));
  onTestFinished(async () => {
    vi.useRealTimers();
    await rm(home, { recursive: true, force: true });
  });
  return { home, store: usageHistoryFile(home) };
}

async function importedClaudeLaunches(count: number) {
  const { home, store } = await privateHome();
  const transcripts = path.join(home, "claude");
  const sources = { home, store, codexRoots: [], claudeRoots: [transcripts] };
  const kept = [...Array<number>(count).keys()].map((at) => at + 1);
  keepLaunchRecords(home, kept.map(finished));
  const importedAt = new Date(day(11));
  for (const at of kept) {
    const file = writeClaudeSession(transcripts, answered(at).please());
    await utimes(file, importedAt, importedAt);
  }
  await importUsageHistory({ ...sources, since: usageHistorySince });
  await recordUsageCheck(store, day(12));
  return { kept, transcripts, sources };
}

async function refreshAt(
  sources: UsageRefreshOptions,
  checkedAt: string,
  ...files: string[]
) {
  const at = new Date(checkedAt);
  for (const file of files) await utimes(file, at, at);
  vi.setSystemTime(at);
  await refreshUsageHistory(sources);
}

async function chart(
  { home, store }: { home: string; store: string },
  cohort: TokenIndexCohort,
) {
  return tokenIndexAnswer(
    {
      projects: [project],
      launches: await retainedLaunchEnds(home),
      tariff: usageTariffs[cohort.tool],
      summary: await deriveUsageTaskSummary(store),
      checkedAt: await lastUsageCheck(store),
    },
    cohort,
  );
}

const point = (answer: TokenIndexAnswer, session: string) =>
  answer.tasks.find((task) => task.identity === identity(session));
async function gapCodes(store: string, session: string) {
  const { gaps } = await readUsageHistory(store);
  return gaps
    .filter(({ sessionId }) => sessionId === session)
    .map(({ code }) => code);
}
const sidechain = (session: string, agentId: string) =>
  makeMe.aClaudeTranscript
    .forSession(session)
    .asSidechain({ agentId })
    .withUser({ uuid: `${agentId}-input`, parentUuid: null, content: "work" });

test("a Claude launch joins the rolling median after Refresh finds its first response", async () => {
  const { kept, transcripts, sources } = await importedClaudeLaunches(9);
  const session = claudeSession(10);
  keepLaunchRecords(sources.home, [...kept.map(finished), launch(10).please()]);
  const unanswered = writeClaudeSession(
    transcripts,
    rootTranscript(10).please(),
  );
  await refreshAt(sources, day(13), unanswered);
  expect(await gapCodes(sources.store, session)).toEqual([
    "auxiliary-usage-not-covered",
    "missing-root-transcript-usage",
  ]);

  keepLaunchRecords(sources.home, [...kept, 10].map(finished));
  const updated = writeClaudeSession(transcripts, answered(10).please());
  await refreshAt(sources, day(14), updated);
  expect(await gapCodes(sources.store, session)).toEqual([
    "auxiliary-usage-not-covered",
  ]);
  const afterChart = await chart(sources, claude);
  const tenth = point(afterChart, session);
  expect(afterChart.checkedAt).toBe(day(14));
  expect(tenth).toMatchObject({ coverage: { kind: "measured" }, index: 1_950 });
  expect(afterChart.average).toEqual([
    { at: day(10), task: tenth?.id, value: 1_950 },
  ]);
});

test("a Claude worker's answer replaces its incomplete gap, and its missing descendant keeps the launch partial", async () => {
  const { kept, transcripts, sources } = await importedClaudeLaunches(1);
  const session = claudeSession(2);
  keepLaunchRecords(sources.home, [...kept, 2].map(finished));
  const root = writeClaudeSession(
    transcripts,
    answered(2).withWorkerResult({ agentId: "worker" }).please(),
  );
  const subagents = path.join(transcripts, session, "subagents");
  const worker = sidechain(session, "worker");
  const incomplete = nativeFile(subagents, "agent-worker", worker.please());
  await refreshAt(sources, day(13), root, incomplete);
  const before = await chart(sources, claude);
  expect(point(before, session)).toMatchObject({
    coverage: { kind: "partial", gaps: ["incomplete-worker-evidence"] },
    index: 1_950,
  });

  const available = nativeFile(
    subagents,
    "agent-worker",
    worker
      .withCountedOpusResponse({ uuid: "worker", outputTokens: 100 })
      .withWorkerResult({ agentId: "nested" })
      .please(),
  );
  await refreshAt(sources, day(14), available);
  const partial = await chart(sources, claude);
  expect(point(partial, session)).toMatchObject({
    coverage: { kind: "partial", gaps: ["missing-worker-evidence"] },
    index: 3_900,
  });

  const descendant = nativeFile(
    subagents,
    "agent-nested",
    sidechain(session, "nested")
      .withCountedOpusResponse({ uuid: "nested", outputTokens: 100 })
      .please(),
  );
  await refreshAt(sources, day(15), descendant);
  const measured = await chart(sources, claude);
  expect(point(measured, session)).toMatchObject({
    coverage: { kind: "measured" },
    index: 5_850,
  });
});

test("a Codex session loses its no-response gap when a later Refresh reads its response", async () => {
  const { home, store } = await privateHome();
  const rollouts = path.join(home, "codex");
  const session = "second";
  const sources = { home, store, codexRoots: [rollouts], claudeRoots: [] };
  await importUsageHistory({ ...sources, since: usageHistorySince });
  await recordUsageCheck(store, day(12));
  keepLaunchRecords(home, [
    makeMe.aLaunchRecord
      .executing({ identity: identity(session), title: "Story second" })
      .inCodexSession({ sessionId: session })
      .launchedAt(day(11))
      .withFirstInput({ state: "confirmed", turnId: "second-turn" })
      .completedWith({ message: "", receivedAt: day(12) })
      .please(),
  ]);
  const rollout = makeMe.aCodexRollout
    .forSession(session)
    .withTurnContext("second-turn", "gpt-6.1-sol", "xhigh");
  const unanswered = writeCodexSession(rollouts, rollout.please());
  await refreshAt(sources, day(13), unanswered);
  const before = await chart(sources, defaultCohort);
  expect(point(before, session)?.coverage).toEqual({
    kind: "partial",
    gaps: ["no-response-usage-evidence", "no-attributable-response-usage"],
  });

  const updated = writeCodexSession(
    rollouts,
    rollout
      .withResponse("second-turn", "second-answer", {
        input_tokens: 10_000,
        cached_input_tokens: 8_000,
        cache_write_input_tokens: 0,
        output_tokens: 200,
      })
      .please(),
  );
  await refreshAt(sources, day(14), updated);
  const after = await chart(sources, defaultCohort);
  expect(point(after, session)?.coverage).toEqual({ kind: "measured" });
});
