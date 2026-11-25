// Incremental Refresh attributes Claude Code replies and workers to the
// launch that owns them.
import { mkdtemp, rm, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { retainedLaunchEnds } from "../../server/retainedUsageTasks.ts";
import { tokenIndexAnswer } from "../../server/tokenIndexRead.ts";
import { lastUsageCheck, recordUsageCheck } from "../../server/usageCheck.ts";
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
  claudeIdentity,
  claudeReplyThenLaterLaunch,
  claudeReplyWorker,
  claudeSession,
  launchIn,
  reference,
} from "../../test-support/usage-history/claudeReplyLaunch.ts";
import {
  nativeFile,
  writeClaudeSession,
} from "../../test-support/usage-history/importHarness.ts";

const cohort = { ...defaultCohort, tool: "claude" as const };
const project = makeMe.aPublishedSource.openDough.please();
const previousCheck = "2026-11-16T12:00:00.000Z";
const transcriptChanged = new Date("2026-11-16T13:00:00.000Z");
const refreshAt = new Date("2026-11-16T14:00:00.000Z");

async function keptLaunch() {
  const home = await mkdtemp(
    path.join(tmpdir(), "token-index-claude-refresh-"),
  );
  onTestFinished(() => rm(home, { recursive: true, force: true }));
  onTestFinished(() => {
    vi.useRealTimers();
  });
  const launch = launchIn(claudeIdentity, reference);
  keepLaunchRecords(home, [launch]);
  const claudeRoot = path.join(home, "claude");
  writeClaudeSession(claudeRoot, claudeSession().please());
  return {
    launch,
    claudeRoot,
    sources: {
      home,
      store: path.join(home, "usage.json"),
      codexRoots: [],
      claudeRoots: [claudeRoot],
    },
  };
}

async function chartReading({ home, store }: { home: string; store: string }) {
  return {
    projects: [project],
    tariff: usageTariffs.claude,
    summary: await deriveUsageTaskSummary(store),
    launches: await retainedLaunchEnds(home),
    checkedAt: await lastUsageCheck(store),
  };
}

test("Refresh counts a reply read late and the worker it starts, once per response", async () => {
  const { claudeRoot, sources } = await keptLaunch();
  await importUsageHistory({ ...sources, since: usageHistorySince });
  await recordUsageCheck(sources.store, previousCheck);
  const before = tokenIndexAnswer(await chartReading(sources), cohort);
  const root = writeClaudeSession(
    claudeRoot,
    claudeSession()
      .withDeveloperReply()
      .withWorkerResult({ agentId: "worker" })
      .please(),
  );
  const repliedAt = new Date("2026-11-16T11:00:00.000Z");
  await utimes(root, repliedAt, repliedAt);
  const worker = nativeFile(
    path.join(claudeRoot, "claude", "subagents"),
    "agent-worker",
    claudeReplyWorker(),
  );

  expect(before.tasks.map(({ identity, index }) => [identity, index])).toEqual([
    [claudeIdentity, 1_950],
  ]);
  // The root predates the cutoff. The worker brings that session back into
  // each refresh so both calls process the exact same response IDs.
  for (const check of [refreshAt, new Date("2026-11-16T16:00:00.000Z")]) {
    await utimes(worker, check, check);
    vi.setSystemTime(check);

    await refreshUsageHistory(sources);
    const answer = tokenIndexAnswer(await chartReading(sources), cohort);

    expect(
      answer.tasks.map(({ identity, index, coverage }) => [
        identity,
        index,
        coverage.kind,
      ]),
    ).toEqual([[claudeIdentity, 6_850, "measured"]]);
  }
});

test("Refresh leaves a typed landing after a reply and its later replies out of the launch", async () => {
  const { claudeRoot, sources } = await keptLaunch();
  await importUsageHistory({ ...sources, since: usageHistorySince });
  await recordUsageCheck(sources.store, previousCheck);
  const root = writeClaudeSession(
    claudeRoot,
    claudeSession()
      .withDeveloperReply()
      .withUser({ uuid: "land", content: "/dough-land" })
      .withCountedOpusResponse({ uuid: "landing", outputTokens: 700 })
      .withUser({ uuid: "ok", content: "ok" })
      .withCountedOpusResponse({ uuid: "after-ok", outputTokens: 900 })
      .please(),
  );
  await utimes(root, transcriptChanged, transcriptChanged);
  vi.setSystemTime(refreshAt);

  await refreshUsageHistory(sources);
  const answer = tokenIndexAnswer(await chartReading(sources), cohort);

  expect(answer.tasks.map(({ identity, index }) => [identity, index])).toEqual([
    [claudeIdentity, 4_900],
  ]);
});

test("Refresh gives another launch's reporting context after a reply its own turns", async () => {
  const { launch, claudeRoot, sources } = await keptLaunch();
  await importUsageHistory({ ...sources, since: usageHistorySince });
  await recordUsageCheck(sources.store, previousCheck);
  const later = claudeReplyThenLaterLaunch();
  keepLaunchRecords(sources.home, [launch, later.launch]);
  const root = writeClaudeSession(claudeRoot, later.rows);
  await utimes(root, transcriptChanged, transcriptChanged);
  vi.setSystemTime(refreshAt);

  await refreshUsageHistory(sources);
  const answer = tokenIndexAnswer(await chartReading(sources), cohort);

  expect(
    Object.fromEntries(
      answer.tasks.map(({ identity, index }) => [identity, index]),
    ),
  ).toEqual({
    [claudeIdentity]: 4_900,
    [later.identity]: 10_900,
  });
});
