// An ad hoc row's review warning requires a successful association read
// (legacy for SEED-426). Story rows' catalog and review state evidence:
// ./recently-done-review-cue-mount.spec.ts.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { pausePageClockAt } from "../../test-support/dashboardTest.ts";
import {
  adHoc,
  linked,
  openFrontendSelectionPage,
} from "../../test-support/support/frontendRecentlyDoneSelection.ts";
import { expectSessionReviewCue } from "../../test-support/recentlyDoneSessionsSidebarPage.ts";
import { passCheckPace } from "../../test-support/pageRequestNotes.ts";
import { expectProjectChoice } from "../../test-support/projectChoice.ts";
import {
  installFrontendCompletedStoryAssociation,
  installFrontendStoryReviewState,
} from "../../test-support/support/frontendServiceSubstitutes.ts";

const completedStory = (response: { url(): string }) =>
  new URL(response.url()).pathname.includes("completed-story");

test("failed association supplies no warning; a later successful read supplies it without selection", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, new Date());
  await installFrontendStoryReviewState(page);
  const association = await installFrontendCompletedStoryAssociation(page);
  association.answer({ kind: "linked", identity: linked.identity });
  association.refuseNext("Evidence unavailable.", 502);
  const failed = page.waitForResponse(
    (response) => completedStory(response) && response.status() === 502,
  );
  const { shown, row } = await openFrontendSelectionPage(
    page,
    frontendServices,
  );
  await failed;
  await expectSessionReviewCue(row(adHoc.title), false);
  await expect(shown.select(adHoc.title)).toBeEnabled();
  await expect(shown.select(adHoc.title)).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  const recovered = page.waitForResponse(
    (response) => completedStory(response) && response.ok(),
  );
  await passCheckPace(page);
  await recovered;
  await expectSessionReviewCue(row(adHoc.title), true);
  await expect(shown.select(adHoc.title)).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expectProjectChoice(page, "Open Dough");
});

test("pending association shows no initial warning, then resolves without selecting", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, new Date());
  const association = await installFrontendCompletedStoryAssociation(page);
  const held = association.holdNext();
  association.answerNext({ kind: "linked", identity: linked.identity });
  const { shown, row } = await openFrontendSelectionPage(
    page,
    frontendServices,
  );
  await held.received;
  await expectSessionReviewCue(row(adHoc.title), false);
  await expect(shown.select(adHoc.title)).toBeEnabled();
  held.release();
  await held.delivered;
  await expectSessionReviewCue(row(adHoc.title), true);
  await expect(shown.select(adHoc.title)).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expectProjectChoice(page, "Open Dough");
});
