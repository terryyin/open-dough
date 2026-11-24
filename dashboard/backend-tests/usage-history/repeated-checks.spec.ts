// Checking usage again, by Refresh (../../server/usageRefresh.ts) or by the
// offline import: a check that finds nothing new leaves the usage history as
// it is stored and a Refresh records only its check time, and new responses
// add exactly themselves, however often they are read afterwards. A session
// kept in two files and a rollout deleted after it was read are
// ./repeated-checks-evidence.spec.ts.
import { appendFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { usageCheckFile } from "../../server/usageCheck.ts";
import {
  readUsageHistory,
  usageHistoryFile,
} from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  keepRetainedLaunch,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";
import {
  counters,
  expect,
  finished,
  rootRollout,
  sol,
  storedBesideCheck,
  storedUsage,
  test,
  usageServer,
  workerRollout,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

const measured = (
  uncachedInput: number,
  cacheRead: number,
  output: number,
) => ({
  uncachedInput,
  cacheRead,
  cacheWrite: 0,
  output,
});

// Two finished tasks, the first with a worker, and a third whose launch left
// the dashboard: the rollouts under the live Codex sessions of `home`.
function threeTasks(home: string) {
  const sessions = path.join(home, ".codex/sessions");
  const day = path.join(sessions, "2026/11/14");
  keepLaunchStore(home, {
    "open-dough": [finished("first"), finished("second")],
  });
  keepRetainedLaunch(home, finished("left"));
  writeCodexSession(
    day,
    rootRollout("first", 100).withSpawnedAgent("first-worker").please(),
  );
  writeCodexSession(day, workerRollout("first").please());
  writeCodexSession(day, rootRollout("second", 200).please());
  writeCodexSession(day, rootRollout("left", 300).please());
  return sessions;
}

test("a Refresh with no rollout activity since the last check writes only its check record, and the chart's Checked time moves", async ({
  machine,
}) => {
  const { home } = machine;
  const sessions = threeTasks(home);
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [sessions],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  await importUsageHistory(options);
  const usage = await usageServer(machine);
  let checkedAt = await usage.refresh();
  const chart = await usage.chart();
  expect(chart.tasks.map(({ identity }) => identity).toSorted()).toEqual([
    "SEED-7#first",
    "SEED-7#left",
    "SEED-7#second",
  ]);
  const stored = storedBesideCheck(home);

  for (const check of ["second", "third"]) {
    const again = await usage.refresh();

    expect(Date.parse(again), check).toBeGreaterThan(Date.parse(checkedAt));
    expect(storedBesideCheck(home), check).toEqual(stored);
    expect(
      readFileSync(usageCheckFile(usageHistoryFile(home)), "utf8"),
      check,
    ).toBe(`${JSON.stringify({ checkedAt: again })}\n`);
    expect(await usage.chart(), check).toEqual({ ...chart, checkedAt: again });
    checkedAt = again;
  }
});

test("an import over unchanged evidence leaves the history as the first import stored it", async ({
  machine,
}) => {
  const { home } = machine;
  const sessions = threeTasks(home);
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [sessions],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  await importUsageHistory(options);
  const stored = storedBesideCheck(home);
  const history = await readUsageHistory(options.store);
  const bytes = readFileSync(options.store, "utf8");
  expect(bytes).toContain("SEED-7#left");

  await importUsageHistory(options);

  expect(await readUsageHistory(options.store)).toEqual(history);
  expect(readFileSync(options.store, "utf8")).toBe(bytes);
  expect(storedBesideCheck(home)).toEqual(stored);
});

test("three responses a finished task's rollout gains raise its totals by exactly those, and a second Refresh and an import change no value", async ({
  machine,
}) => {
  const { home } = machine;
  const sessions = path.join(home, ".codex/sessions");
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [sessions],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  keepLaunchStore(home, {
    "open-dough": [finished("first"), finished("second")],
  });
  const rollout = writeCodexSession(
    path.join(sessions, "2026/11/14"),
    rootRollout("first", 100).please(),
  );
  writeCodexSession(
    path.join(sessions, "2026/11/14"),
    rootRollout("second", 200).please(),
  );
  await importUsageHistory(options);
  const usage = await usageServer(machine);
  await usage.refresh();
  const group = { model: sol, effort: "xhigh", tier: null, root: true };
  const before = await storedUsage(home);
  expect(before.get("SEED-7#first")).toEqual([
    {
      ...group,
      responses: 1,
      tokens: measured(2_000, 8_000, 100),
    },
  ]);

  const gained = makeMe.aCodexRollout
    .forSession("first")
    .withResponse("first-turn", "first-second", counters(1))
    .withResponse("first-turn", "first-third", counters(2))
    .withResponse("first-turn", "first-fourth", counters(4))
    .rows();
  appendFileSync(
    rollout,
    gained.map((row) => `${JSON.stringify(row)}\n`).join(""),
  );
  await usage.refresh();

  const risen = await storedUsage(home);
  expect(Object.fromEntries(risen)).toEqual({
    "SEED-7#first": [
      {
        ...group,
        responses: 4,
        tokens: measured(8_000, 32_000, 107),
      },
    ],
    "SEED-7#second": before.get("SEED-7#second"),
  });
  const chart = await usage.chart();
  const stored = storedBesideCheck(home);

  const checkedAt = await usage.refresh();
  expect(storedBesideCheck(home)).toEqual(stored);
  expect(await usage.chart()).toEqual({ ...chart, checkedAt });

  await importUsageHistory(options);
  expect(await storedUsage(home)).toEqual(risen);
  expect((await usage.chart()).tasks).toEqual(chart.tasks);
});
