// Which kept records Recently done in the Sessions sidebar lists across
// configured projects: of each project's kept launches, only those marked
// Done, each under its own project, while open ones stay among open sessions.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  showRecentlyDone,
  showThreeProjectPage,
} from "../recentlyDoneSessionsSidebarPage.ts";
import { keepLaunchStore } from "../support/launchStore.ts";
import { daysAgo, retainedDoneAt } from "../machineLaunchRecords.ts";
import { expectRowShows, expectTooltipLine } from "../sessionsSidebarPage.ts";
import { expect, test } from "../support/cursorStart.ts";

test.use({
  projectFolders: ["open-dough", "doughnut", "pygardon"],
  cursorScreen: "working",
});

test("of two projects' kept executions, Recently done lists only the one marked Done yesterday, under its project", async ({
  page,
  dashboard,
  origin,
}) => {
  // Both executions were launched two days ago.
  const launchedAt = daysAgo(2);
  keepLaunchStore(dashboard, {
    doughnut: [
      makeMe.aLaunchRecord
        .executing({
          identity: "SEED-401#done-yesterday",
          title: "Doughnut story done yesterday",
          source: "doughnut",
        })
        .inClaudeSession({ sessionId: "doughnut-done-yesterday" })
        .launchedAt(launchedAt)
        .markedDoneAt(retainedDoneAt())
        .please(),
    ],
    pygardon: [
      makeMe.aLaunchRecord
        .executing({
          identity: "SEED-301#still-open",
          title: "Pygardon story still open",
          source: "pygardon",
        })
        .inClaudeSession({
          sessionId: dashboard.claudeListsSession({
            name: "Pygardon story still open",
            cwd: dashboard.home,
            startedAt: Date.parse(launchedAt),
          }),
        })
        .launchedAt(launchedAt)
        .please(),
    ],
  });

  await showThreeProjectPage(page, origin);
  const shown = await showRecentlyDone(page);

  // The open execution is kept and listed among open sessions, not here.
  await expect(
    shown.openEntries.filter({ hasText: "Pygardon story still open" }),
  ).toHaveCount(1);
  await expect(shown.entries).toHaveCount(1);
  await expect(shown.region).not.toContainText("Pygardon story still open");
  await expectRowShows(shown.entries.first(), "Doughnut story done yesterday");
  // Its project and workflow, as its details name them.
  await expectTooltipLine(shown.entries.first(), "Doughnut · Execution");
});
