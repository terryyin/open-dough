// Example 5: a story completed through the real CLI and published
// (../../dashboard/tests/support/intentCompletedStory.ts) is selected by its Recently done
// card's empty area. Intent's story header names it by its done record's
// title, its identity and the revisions of its published history comparison,
// which differ from the published revision Intent describes
// (ADR 0008), since trunk has advanced past the completion. The test file the
// story deleted is absent from the published tree, yet stays in Intent as
// removed in both "Selected story only" states, with the deletion diff
// Review changes shows; the modified and added files show Review's diffs
// too. That a diff is the same in both states is proved with the moves
// (./intent-story-changes-moves.spec.ts). Historical source and missing-history
// reading: ./intent-story-completed-source.spec.ts. Intent coverage shows the
// saved assessment as stored. Workspace: ./intent-story-changes.spec.ts.
// The done card's Review changes selects it too, and toggling its selection
// clears it while the review stays open.

import { fileBrowser } from "../../dashboard/tests/support/reviewContextLine.ts";
import { reviewRegion } from "../../dashboard/tests/support/storyReviewMark.ts";
import { reviewChanges } from "../../dashboard/tests/storyCardControls.ts";
import type { Locator } from "@playwright/test";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import { shortRevision } from "../../dashboard/tests/dashboardParts.ts";
import { expandIntentGroup } from "../../dashboard/tests/intentPerspectivePage.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import {
  completedChanges as changed,
  selectCompletedStoryInIntent,
} from "../../dashboard/tests/support/intentCompletedStory.ts";
import {
  folderToggle,
  intentDiff,
  chooseStoryTab,
  expectOutsideCount,
  intentFile,
  openReviewFromIntent,
  reviewDiff,
  storyHeaderDetail,
  storyOnly,
  storySummary,
  storyTitle,
  storyHeaderReading,
} from "../../dashboard/tests/support/intentStoryPage.ts";
import {
  kindStyles,
  nameStyle,
} from "../../dashboard/tests/support/changeKindStyle.ts";
import { git } from "../../dashboard/tests/support/storyReviewWorktree.ts";
import {
  expectSelected,
  selectStory,
} from "../../dashboard/tests/storyCardSelection.ts";

const gone = "dashboard/tests/gone.spec.ts";

