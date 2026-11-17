// Review changes on the Taken story's card, offered by its kept launch
// record: it follows Inspect story and Notes in the card's inspection group,
// below the launch group's Starts, and the keyboard reaches it in that order. It
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
  storyNotesControl,
} from "../../tests/storyCardControls.ts";
import {
  expectFocusedAndIndicated,
  expectTabOrder,
  narrowWindow,
  twiceZoomedWindow,
} from "../../tests/accessibleReading.ts";
import {
  expectInReadingOrder,
  expectOnOneLine,
  expectOnOneLineWhenRoom,
  expectStackedInOrder,
} from "../../tests/pageLayout.ts";
import { expectSettledPage, parts } from "../../tests/dashboardPage.ts";
import { notRefinedStory } from "../../tests/launchJourney.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { frontendStoryLaunch } from "../../tests/support/frontendServiceState.ts";
import { reviewRegion } from "../../tests/support/reviewControls.ts";

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
  const notes = storyNotesControl(card);
  await page.setViewportSize({ width: 1920, height: 900 });
  await expectSettledLayout(page);
  await expectOnOneLine(starts);
  await expectOnOneLine([inspect, notes, action], "center");
  await expectInReadingOrder(card, [inspect, notes, action]);
  await expectActionGlyph(action, "Review changes", "git-compare");
  await expectActionGlyph(action, "Review changes", "arrow-right", "trailing");
  await expectStackedInOrder([launchGroup(card), inspectionGroup(card)]);
  for (const window of [
    { width: 1440, height: 900 },
    narrowWindow,
    twiceZoomedWindow,
  ]) {
    await page.setViewportSize(window);
    await page.reload();
    await expectSettledLayout(page);
    await expectOnOneLineWhenRoom(
      inspectionGroup(card),
      [inspect, notes, action],
      "center",
    );
    await expectInReadingOrder(card, [...starts, inspect, notes, action]);
    await inspect.focus();
    await page.keyboard.press("Enter");
    const hide = inspectionGroup(card).getByRole("button", {
      name: "Hide detail",
    });
    await expectFocusedAndIndicated(page, hide);
    await expect(detail).toBeVisible();
    await expectTabOrder(page, [notes, action]);
    await page.keyboard.press("Enter");
    await expect(review).toBeVisible();
  }
});
