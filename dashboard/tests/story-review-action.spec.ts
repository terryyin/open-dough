// Review changes on Story A's card, offered by its kept launch record
// (./support/storyReviewWorktree.ts): it joins Inspect story in the card's
// inspection group, on one line beside it when the card is wide enough and
// next in reading order when it is not, below the launch group's Starts;
// closing the review in the side panel or the detail returns the keyboard
// usefully.

import { expect, test } from "./support/preparationPage.ts";
import {
  cardLaunchActions,
  inspectionGroup,
  launchGroup,
} from "./cardControls.ts";
import {
  expectFocusedAndIndicated,
  narrowWindow,
  twiceZoomedWindow,
} from "./accessibleReading.ts";
import {
  expectInReadingOrder,
  expectOnOneLine,
  expectStackedInOrder,
} from "./pageLayout.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import {
  keepLaunchRecord,
  unchangedWorktree,
} from "./support/storyReviewWorktree.ts";

test("the inspection group shares a line below the launch group, wraps in reading order, and returns the keyboard on closing", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = unchangedWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const action = inspectionGroup(card).getByRole("button", {
    name: "Review changes",
  });
  const review = page.getByRole("region", { name: "Review changes" });
  const starts = cardLaunchActions.map((name) =>
    launchGroup(card).getByRole("button", { name }),
  );
  const inspect = inspectionGroup(card).getByRole("button", {
    name: "Inspect story",
  });
  const detail = card.getByRole("region", { name: "Detail for Story A" });

  await page.setViewportSize({ width: 1440, height: 900 });
  await expectOnOneLine(starts);
  await expectOnOneLine([inspect, action]);
  await expectStackedInOrder([launchGroup(card), inspectionGroup(card)]);
  for (const window of [narrowWindow, twiceZoomedWindow]) {
    await page.setViewportSize(window);
    await expectInReadingOrder(card, [...starts, inspect, action]);
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
    await page.keyboard.press("Meta+Shift+Escape");
    await expect(review).toBeHidden();
    await expectFocusedAndIndicated(page, action);
    await page.keyboard.press("Tab");
    await expectFocusedAndIndicated(page, detail.getByRole("link").first());
    await hide.press("Enter");
    await expectFocusedAndIndicated(page, card);
  }
});