test("Intent overlays a completed story's published history comparison, naming it and its revisions apart from the published revision", async ({
  page,
  origin,
}) => {
  const report =
    "Outcome: Caught\nPromise: Keep the removed file in the story lens.\n" +
    'Fault: Treat a literal <img src="proof"> as source markup.\n' +
    "Evidence: The maintained assertion failed after the edit and passed after restoration.\n\n" +
    "Test runtime: 2.1 s (measured by the runner)\n" +
    "Human effort: unavailable (no human intervention observed)\n" +
    "Agent effort: 1 min (estimated from the work log)\n" +
    "Invocation-to-report elapsed: 74 s (measured by the host clock)\n";
  const { card, intent, completion, published } =
    await selectCompletedStoryInIntent(page, origin, {
      intentCoverage: { report },
    });
  const scoped = storySummary(intent);
  let baseline = "";

  await test.step("Intent names the completed story by its done record's title and identity", async () => {
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
    await expect(storyTitle(intent)).toHaveText("Story A");
    await expect(
      scoped.getByRole("heading", { name: "Intent coverage" }),
    ).toHaveCount(0);
    await storyHeaderDetail(intent);
    await expect(storyHeaderReading(intent).identity).toHaveText("SEED-A#a");
  });

  await test.step("Intent coverage shows the exact saved assessment and all four costs as text", async () => {
    await chooseStoryTab(intent, "Intent coverage");
    const coverage = intent.getByRole("region", { name: "Intent coverage" });
    await expect(
      coverage.getByRole("heading", { name: "Intent coverage" }),
    ).toBeVisible();
    const result = coverage.locator(".intent-story-coverage-text");
    await expect(result).toBeVisible();
    await expect(result).toHaveCSS("white-space", "pre-wrap");
    expect(await result.textContent()).toBe(report);
    await expect(result.locator("img")).toHaveCount(0);
    await chooseStoryTab(intent, "Changed tests");
  });

  await test.step("the compared revisions are the published comparison's, not Intent's published revision", async () => {
    const revisions = storyHeaderReading(intent).revisions;
    await expect(revisions).toContainText(
      `with completion ${shortRevision(completion)}.`,
    );
    const shown = revisions.locator("code");
    await expect(shown).toHaveCount(2);
    baseline = (await shown.first().getAttribute("title")) ?? "";
    await expect(shown.nth(1)).toHaveAttribute("title", completion);
    expect(published).not.toBe(completion);
    expect(baseline).not.toBe(published);
    expect(baseline).not.toBe(completion);
    await expect(revisions).toHaveText(
      `Compared ${shortRevision(baseline)} with completion ${shortRevision(completion)}.`,
    );
  });

  await test.step("the deleted file is absent from the published tree", () => {
    const tree = git(origin.origin, "ls-tree", "-r", "--name-only", published);
    expect(tree.split("\n")).not.toContain(gone);
    expect(tree.split("\n")).toContain("dashboard/tests/a.spec.ts");
  });

  const style = await kindStyles(intent);
  for (const only of [false, true]) {
    const state = only ? "on" : "off";
    if (only) await storyOnly(intent).check();
    await expect(storyOnly(intent)).toBeChecked({ checked: only });

    await test.step(`Selected story only ${state}: the deleted, modified, and added files show by kind`, async () => {
      await expandIntentGroup(intent, "dashboard/tests");
      for (const [name, expected] of [
        [changed.deleted, style.deleted],
        [changed.modified, style.modified],
        [changed.added, style.added],
      ] as const) {
        const file = intentFile(intent, name);
        await expect(file).toHaveCount(1);
        await expect(file).toBeVisible();
        expect(await nameStyle(file)).toEqual(expected);
      }
      // The unchanged folder stays in the whole tree only.
      await expect(folderToggle(intent, "other", false)).toHaveCount(
        only ? 0 : 1,
      );
      await expectOutsideCount(intent, 6);
    });
  }

  const inIntent = new Map<string, string>();
  await test.step("each changed file opens its diff", async () => {
    for (const name of Object.values(changed)) {
      inIntent.set(name, await intentDiff(intent, name));
    }
  });

  await test.step("each changed file's diff in Intent is the one Review changes shows", async () => {
    expect(inIntent.get(changed.deleted)).toContain("gone 0");
    expect(inIntent.get(changed.modified)).toContain("completed");
    expect(inIntent.get(changed.added)).toContain("added");
    await openReviewFromIntent(page, intent);
    const review = reviewRegion(page);
    await expect(review).toContainText("Published completion");
    // Its three test files and the six Intent counts outside the locations.
    await expect(review.locator(".story-review-files [data-kind]")).toHaveCount(
      9,
    );
    for (const [name, diff] of inIntent)
      expect(await reviewDiff(page, name), name).toBe(diff);
  });

  await test.step("the done card's Review changes selects and highlights it for Intent's summary; toggling its selection clears it and leaves the review open", async () => {
    const review = reviewRegion(page);
    const { development, intentChoice } = parts(page);
    // Beside the review the Board shows one column; the keyboard reaches the
    // done card's controls where a pointer would land on the review. Select
    // story runs the empty-area toggle (./story-card-selection.spec.ts).
    const press = async (control: Locator) => {
      await control.focus();
      await page.keyboard.press("Enter");
    };
    await development.click();
    await press(selectStory(card));
    await expectSelected(card, false);
    await press(reviewChanges(card));
    await expectSelected(card, true);
    await intentChoice.click();
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
    await expect(storyTitle(intent)).toHaveText("Story A");
    await development.click();
    await press(selectStory(card));
    await expectSelected(card, false);
    await expect(fileBrowser(review)).toBeVisible();
    await intentChoice.click();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expect(scoped).toHaveCount(0);
  });
});
