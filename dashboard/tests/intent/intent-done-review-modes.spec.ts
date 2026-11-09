// Actual held review answers cannot lend the other comparison mode's snapshot
// or selected run to Done Intent or to the ordinary Done-card Review.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { parts } from "../dashboardPage.ts";
import { showColumn } from "../boardPage.ts";
import { holdNextReviewResponse } from "../support/holdReviewResponse.ts";
import { readReview } from "../support/launchLandingReview.ts";
import { expect, test } from "../support/preparationPage.ts";
import { retainedIntentCompletion } from "../support/retainedIntentCompletion.ts";
import { selectDoneStoryInIntent } from "../support/selectDoneStoryInIntent.ts";
import {
  chooseStoryTab,
  intentDiff,
  outsideCount,
  reviewDiff,
} from "../support/intentStoryPage.ts";

const modified = "Modified dashboard/tests/a.spec.ts";

test("switching the open review between live workspace and Done Intent waits for each mode's own answer", async ({
  page,
  dashboard,
  origin,
}) => {
  const revisions = makeMe.aRepository
    .withRevision("implementation", {
      backlog: null,
      files: { "dashboard/tests/a.spec.ts": "completed historical test\n" },
    })
    .withRevision("local", {
      backlog: null,
      files: { "dashboard/tests/a.spec.ts": "retained live local test\n" },
    })
    .please().revisions;
  const implementation = revisions[0];
  const local = revisions[1];
  if (local === undefined) throw new Error("Missing revision facts");
  const { completion } = await retainedIntentCompletion(
    page,
    dashboard,
    origin,
    { implementation, local },
  );
  const { card, intent } = await selectDoneStoryInIntent(page);
  await chooseStoryTab(intent, "Changed tests");
  const historicalDiff = await intentDiff(intent, modified);
  expect(historicalDiff).toContain("completed historical test");
  await parts(page).development.click();
  await showColumn(page, "Recently done");
  expect((await readReview(page, card)).kind).toBe("snapshot");
  expect(await reviewDiff(page, modified)).toContain(
    "retained live local test",
  );
  await parts(page).intentChoice.click();
  const review = page.getByRole("region", { name: "Story review" });
  const heldHistorical = await holdNextReviewResponse(
    page,
    dashboard.origin,
    storyReviewEndpoint,
  );
  try {
    await outsideCount(intent).click();
    expect(await (await heldHistorical.ready).json()).toMatchObject({
      kind: "published",
      completion,
    });
    await expect(review.getByRole("status")).toHaveText(
      "Reading the story's changes…",
    );
    await expect(review.locator(".story-review-files")).toHaveCount(0);
    await expect(review).not.toContainText("retained live local test");
    heldHistorical.release();
    await heldHistorical.delivery;
    expect(await reviewDiff(page, modified)).toBe(historicalDiff);
  } finally {
    heldHistorical.release();
    await heldHistorical.delivery;
  }
  await parts(page).development.click();
  await showColumn(page, "Recently done");
  const heldLive = await holdNextReviewResponse(
    page,
    dashboard.origin,
    storyReviewEndpoint,
  );
  try {
    await card.getByRole("button", { name: "Review changes" }).click();
    expect(await (await heldLive.ready).json()).toMatchObject({
      kind: "snapshot",
    });
    await expect(review.getByRole("status")).toHaveText(
      "Reading the story's changes…",
    );
    await expect(review.locator(".story-review-files")).toHaveCount(0);
    await expect(review).not.toContainText("completed historical test");
    heldLive.release();
    await heldLive.delivery;
    expect(await reviewDiff(page, modified)).toContain(
      "retained live local test",
    );
  } finally {
    heldLive.release();
    await heldLive.delivery;
  }
  await review.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    card.getByRole("button", { name: "Review changes" }),
  ).toBeFocused();
});
