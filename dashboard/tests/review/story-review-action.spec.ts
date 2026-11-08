// Review changes on Story A's card, offered by its kept launch record
// (../support/storyReviewWorktree.ts): it joins Select story and Inspect story
// in the card's inspection group, next in reading order and on the next line
// when the card is too narrow for all three, below the launch group's Starts, and
// the keyboard reaches it from Inspect story. It leads with a decorative
// review glyph and ends with a decorative arrow toward the side panel.
// Closing the review in the side panel returns the keyboard in
// ./story-review.spec.ts; closing the detail, in
// ../storyReadinessScan.ts and ../navigation/accessible-board-keyboard.spec.ts. Each
// layout is read once the cards' preparation and the machine's sessions are
// read, since each reading changes a card's height.

import type { Page } from "@playwright/test";
import { expect, test } from "../support/preparationPage.ts";
import {
  storyCardLaunchActions,
  expectActionGlyph,
  inspectionGroup,
  launchGroup,
} from "../storyCardControls.ts";
import {
  expectFocusedAndIndicated,
  narrowWindow,
  twiceZoomedWindow,
} from "../accessibleReading.ts";
import {
  expectInReadingOrder,
  expectOnOneLine,
  expectStackedInOrder,
} from "../pageLayout.ts";
import { expectSettledPage } from "../dashboardPage.ts";
import { openBacklog } from "../support/sessionDialog.ts";
import { unchangedWorktree } from "../support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "../support/storyLaunchRecord.ts";
import { selectStory } from "../storyCardSelection.ts";

// The page once the cards' preparation and the machine's sessions are read.
// Other journeys settle while they hold the sessions read, so this wait stays
// with the layouts it guards.
async function expectSettledLayout(page: Page) {
  await expectSettledPage(page);
  await expect(page.getByText("Reading sessions…")).toHaveCount(0);
}

test("the inspection group sits below the launch group, wraps in reading order, and the keyboard reaches Review changes from Inspect story", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = unchangedWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const action = inspectionGroup(card).getByRole("button", {
    name: "Review changes",
  });
  const review = page.getByRole("region", { name: "Story review" });
  const starts = storyCardLaunchActions.map((name) =>
    launchGroup(card).getByRole("button", { name }),
  );
  const inspect = inspectionGroup(card).getByRole("button", {
    name: "Inspect story",
  });
  const detail = card.getByRole("region", { name: "Detail for Story A" });
  const select = selectStory(card);

  await page.setViewportSize({ width: 1440, height: 900 });
  await expectSettledLayout(page);
  await expectOnOneLine(starts);
  // Select story and Inspect story share a line; Review changes follows them
  // in reading order, on the next line when the card is too narrow for all
  // three.
  await expectOnOneLine([select, inspect]);
  await expectInReadingOrder(card, [select, inspect, action]);
  await expectActionGlyph(action, "Review changes", "git-compare");
  await expectActionGlyph(action, "Review changes", "arrow-right", "trailing");
  await expectStackedInOrder([launchGroup(card), inspectionGroup(card)]);
  for (const window of [narrowWindow, twiceZoomedWindow]) {
    await page.setViewportSize(window);
    // Each window starts from a newly read page, with no detail or review open.
    await page.reload();
    await expectSettledLayout(page);
    await expectInReadingOrder(card, [...starts, select, inspect, action]);
    await inspect.focus();
    await page.keyboard.press("Enter");
    const hide = inspectionGroup(card).getByRole("button", {
      name: "Hide detail",
    });
    await expectFocusedAndIndicated(page, hide);
    await expect(detail).toBeVisible();
    await page.keyboard.press("Tab");
    await expectFocusedAndIndicated(page, action);
    await page.keyboard.press("Enter");
    await expect(review).toBeVisible();
  }
});
