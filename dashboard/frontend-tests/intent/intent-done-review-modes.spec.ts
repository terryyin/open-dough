import { closeSidePanel } from "../../test-support/sidePanelFrame.ts";
// Actual held review answers cannot lend the other comparison mode's snapshot
// or selected run to Done Intent or to the ordinary Done-card Review.
import { fileBrowser } from "../../test-support/support/reviewContextLine.ts";
import { reviewRegion } from "../../test-support/support/reviewControls.ts";
import { reviewChanges } from "../../test-support/storyCardControls.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import { showColumn } from "../../test-support/boardPage.ts";
import { prepareFrontendDoneReview } from "../../test-support/support/frontendDoneReview.ts";
import { frontendFileDiff } from "../../test-support/support/frontendStoryReview.ts";
import { readReview } from "../../test-support/support/launchLandingReview.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";

import { selectDoneStoryInIntent } from "../../test-support/support/selectDoneStoryInIntent.ts";
import {
  chooseStoryTab,
  intentDiff,
  outsideCount,
  reviewDiff,
} from "../../test-support/support/intentStoryPage.ts";

const modified = "Modified dashboard/tests/a.spec.ts";

test("switching the open review between live workspace and Done Intent waits for each mode's own answer", async ({
  page,
  frontendServices,
}) => {
  const {
    review: answers,
    published,
    live,
  } = await prepareFrontendDoneReview(
    page,
    frontendServices,
    "completed historical test",
  );
  const { card, intent } = await selectDoneStoryInIntent(page);
  await chooseStoryTab(intent, "Changed tests");
  const historicalDiff = await intentDiff(intent, modified);
  expect(historicalDiff).toContain("completed historical test");
  await parts(page).development.click();
  await showColumn(page, "Recently done");
  answers.answerSnapshot(live);
  answers.answerFile(
    frontendFileDiff("dashboard/tests/a.spec.ts", [
      "+retained live local test",
    ]),
    "dashboard/tests/a.spec.ts",
  );
  await readReview(page, card);
  expect(await reviewDiff(page, modified)).toContain(
    "retained live local test",
  );
  await parts(page).intentChoice.click();
  const review = reviewRegion(page);
  answers.answerSnapshot(published);
  answers.answerFile(
    frontendFileDiff("dashboard/tests/a.spec.ts", [
      "+completed historical test",
    ]),
    "dashboard/tests/a.spec.ts",
  );
  const heldHistorical = answers.holdNextSnapshot();
  try {
    await outsideCount(intent).click();
    await heldHistorical.received;
    await expect(review.getByRole("status")).toHaveText(
      "Reading the story's changes…",
    );
    await expect(fileBrowser(review)).toHaveCount(0);
    await expect(review).not.toContainText("retained live local test");
    heldHistorical.release();
    await heldHistorical.delivered;
    expect(await reviewDiff(page, modified)).toBe(historicalDiff);
  } finally {
    heldHistorical.release();
    await heldHistorical.delivered;
  }
  await parts(page).development.click();
  await showColumn(page, "Recently done");
  const ordinary = reviewChanges(card);
  // Focus reveals its column using the remounted Board's current width.
  await ordinary.focus();
  await expect(ordinary).toBeInViewport();
  answers.answerSnapshot(live);
  answers.answerFile(
    frontendFileDiff("dashboard/tests/a.spec.ts", [
      "+retained live local test",
    ]),
    "dashboard/tests/a.spec.ts",
  );
  const heldLive = answers.holdNextSnapshot();
  try {
    await ordinary.click();
    await heldLive.received;
    await expect(review.getByRole("status")).toHaveText(
      "Reading the story's changes…",
    );
    await expect(fileBrowser(review)).toHaveCount(0);
    await expect(review).not.toContainText("completed historical test");
    heldLive.release();
    await heldLive.delivered;
    expect(await reviewDiff(page, modified)).toContain(
      "retained live local test",
    );
  } finally {
    heldLive.release();
    await heldLive.delivered;
  }
  await closeSidePanel(review);
  await expect(ordinary).toBeFocused();
});
