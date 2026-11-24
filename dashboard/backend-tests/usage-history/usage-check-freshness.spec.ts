// Checked follows the latest history publication without confusing Refresh's own write.
import { readFileSync, statSync, utimesSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { retainedLaunchEnds } from "../../server/retainedUsageTasks.ts";
import { tokenIndexAnswer } from "../../server/tokenIndexRead.ts";
import { lastUsageCheck, usageCheckFile } from "../../server/usageCheck.ts";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";
import { refreshUsageHistory } from "../../server/usageRefresh.ts";
import { usageTariffs } from "../../server/usageTariffs.ts";
import { currentUsageTaskSummary } from "../../server/usageTaskSummaryCache.ts";
import { defaultCohort } from "../../src/usageTokenIndex.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import { writeCodexSession } from "../../test-support/usage-history/importHarness.ts";
import { test } from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  finished,
  rootRollout,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

const project = makeMe.aPublishedSource.openDough.please();

async function readChart(home: string, store: string) {
  return tokenIndexAnswer(
    {
      summary: await currentUsageTaskSummary(store),
      projects: [project],
      launches: await retainedLaunchEnds(home),
      tariff: usageTariffs.codex,
      checkedAt: await lastUsageCheck(store),
    },
    defaultCohort,
  );
}

test("Checked follows a later import and then an unchanged Refresh's own start time", async ({
  home,
}) => {
  const sessions = path.join(home, ".codex/sessions");
  keepLaunchStore(home, { "open-dough": [finished("first")] });
  writeCodexSession(sessions, rootRollout("first", 100).please());
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [sessions],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  await importUsageHistory(options);
  const { store } = options;
  const { checkedAt: firstCheck } = await refreshUsageHistory({ home, store });
  expect((await readChart(home, store)).checkedAt).toBe(firstCheck);

  // Establish the file ordering independently of filesystem timestamp precision.
  const beforeImport = new Date("2026-11-14T10:00:00.000Z");
  utimesSync(usageCheckFile(store), beforeImport, beforeImport);
  keepLaunchStore(home, {
    "open-dough": [finished("first"), finished("second")],
  });
  writeCodexSession(sessions, rootRollout("second", 200).please());
  await importUsageHistory(options);
  const importedAt = statSync(store).mtime.toISOString();
  const chart = await readChart(home, store);
  expect(chart.tasks.map(({ identity }) => identity)).toEqual([
    "SEED-7#first",
    "SEED-7#second",
  ]);
  expect(chart.checkedAt).toBe(importedAt);

  const history = readFileSync(store);
  const { checkedAt: nextCheck } = await refreshUsageHistory({ home, store });
  expect((await readChart(home, store)).checkedAt).toBe(nextCheck);
  expect(readFileSync(store)).toEqual(history);
});

test("Checked has no time before import, uses the first import's write, and accepts a legacy check record", async ({
  home,
}) => {
  const store = usageHistoryFile(home);
  expect((await readChart(home, store)).checkedAt).toBeNull();

  const sessions = path.join(home, ".codex/sessions");
  keepLaunchStore(home, { "open-dough": [finished("first")] });
  writeCodexSession(sessions, rootRollout("first", 100).please());
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store,
      codexRoots: [sessions],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  await importUsageHistory(options);
  expect((await readChart(home, store)).checkedAt).toBe(
    statSync(store).mtime.toISOString(),
  );

  // A Refresh writes its history after starting, then its legacy-shaped record.
  // Comparing only with checkedAt would incorrectly show the history's time.
  const checkedAt = "2026-11-14T10:00:00.000Z";
  const historyWritten = new Date("2026-11-14T10:01:00.000Z");
  const recordWritten = new Date("2026-11-14T10:02:00.000Z");
  utimesSync(store, historyWritten, historyWritten);
  writeFileSync(usageCheckFile(store), `${JSON.stringify({ checkedAt })}\n`);
  utimesSync(usageCheckFile(store), recordWritten, recordWritten);
  expect((await readChart(home, store)).checkedAt).toBe(checkedAt);
});
