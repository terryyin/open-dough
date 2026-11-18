// Older answers cannot replace the current row context or a saved review.
import { expect, test } from "../../tests/support/frontendApp.ts";
import { pausePageClockAt } from "../../tests/dashboardTest.ts";
import {
  linked,
  openFrontendSelectionPage,
} from "../../tests/support/frontendRecentlyDoneSelection.ts";
import { expectSessionReviewCue } from "../../tests/recentlyDoneSessionsSidebarPage.ts";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import { givePageItsTurns } from "../../tests/pageRequestNotes.ts";
import {
  chooseProject,
  expectProjectChoice,
} from "../../tests/projectChoice.ts";
import {
  doneCard,
  expectReviewed,
  markAsReviewed,
} from "../../tests/doneStoryReviewPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { showColumn } from "../../tests/boardPage.ts";
import {
  installFrontendCompletedStoryAssociation,
  installFrontendStoryReviewState,
} from "../../tests/support/frontendServiceSubstitutes.ts";

test("pending local review evidence stays unknown and its pre-save answer cannot restore a cleared cue", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, new Date());
  const review = await installFrontendStoryReviewState(page);
  const held = review.holdNext("pygardon");
  review.answerNext([], "pygardon");
  const { shown, row } = await openFrontendSelectionPage(
    page,
    frontendServices,
  );
  await held.received;
  await expectSessionReviewCue(row(linked.title), false);
  await expect(shown.select(linked.title)).toBeEnabled();
  held.release();
  await held.delivered;
  await expectSessionReviewCue(row(linked.title), true);

  const stale = review.holdNext("pygardon");
  review.answerNext([], "pygardon");
  await page.clock.runFor(checkIntervalMs);
  await stale.received;
  await chooseProject(page, "Pygardon");
  await showColumn(page, "Recently done");
  const card = doneCard(page, linked.title);
  await expectReviewed(card, false);
  await markAsReviewed(card).click();
  await expectReviewed(card, true);
  await expectSessionReviewCue(row(linked.title), false);
  stale.release();
  await stale.delivered;
  await givePageItsTurns(page);
  await expectReviewed(card, true);
  await expectSessionReviewCue(row(linked.title), false);
});

for (const replacement of ["project", "association"] as const) {
  test(`an obsolete association cannot warn the row after its ${replacement} changes`, async ({
    page,
    frontendServices,
  }) => {
    await pausePageClockAt(page, new Date());
    const association = await installFrontendCompletedStoryAssociation(page);
    const held = association.holdNext("obsolete-association");
    association.answerNext(
      { kind: "linked", identity: linked.identity },
      "obsolete-association",
    );
    const { shown } = await openFrontendSelectionPage(page, frontendServices);
    const title = "Session whose association context changes";
    const record = (source: string, reference: string) =>
      makeMe.aLaunchRecord
        .adHoc({ source, title, instruction: title })
        .inClaudeSession({
          sessionId: "obsolete-association",
          shortId: "obsolete",
        })
        .reportingThrough({
          origin: "https://example.test",
          reference,
          command: "report",
        })
        .launchedAt(new Date(Date.now() - 60_000).toISOString())
        .markedDone()
        .please();
    frontendServices.answerMachine(
      makeMe.aMachineAnswer
        .observingDone(
          record("doughnut", "b0f19431-05f1-4dc1-b9a4-a492109bd064"),
        )
        .please(),
    );
    await page.clock.runFor(checkIntervalMs);
    await held.received;
    await expectSessionReviewCue(shown.row(title), false);
    association.answerNext({ kind: "absent" }, "obsolete-association");
    const source = replacement === "project" ? "pygardon" : "doughnut";
    frontendServices.answerMachine(
      makeMe.aMachineAnswer
        .observingDone(record(source, "0143a334-a46a-4faf-981b-a80c80f7cafe"))
        .please(),
    );
    await page.clock.runFor(checkIntervalMs);
    held.release();
    await givePageItsTurns(page);
    await expectSessionReviewCue(shown.row(title), false);
    await expect(shown.select(title)).toHaveAttribute(
      "title",
      replacement === "project" ? /Pygardon · Ad hoc/ : /Doughnut · Ad hoc/,
    );
    await expectProjectChoice(page, "Open Dough");
  });
}
