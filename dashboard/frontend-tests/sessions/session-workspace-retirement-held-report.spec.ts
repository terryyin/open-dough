// Changing selection cancels a held final-report answer and never shows its
// text as the next session's, against controlled result answers.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { installFrontendFinalReport } from "../../tests/support/frontendFinalReportSubstitutes.ts";
import { retainedMissingWorkspaceSession } from "../../tests/support/frontendFinalReportSession.ts";
import { putFrontendMachine } from "../../tests/support/frontendServiceState.ts";
import {
  readFinalReport,
  readFinalReportControl,
} from "../../tests/finalReportPages.ts";
import { closeSidePanel } from "../../tests/sidePanelFrame.ts";
import { notRefinedStory } from "../../tests/launchJourney.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyCardSessions } from "../../tests/dashboardPage.ts";
import { backlogLaunchers } from "../../tests/launchStoryCardPage.ts";

test("changing selection cancels a held report and never shows its text as the next session", async ({
  page,
  frontendServices,
}) => {
  const first = retainedMissingWorkspaceSession("held-report-session");
  const second = retainedMissingWorkspaceSession("next-retained-session");
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer.observing(first, second).please(),
  );
  const reports = await installFrontendFinalReport(page, {
    kind: "available",
    turnId: "first-turn",
    text: "First conversation report a5df85d90a",
  });
  const held = reports.holdNext("held-report-session");
  reports.answerNext(
    {
      kind: "available",
      turnId: "second-turn",
      text: "Second conversation's own result",
    },
    "next-retained-session",
  );
  await openFrontendTakenBacklog(page);
  const entries = storyCardSessions(
    backlogLaunchers(page).card(notRefinedStory),
  );
  const firstEntry = entries.filter({
    has: page.locator('code:text-is("held-report-session")'),
  });
  const secondEntry = entries.filter({
    has: page.locator('code:text-is("next-retained-session")'),
  });
  await readFinalReport(firstEntry);
  await held.received;
  const { panel, reportText, sessionName, shownSessionId } =
    await readFinalReport(secondEntry);
  await expect(sessionName).toHaveText(/ session$/);
  await expect(shownSessionId).toHaveCount(0);
  await expect(reportText).toHaveText("Second conversation's own result");
  held.release();
  await expect(reportText).toHaveText("Second conversation's own result");
  await expect(panel).not.toContainText("a5df85d90a");
  await closeSidePanel(panel);
  await expect(readFinalReportControl(secondEntry)).toBeFocused();
  expect(reports.asked()).toEqual([
    "held-report-session",
    "next-retained-session",
  ]);
});
