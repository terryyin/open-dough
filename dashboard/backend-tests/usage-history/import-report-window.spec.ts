import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  writeUsageHistory,
  usageHistoryFile,
} from "../../server/usageHistory.ts";
import { expect, test } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  at,
  readImported,
  runImport,
} from "../../tests/usage-history/importHarness.ts";
import { configuredRepository } from "../../tests/usage-history/recoveryHarness.ts";

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
            lastActivityAt: at,
          })
          .please(),
        makeMe.aUsageTask
          .with({ id: "undated", sessionId: "undated", project: "historic" })
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
  expect(runImport(home, root)).toMatchObject({
    tasks: 3,
    observations: 0,
    summary: {
      configuredWork: {
        tasks: 1,
        observations: 0,
        firstInWindowActivity: at,
        earliestTaskStart: null,
        tokens: { output: null },
        taskCoverage: { measured: 0, partial: 0, unavailable: 1 },
      },
      unresolvedWindowTasks: 1,
      outsideWindowTasks: 1,
    },
  });
  expect(Object.keys(readImported(home).tasks).sort()).toEqual([
    "active",
    "early",
    "undated",
  ]);
});
