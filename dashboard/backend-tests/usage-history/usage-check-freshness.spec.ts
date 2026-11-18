// Checked follows the latest history publication without confusing Refresh's own write.
import { readFileSync, statSync, utimesSync, writeFileSync } from "node:fs";
import path from "node:path";
import { usageCheckFile } from "../../server/usageCheck.ts";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  runImport,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";
import {
  expect,
  finished,
  rootRollout,
  test,
  usageServer,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

test("Checked follows a later import and then an unchanged Refresh's own start time", async ({
  machine,
}) => {
  const { home } = machine;
  const sessions = path.join(home, ".codex/sessions");
  keepLaunchStore(home, { "open-dough": [finished("first")] });
  writeCodexSession(sessions, rootRollout("first", 100).please());
  runImport(home, sessions);
  const store = usageHistoryFile(home);
  const usage = await usageServer(machine);
  const firstCheck = await usage.refresh();
  expect((await usage.chart()).checkedAt).toBe(firstCheck);

  // Establish the file ordering independently of filesystem timestamp precision.
  const beforeImport = new Date("2026-11-14T10:00:00.000Z");
  utimesSync(usageCheckFile(store), beforeImport, beforeImport);
  keepLaunchStore(home, {
    "open-dough": [finished("first"), finished("second")],
  });
  writeCodexSession(sessions, rootRollout("second", 200).please());
  runImport(home, sessions);
  const importedAt = statSync(store).mtime.toISOString();
  const chart = await usage.chart();
  expect(chart.tasks.map(({ identity }) => identity)).toEqual([
    "SEED-7#first",
    "SEED-7#second",
  ]);
  expect(chart.checkedAt).toBe(importedAt);

  const history = readFileSync(store);
  const nextCheck = await usage.refresh();
  expect((await usage.chart()).checkedAt).toBe(nextCheck);
  expect(readFileSync(store)).toEqual(history);
});

test("Checked has no time before import, uses the first import's write, and accepts a legacy check record", async ({
  machine,
}) => {
  const { home } = machine;
  const store = usageHistoryFile(home);
  const usage = await usageServer(machine);
  expect((await usage.chart()).checkedAt).toBeNull();

  const sessions = path.join(home, ".codex/sessions");
  keepLaunchStore(home, { "open-dough": [finished("first")] });
  writeCodexSession(sessions, rootRollout("first", 100).please());
  runImport(home, sessions);
  expect((await usage.chart()).checkedAt).toBe(
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
  expect((await usage.chart()).checkedAt).toBe(checkedAt);
});
