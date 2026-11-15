// Incremental import, coalescing and failure preservation at the Refresh HTTP boundary.
import {
  appendFileSync,
  cpSync,
  readFileSync,
  statSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { usageCheckFile } from "../../server/usageCheck.ts";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import { usageTaskSummaryFile } from "../../server/usageTaskSummary.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
  runImport,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";
import {
  counters,
  expect,
  finished,
  rootRollout,
  storedUsage,
  test,
  usageServer,
  workerRollout,
} from "../../tests/usage-history/tokenIndexHarness.ts";

const longAgo = new Date("2026-11-01T00:00:00.000Z");

test("Refresh reads changed roots and their older workers like a full import; repeats coalesce without rewriting or double-counting", async ({
  machine,
}) => {
  const { home } = machine;
  const sessions = path.join(home, ".codex/sessions"),
    rollouts = path.join(sessions, "2026/11/14");
  keepLaunchStore(home, { "open-dough": [finished("first")] });
  const first = writeCodexSession(rollouts, rootRollout("first", 100).please());
  runImport(home, sessions);
  const store = usageHistoryFile(home);
  const usage = await usageServer(machine);
  const lastCheck = await usage.refresh();

  // Changed bytes whose mtime predates the check are deliberately not reread.
  const [late] = makeMe.aCodexRollout
    .forSession("first")
    .withResponse("first-turn", "first-late", counters(5))
    .rows();
  appendFileSync(first, `${JSON.stringify(late)}\n`);
  utimesSync(first, longAgo, longAgo);
  keepLaunchStore(home, {
    "open-dough": [finished("first"), finished("second")],
  });
  writeCodexSession(
    rollouts,
    rootRollout("second", 200).withSpawnedAgent("second-worker").please(),
  );
  const worker = writeCodexSession(rollouts, workerRollout("second").please());
  utimesSync(worker, longAgo, longAgo);
  const checkedAt = await usage.refresh();

  expect(Date.parse(checkedAt)).toBeGreaterThan(Date.parse(lastCheck));
  const chart = await usage.chart();
  expect(chart.checkedAt).toBe(checkedAt);
  expect(
    chart.tasks.map(({ identity, coverage }) => [identity, coverage.kind]),
  ).toEqual([
    ["SEED-7#first", "measured"],
    ["SEED-7#second", "measured"],
  ]);
  // The late response stays unread; the worker's is the second task's.
  const refreshed = await storedUsage(home);
  expect(Object.fromEntries(refreshed)).toMatchObject({
    "SEED-7#first": [{ root: true, responses: 1, tokens: { output: 100 } }],
    "SEED-7#second": [
      { root: true, responses: 1, tokens: { output: 200 } },
      { root: false, responses: 1, tokens: { output: 70 } },
    ],
  });

  const imported = path.join(machine.machine, "imported-home");
  cpSync(home, imported, {
    recursive: true,
    filter: (source) => !path.basename(source).startsWith("usage"),
  });
  runImport(imported, path.join(imported, ".codex/sessions"));
  expect((await storedUsage(imported)).get("SEED-7#second")).toEqual(
    refreshed.get("SEED-7#second"),
  );

  const history = readFileSync(store),
    summary = readFileSync(usageTaskSummaryFile(store));
  const [again, alongside] = await Promise.all([
    usage.refresh(),
    usage.refresh(),
  ]);
  expect(alongside).toBe(again);
  expect(Date.parse(again)).toBeGreaterThan(Date.parse(checkedAt));
  expect(await usage.chart()).toEqual({ ...chart, checkedAt: again });
  expect(readFileSync(store)).toEqual(history);
  expect(readFileSync(usageTaskSummaryFile(store))).toEqual(summary);
  runImport(home, sessions);
  expect((await usage.chart()).tasks[1]?.index).toBe(chart.tasks[1]?.index);
});

test("an unreadable store fails Refresh without replacing its summary or check time", async ({
  machine,
}) => {
  const { home } = machine;
  const sessions = path.join(home, ".codex/sessions");
  keepLaunchStore(home, { "open-dough": [finished("first")] });
  writeCodexSession(
    path.join(sessions, "2026/11/14"),
    rootRollout("first", 9).please(),
  );
  runImport(home, sessions);
  const store = usageHistoryFile(home);
  const usage = await usageServer(machine);
  const checkedAt = await usage.refresh(),
    chart = await usage.chart();
  const history = readFileSync(store),
    summary = readFileSync(usageTaskSummaryFile(store));
  const originalTimes = statSync(store);
  const checkRecord = readFileSync(usageCheckFile(store));

  writeFileSync(store, "{ not a usage store");
  const failed = await usage.request("POST", "/__usage/refresh");
  expect(failed).toEqual({
    status: 503,
    body: {
      error: `Usage could not be refreshed: Usage history is unreadable: ${store}`,
    },
  });
  expect(readFileSync(usageTaskSummaryFile(store))).toEqual(summary);
  expect(readFileSync(usageCheckFile(store))).toEqual(checkRecord);
  writeFileSync(store, history);
  // Restoring the fixture is not a new import publishing evidence.
  utimesSync(store, originalTimes.atime, originalTimes.mtime);
  expect(await usage.chart()).toEqual({ ...chart, checkedAt });
});
