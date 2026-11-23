import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { showColumn } from "../../test-support/boardPage.ts";
import { pausePageClockAt } from "../../test-support/dashboardTest.ts";
import { doneCard } from "../../test-support/doneStoryReviewPage.ts";
import {
  storyCardSessions,
  standaloneSessionName,
} from "../../test-support/dashboardPage.ts";
import { finalReportParts } from "../../test-support/finalReportPages.ts";
import { showRecentlyDone } from "../../test-support/recentlyDoneSessionsSidebarPage.ts";
import {
  chooseRecentStory,
  dismissRecentStoriesWithEscape,
  expectRecentStoriesButton,
  openRecentStories,
  recentStoriesRow,
} from "../../test-support/recentStoriesPage.ts";
import {
  emptyArea,
  expectSelected,
} from "../../test-support/storyCardSelection.ts";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import { advanceFrontendDoneProject } from "../../test-support/support/frontendDoneProjectRefresh.ts";
import { installFrontendFinalReport } from "../../test-support/support/frontendFinalReportSubstitutes.ts";
import {
  observeFrontendSelectionLaunch,
  report,
} from "../../test-support/support/frontendRecentlyDoneSelection.ts";
import { installFrontendSessionActions } from "../../test-support/support/frontendSessionActions.ts";
import {
  putFrontendDoneRecords,
  type FrontendServiceState,
} from "../../test-support/support/frontendServiceState.ts";
import { markDoneAnyway } from "../../test-support/support/markDone.ts";
import { preholdRevisionStreamSlots } from "../../test-support/support/revisionStreamSlots.ts";
import { takenAdHocSession } from "../../test-support/support/startedAdHocSession.ts";

const title = "Keep the observation changes";
const reference = "22222222-2222-4222-8222-222222222222";
const identity = `ad-hoc#${reference}`;
const completedAt = new Date().toISOString();

async function openWork(page: Page, services: FrontendServiceState) {
  const origin = makeMe.aLaunchRecord
    .adHoc({ title })
    .reportingThrough({
      reference,
      origin: "http://localhost",
      command: "node report.mjs",
    })
    .please();
  const other = makeMe.aLaunchRecord
    .executing(report)
    .completedWith({ message: report.message })
    .markedDone()
    .please();
  const answer = makeMe.aMachineAnswer.observingOpen(origin);
  observeFrontendSelectionLaunch(answer, other);
  services.answerMachine(answer.please());
  await pausePageClockAt(page, new Date());
  await preholdRevisionStreamSlots(page);
  await installFrontendSessionActions(page, services, {
    doneStory: { kind: "originating", identity, title, completedAt },
  });
  await installFrontendFinalReport(page, {
    kind: "available",
    turnId: "already-bound",
    text: report.message,
  });
  await openFrontendTakenBacklog(page);
  const shown = await showRecentlyDone(page);
  await shown.open(report.title).click();
  await expect(finalReportParts(page).reportText).toHaveText(report.message);
}

test("Done work uses the same story in Recently done, its session row and Recent stories through publication", async ({
  page,
  frontendServices,
}) => {
  await test.step("Given an ad hoc session and another session's report in the Side panel", () =>
    openWork(page, frontendServices));
  await test.step("When the developer marks the ad hoc session Done", async () => {
    await showColumn(page, "Taken");
    await markDoneAnyway(takenAdHocSession(page, title));
  });
  await test.step("Then its local Done card holds the original session", async () => {
    await showColumn(page, "Recently done");
    await expect(storyCardSessions(doneCard(page, title))).toHaveAccessibleName(
      standaloneSessionName("Ad hoc", title),
    );
  });
  await test.step("And the Board card selects the story", async () => {
    await emptyArea(doneCard(page, title)).click();
    await expectRecentStoriesButton(page, { selected: identity, filled: true });
    await emptyArea(doneCard(page, title)).click();
  });
  await test.step("And selecting the Recently done sessions row selects that same card", async () => {
    await (await showRecentlyDone(page)).select(title).click();
    await expectSelected(doneCard(page, title), true);
    await expect(finalReportParts(page).reportText).toHaveText(report.message);
  });
  await test.step("And the bookmark shows the selected Done story", async () => {
    await openRecentStories(page);
    await expect(
      recentStoriesRow(page, { project: "Open Dough", identity }),
    ).toHaveAttribute("aria-selected", "true");
    await dismissRecentStoriesWithEscape(page);
  });
  await test.step("And Recent stories can restore the selection", async () => {
    await emptyArea(doneCard(page, title)).click();
    await chooseRecentStory(page, { project: "Open Dough", identity });
    await expectSelected(doneCard(page, title), true);
  });
  await test.step("When the Done record is published", async () => {
    putFrontendDoneRecords(frontendServices, "open-dough", [
      makeMe.aDoneRecord
        .with({ identity, title, completedAt, developer: "Terry Yin" })
        .please(),
    ]);
    await advanceFrontendDoneProject(page, frontendServices);
  });
  await test.step("Then one selected card shows the published facts and keeps its original session", async () => {
    const card = doneCard(page, title);
    await expect(card).toContainText("Terry Yin");
    await expect(storyCardSessions(card)).toHaveAccessibleName(
      standaloneSessionName("Ad hoc", title),
    );
  });
  await test.step("And publication keeps the same selection and open report", async () => {
    await expect(doneCard(page, title)).toHaveCount(1);
    await expectSelected(doneCard(page, title), true);
    await expect(finalReportParts(page).reportText).toHaveText(report.message);
  });
});
