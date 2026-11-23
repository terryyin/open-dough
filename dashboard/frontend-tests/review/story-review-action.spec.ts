// Review changes on the Taken story's card, offered by its kept launch
// record: it follows Inspect story and Notes in the card's inspection group,
// below the launch group's Starts, and the keyboard reaches it in that order. It
// leads with a decorative review glyph and ends with a decorative arrow
// toward Intent.

import type { Page } from "@playwright/test";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import {
  storyCardLaunchActions,
  expectActionGlyph,
  inspectionGroup,
  launchGroup,
  reviewChanges,
  storyNotesControl,
} from "../../test-support/storyCardControls.ts";
import {
  expectFocusedAndIndicated,
  expectTabOrder,
  narrowWindow,
  twiceZoomedWindow,
} from "../../test-support/accessibleReading.ts";
import {
  expectInReadingOrder,
  expectOnOneLine,
  expectOnOneLineWhenRoom,
  expectStackedInOrder,
} from "../../test-support/pageLayout.ts";
import { expectSettledPage, parts } from "../../test-support/dashboardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  takenStory,
} from "../../test-support/launchJourney.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  frontendStoryLaunch,
  putFrontendStories,
} from "../../test-support/support/frontendServiceState.ts";
import { installFrontendStoryReview } from "../../test-support/support/frontendStoryReview.ts";
import { showColumn } from "../../test-support/boardPage.ts";
import { expectStoryTab, storyTab } from "../../test-support/intentModePage.ts";

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
  const { intent, development } = parts(page);
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
    await expectStoryTab(intent, "Changes");
    await expect(storyTab(intent, "Changes")).toBeFocused();
    await development.click();
  }
});

const workspace = {
  workspace: "/tmp/card-review-intent",
  branch: "claude/story-c",
};
const subject = { title: notRefinedStory, identity: notRefinedIdentity };
const sources = {
  launch: () =>
    makeMe.aMachineAnswer
      .observingOpen(
        makeMe.aLaunchRecord
          .executing(subject)
          .onStoryBranch(workspace)
          .please(),
      )
      .please(),
  preparation: () =>
    makeMe.aMachineAnswer
      .observingOpen(
        makeMe.aLaunchRecord
          .refining(subject)
          .onStoryBranch(workspace)
          .please(),
      )
      .please(),
  claim: () =>
    makeMe.aMachineAnswer
      .holdingWorkspaces({
        ...workspace,
        source: "open-dough",
        identity: notRefinedIdentity,
        agent: "Yui",
      })
      .please(),
  none: () => makeMe.aMachineAnswer.please(),
};

for (const column of ["Backlog", "Taken"] as const) {
  for (const [source, machine] of Object.entries(sources)) {
    test(`${column} card Review changes eligibility and route with ${source}`, async ({
      page,
      frontendServices,
    }) => {
      putFrontendStories(frontendServices, {
        taken:
          column === "Taken" ? [takenStory, notRefinedStory] : [takenStory],
      });
      frontendServices.answerMachine(machine());
      await installFrontendStoryReview(page);
      await page.goto("/");
      await showColumn(page, column);
      const { backlog, taken, intent } = parts(page);
      const card = (column === "Taken" ? taken : backlog).getByRole("article", {
        name: notRefinedStory,
        exact: true,
      });
      await expect(card).toBeVisible();
      const action = reviewChanges(inspectionGroup(card));
      if (source === "none") {
        await expect(action).toHaveCount(0);
        return;
      }
      await expect(action).toBeVisible();
      await action.click();
      await expectStoryTab(intent, "Changes");
      await expect(intent).toHaveAttribute(
        "data-selected-story",
        notRefinedIdentity,
      );
      await expect(storyTab(intent, "Changes")).toBeFocused();
    });
  }
}
