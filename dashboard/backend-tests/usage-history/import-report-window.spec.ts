import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  writeUsageHistory,
  usageHistoryFile,
} from "../../server/usageHistory.ts";
import {
  expect,
  test,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import { configuredRepository } from "../../test-support/usage-history/recoveryHarness.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";

test("counts recorded in-window activity without attributed counters and keeps undated tasks unresolved", async ({
  home,
  root,
}) => {
  await configuredRepository(
    home,
    makeMe.aRepository.withRevision("then", {}).please(),
  );
  await writeUsageHistory(
    {
      tasks: [
        makeMe.aUsageTask
          .with({
            id: "active",
            sessionId: "active",
            project: "historic",
            launchedAt: null,
            lastActivityAt: "2026-11-14T10:00:00.000Z",
          })
          .please(),
        makeMe.aUsageTask
          .with({
            id: "undated",
            sessionId: "undated",
            project: "historic",
            launchedAt: null,
          })
          .please(),
        makeMe.aUsageTask
          .with({
            id: "early",
            sessionId: "early",
            project: "historic",
            launchedAt: "2026-09-01T00:00:00.000Z",
          })
          .please(),
      ],
    },
    usageHistoryFile(home),
  );
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  expect(await importUsageHistory(options)).toMatchObject({
    tasks: 3,
    observations: 0,
    summary: {
      configuredWork: {
        tasks: 1,
        observations: 0,
        firstInWindowActivity: "2026-11-14T10:00:00.000Z",
        earliestTaskStart: null,
        tokens: { output: null },
        taskCoverage: { measured: 0, partial: 0, unavailable: 1 },
      },
      unresolvedWindowTasks: 1,
      outsideWindowTasks: 1,
    },
  });
  expect(
    Object.keys((await readUsageHistory(options.store)).tasks).sort(),
  ).toEqual(["active", "early", "undated"]);
});
