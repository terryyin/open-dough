// What a repeated check does with evidence that is split or gone: a Refresh
// reads every file of a session one of whose files changed, so each of its
// responses is counted once, and a task whose rollout was deleted after it
// was read keeps its totals and its point in the chart through a Refresh and
// an import. Checks that find nothing new are ./repeated-checks.spec.ts.
import { appendFileSync, rmSync, utimesSync } from "node:fs";
import path from "node:path";
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { retainedLaunchEnds } from "../../server/retainedUsageTasks.ts";
import { tokenIndexAnswer } from "../../server/tokenIndexRead.ts";
import { lastUsageCheck } from "../../server/usageCheck.ts";
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
  counters,
  finished,
  rootRollout,
  storedUsage,
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

const longAgo = new Date("2026-11-01T00:00:00.000Z");

test("a Refresh after one of a session's two files changed counts each of the session's responses once, and so does an import after it", async ({
  home,
}) => {
  const sessions = path.join(home, ".codex/sessions");
  const archived = path.join(home, ".codex/archived_sessions");
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [sessions, archived],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  keepLaunchStore(home, { "open-dough": [finished("split")] });
  const live = writeCodexSession(
    path.join(sessions, "2026/11/14"),
    rootRollout("split", 100).please(),
  );
  // The archived file repeats the live file's response and holds one more.
  const unchanged = writeCodexSession(
    archived,
    rootRollout("split", 100)
      .withResponse("split-turn", "split-archived", counters(30))
      .please(),
  );
  await importUsageHistory(options);
  await refreshUsageHistory({ home, store: options.store });
  const totals = async () =>
    (await storedUsage(home))
      .get("SEED-7#split")
      ?.map(({ responses, tokens }) => [responses, tokens.output]);
  expect(await totals()).toEqual([[2, 130]]);

  utimesSync(unchanged, longAgo, longAgo);
  const [gained] = makeMe.aCodexRollout
    .forSession("split")
    .withResponse("split-turn", "split-new", counters(5))
    .rows();
  appendFileSync(live, `${JSON.stringify(gained)}\n`);
  await refreshUsageHistory({ home, store: options.store });

  expect(await totals()).toEqual([[3, 135]]);

  await importUsageHistory(options);
  expect(await totals()).toEqual([[3, 135]]);
});

test("a task whose rollout was deleted keeps its totals and its point in the chart through a Refresh and then an import", async ({
  home,
}) => {
  const sessions = path.join(home, ".codex/sessions");
  const day = path.join(sessions, "2026/11/14");
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [sessions],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  keepLaunchStore(home, {
    "open-dough": [finished("kept"), finished("removed")],
  });
  const kept = writeCodexSession(day, rootRollout("kept", 100).please());
  const rollout = writeCodexSession(
    day,
    rootRollout("removed", 200)
      .withResponse("removed-turn", "removed-more", counters(40))
      .please(),
  );
  await importUsageHistory(options);
  await refreshUsageHistory({ home, store: options.store });
  const chart = await readChart(home, options.store);
  const point = chart.tasks.find(
    ({ identity }) => identity === "SEED-7#removed",
  );
  expect(point?.coverage).toEqual({ kind: "measured" });
  expect(point?.index).toBeGreaterThan(0);
  const removed = async () => (await storedUsage(home)).get("SEED-7#removed");
  const totals = await removed();
  expect(totals).toMatchObject([
    { root: true, responses: 2, tokens: { output: 240 } },
  ]);

  rmSync(rollout);
  // The other task's rollout changes, so this Refresh writes the history.
  const [gained] = makeMe.aCodexRollout
    .forSession("kept")
    .withResponse("kept-turn", "kept-more", counters(7))
    .rows();
  appendFileSync(kept, `${JSON.stringify(gained)}\n`);
  await refreshUsageHistory({ home, store: options.store });

  expect(await removed()).toEqual(totals);
  const refreshed = await readChart(home, options.store);
  expect(refreshed.tasks).toContainEqual(point);
  expect(refreshed.tasks).toHaveLength(chart.tasks.length);

  await importUsageHistory(options);

  expect(await removed()).toEqual(totals);
  const imported = await readChart(home, options.store);
  expect(imported.tasks).toContainEqual(point);
  expect(imported.tasks).toHaveLength(chart.tasks.length);
});
