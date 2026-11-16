import { openStoryIntent } from "../../tests/intentModePage.ts";
import {
  putFrontendIntentStory,
  answerFrontendIntentChanges,
  frontendIntentChanges,
} from "../../tests/support/frontendIntentStory.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { frontendFileDiff } from "../../tests/support/frontendStoryReview.ts";
import { answerFrontendIntentCi } from "../../tests/support/frontendIntentCi.ts";
import { chooseStoryTab } from "../../tests/support/intentStoryPage.ts";
// Closing Review changes opened by keyboard from the selected story's header
// in Intent keeps the selected story (ADR 0008): Intent still shows the story
// on Changed tests with the same file's Proof, its Purpose at the same
// reading position, and the keyboard returns to the header's count that opened
// the review (../../src/keyboardReturn.ts). The header's count:
// ../../../e2e/intent/intent-story-changes.spec.ts.

import { closeSidePanel } from "../../tests/sidePanelFrame.ts";
import { fileBrowser } from "../../tests/support/reviewContextLine.ts";
import { reviewRegion } from "../../tests/support/storyReviewMark.ts";
import type { Locator, Page } from "@playwright/test";
import {
  fileReadingTab,
  proofRegion,
} from "../../tests/intentPerspectivePage.ts";
import {
  intentReadingScroll,
  scrollIntentReadingHalfway,
} from "../../tests/intentReadingPlacePage.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { expectReviewRead } from "../../tests/support/reviewRead.ts";
import {
  expectOutsideCount,
  expectStoryTab,
  intentFile,
  outsideCount,
  storyTitle,
  intentDiffReading,
} from "../../tests/support/intentStoryPage.ts";
import { deepSpec } from "../../tests/support/intentStoryWorktree.ts";

// Opens Review changes from the header's count and closes it, both by keyboard.
async function reviewByKeyboard(page: Page, intent: Locator) {
  await outsideCount(intent).focus();
  await page.keyboard.press("Enter");
  const review = reviewRegion(page);
  await expectReviewRead(review);
  await expect(fileBrowser(review)).toBeVisible();
  await closeSidePanel(review, { using: "keyboard", key: "Enter" });
  await expect(review).toHaveCount(0);
}

// The story, its Changed tests view and the file Intent still shows, and the
// keyboard back on the header's count.
async function expectStoryReadingKept(intent: Locator) {
  await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
  await expect(storyTitle(intent)).toHaveText("Story A");
  await expectStoryTab(intent, "Changed tests");
  await expect(intentFile(intent, deepSpec)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(outsideCount(intent)).toBeFocused();
}

test("closing Review changes opened by keyboard from the header keeps the story's reading and returns the keyboard to the header's count", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  putFrontendIntentStory(frontendServices);
  const review = await answerFrontendIntentChanges(page, [
    ...frontendIntentChanges,
    makeMe.aReviewedFile
      .with({
        kind: "added",
        path: "dashboard/tests/boundary/deep/long.spec.ts",
      })
      .please(),
  ]);
  review.answerFile(
    frontendFileDiff(
      "dashboard/tests/boundary/deep/long.spec.ts",
      [...Array(120).keys()].map((index) => `+long ${String(index + 1)}`),
    ),
    "dashboard/tests/boundary/deep/long.spec.ts",
  );
  await answerFrontendIntentCi(page, frontendServices.revision);
  const { intent } = await openStoryIntent(page, "Story A");
  await chooseStoryTab(intent, "Changed tests");
  await intentFile(intent, deepSpec).click();
  await expectOutsideCount(intent, 2);

  await test.step("Purpose keeps its reading position", async () => {
    await expect(intentDiffReading(intent).code).toHaveAttribute(
      "aria-busy",
      "false",
    );
    const offset = await scrollIntentReadingHalfway(intent);
    await reviewByKeyboard(page, intent);
    await expectStoryReadingKept(intent);
    await expect.poll(() => intentReadingScroll(intent)).toBe(offset);
  });

  await test.step("Proof stays the file's chosen reading", async () => {
    await fileReadingTab(intent, "Proof").click();
    const storyCi = proofRegion(intent).getByRole("button", {
      name: "View story CI comparison",
    });
    await expect(storyCi).toBeVisible();
    await reviewByKeyboard(page, intent);
    await expectStoryReadingKept(intent);
    await expect(fileReadingTab(intent, "Proof")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(storyCi).toBeVisible();
  });
});
