// A done story card's review state when a change could not be saved: the
// machine cannot write its local records, or the dashboard is not reached.
// The card keeps showing the state last saved, with the keyboard on the action
// still shown, and says the review state could not be saved; using the action
// again once saving works saves it and clears that. Keeping the state:
// ../../dashboard/tests/stories/recently-done-review-state.spec.ts.

import { chmodSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { Locator } from "@playwright/test";
import { storyReviewStateEndpoint } from "../../dashboard/src/storyReviewState.ts";
import {
  doneCard,
  expectReviewed,
  keptReviewStates,
  markAsReviewed,
  openRecentlyDone,
  publishDoneStories,
  reviewStatesFile,
  storyA,
  unreview,
} from "../../dashboard/tests/recentlyDoneReviewState.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";

const notSaved = "The review state could not be saved.";

const saidOf = (card: Locator) =>
  card.getByRole("status").filter({ hasText: notSaved });

test("a change that could not be saved keeps the state last saved and says so until the action is used again and saved", async ({
  page,
  dashboard,
  origin,
}) => {
  await publishDoneStories(page, origin);
  await openRecentlyDone(page);
  const a = doneCard(page, storyA.title);
  await expectReviewed(a, false);
  // The directory holding this machine's local records, made read-only so no
  // record in it can be written.
  const records = path.dirname(reviewStatesFile(dashboard));
  mkdirSync(records, { recursive: true });

  await test.step("Mark as reviewed while this machine cannot write its local records: still Mark as reviewed, focused, saying it could not be saved", async () => {
    chmodSync(records, 0o555);
    try {
      await markAsReviewed(a).focus();
      await page.keyboard.press("Enter");
      await expect(saidOf(a)).toBeVisible();
    } finally {
      chmodSync(records, 0o755);
    }
    await expectReviewed(a, false);
    await expect(markAsReviewed(a)).toBeFocused();
    expect(keptReviewStates(dashboard)).toBeUndefined();
  });

  await test.step("Mark as reviewed again once writing works: saved, and the message is gone", async () => {
    await page.keyboard.press("Enter");
    await expectReviewed(a, true);
    await expect(saidOf(a)).toHaveCount(0);
    await expect(unreview(a)).toBeFocused();
    expect(
      Object.keys(keptReviewStates(dashboard)?.["open-dough"] ?? {}),
    ).toEqual([storyA.identity]);
  });

  await test.step("Unreview while the dashboard cannot be reached: still Reviewed with Unreview, focused, saying it could not be saved", async () => {
    const endpoint = `**${storyReviewStateEndpoint}?*`;
    await page.route(endpoint, (route) =>
      route.request().method() === "POST" ? route.abort() : route.fallback(),
    );
    await page.keyboard.press("Enter");
    await expect(saidOf(a)).toBeVisible();
    await expectReviewed(a, true);
    await expect(unreview(a)).toBeFocused();
    await page.unroute(endpoint);
  });

  await test.step("Unreview again once the dashboard is reached: not reviewed, and the message is gone", async () => {
    await page.keyboard.press("Enter");
    await expectReviewed(a, false);
    await expect(saidOf(a)).toHaveCount(0);
    await expect(markAsReviewed(a)).toBeFocused();
    expect(keptReviewStates(dashboard)?.["open-dough"]).toEqual({});
  });
});
