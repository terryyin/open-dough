// Review changes on the Taken story's card, offered by its kept launch
// record: it follows Inspect story in the card's inspection group, below the
// launch group's Starts, and the keyboard reaches it from Inspect story. It
// leads with a decorative review glyph and ends with a decorative arrow
// toward the side panel.

import type { Page } from "@playwright/test";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import {
  storyCardLaunchActions,
  expectActionGlyph,
  inspectionGroup,
  launchGroup,
  reviewChanges,
} from "../../tests/storyCardControls.ts";
import {
  expectFocusedAndIndicated,
  narrowWindow,
  twiceZoomedWindow,
} from "../../tests/accessibleReading.ts";
import {
  expectInReadingOrder,
  expectOnOneLine,
  expectStackedInOrder,
} from "../../tests/pageLayout.ts";
import { expectSettledPage, parts } from "../../tests/dashboardPage.ts";
import { notRefinedStory } from "../../tests/launchJourney.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { frontendStoryLaunch } from "../../tests/support/frontendServiceState.ts";
import { reviewRegion } from "../../tests/support/storyReviewMark.ts";

async function expectSettledLayout(page: Page) {
  await expectSettledPage(page);
  await expect(page.getByText("Reading sessions…")).toHaveCount(0);
}

test("the inspection group sits below the launch group, wraps in reading order, and the keyboard reaches Review changes from Inspect story", async ({
  page,
  frontendServices,
}) => {
  frontendServices.answerMachine(
    makeMe.aMachineAnswer
      .observingOpen(
        frontendStoryLaunch("executing", notRefinedStory)
          .onStoryBranch({
            workspace: "/tmp/story-review-action",
            branch: "claude/queued",
          })
          .inClaudeSession({
            sessionId: "story-review-action",
            shortId: "revact01",
          })
          .please(),
      )
      .please(),
  );
  await openFrontendTakenBacklog(page);
  const card = parts(page).backlog.getByRole("article", {
    name: notRefinedStory,
    exact: true,
  });
  const action = reviewChanges(inspectionGroup(card));
  const review = reviewRegion(page);
  const starts = storyCardLaunchActions.map((name) =>
    launchGroup(card).getByRole("button", { name }),
  );
  const inspect = inspectionGroup(card).getByRole("button", {
    name: "Inspect story",
  });
  const detail = card.getByRole("region", {
    name: `Detail for ${notRefinedStory}`,
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectSettledLayout(page);
  await expectOnOneLine(starts);
  await expectOnOneLine([inspect, action]);
  await expectInReadingOrder(card, [inspect, action]);
  await expectActionGlyph(action, "Review changes", "git-compare");
  await expectActionGlyph(action, "Review changes", "arrow-right", "trailing");
  await expectStackedInOrder([launchGroup(card), inspectionGroup(card)]);
  for (const window of [narrowWindow, twiceZoomedWindow]) {
    await page.setViewportSize(window);
    await page.reload();
    await expectSettledLayout(page);
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
  }
});
