// Which kept records Recently done in the Sessions sidebar lists across
// configured projects, against controlled machine answers: of each project's
// kept launches, only those marked Done, each under its own project, while
// open ones stay among open sessions.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { showRecentlyDone } from "../../test-support/recentlyDoneSessionsSidebarPage.ts";
import {
  daysAgo,
  retainedDoneAt,
} from "../../test-support/machineLaunchRecords.ts";
import {
  expectRowShows,
  expectTooltipLine,
} from "../../test-support/sessionsSidebarPage.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { openFrontendThreeProjects } from "../../test-support/support/frontendRecentlyDoneSidebar.ts";

test("of two projects' kept executions, Recently done lists only the one marked Done yesterday, under its project", async ({
  page,
  frontendServices,
}) => {
  const launchedAt = daysAgo(2);
  frontendServices.answerMachine(
    makeMe.aMachineAnswer
      .observingUnavailable(
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
      )
      .observingOpen(
        makeMe.aLaunchRecord
          .executing({
            identity: "SEED-301#still-open",
            title: "Pygardon story still open",
            source: "pygardon",
          })
          .inClaudeSession({ sessionId: "pygardon-still-open" })
          .launchedAt(launchedAt)
          .please(),
      )
      .please(),
  );

  await openFrontendThreeProjects(page, frontendServices);
  const shown = await showRecentlyDone(page);

  await expect(
    shown.openEntries.filter({ hasText: "Pygardon story still open" }),
  ).toHaveCount(1);
  await expect(shown.entries).toHaveCount(1);
  await expect(shown.region).not.toContainText("Pygardon story still open");
  await expectRowShows(shown.entries.first(), "Doughnut story done yesterday");
  await expectTooltipLine(shown.entries.first(), "Doughnut · Execution");
});
