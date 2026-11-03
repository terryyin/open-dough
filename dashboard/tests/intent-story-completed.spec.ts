// Example 5: a story completed through the real CLI and published
// (./support/intentCompletedStory.ts) is selected by its Recently done
// card's empty area. Intent names it by its done record's title and
// identity, and states the revisions of its published history comparison,
// which differ from the published revision Intent and its Proof describe
// (ADR 0008), since trunk has advanced past the completion. The test file the
// story deleted is absent from the published tree, yet stays in Intent as
// removed in both "Selected story only" states, with the deletion diff
// Review changes shows; the modified and added files show Review's diffs
// too. A completed story whose published comparison cannot be recovered
// says why, with no retry, and leaves the published tree usable. The
// workspace journey: ./intent-story-changes.spec.ts. The done card's Review
// changes selects it too, and toggling its selection clears it while the
// review stays open.

import type { Locator } from "@playwright/test";
import { parts } from "./dashboardPage.ts";
import { shortRevision } from "./dashboardParts.ts";
import {
  chooseReadingTab,
  expandIntentGroup,
} from "./intentPerspectivePage.ts";
import { expect, test } from "./support/preparationPage.ts";
import {
  completedChanges as changed,
  selectCompletedStoryInIntent,
} from "./support/intentCompletedStory.ts";
import {
  folderCaret,
  intentDiff,
  intentFile,
  kindStyles,
  lens,
  nameStyle,
  openReviewFromIntent,
  reviewDiff,
  storyOnly,
} from "./support/intentStoryPage.ts";
import { git } from "./support/storyReviewWorktree.ts";
import { expectSelected, selectStory } from "./storyCardSelection.ts";

test.setTimeout(180_000);

const gone = "dashboard/tests/gone.spec.ts";
// Why a shallow checkout's published history yields no comparison.
const unrecoverable =
  "Published execution history does not establish a complete claim and its attributed commits for this completion.";

test("Intent overlays a completed story's published history comparison, naming it and its revisions apart from the published revision", async ({
  page,
  origin,
}) => {
  test.slow();
  const { card, intent, completion, published } =
    await selectCompletedStoryInIntent(page, origin);
  const scoped = lens(intent);
  // Proof's revision note, after choosing its tab.
  const proofRevision = async () =>
    (await chooseReadingTab(intent, "Proof")).locator(
      ".intent-proof-published code",
    );
  let baseline = "";

  await test.step("Intent names the completed story by its done record's title and identity", async () => {
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
    await expect(scoped.locator(".intent-story-name")).toHaveText(
      "Story Story A SEED-A#a",
    );
  });

  await test.step("the compared revisions are the published comparison's, not Intent's published revision", async () => {
    const revisions = scoped.locator(".intent-story-revisions");
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
  const inIntent = new Map<string, string>();
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
      await expect(folderCaret(intent, "other", false)).toHaveCount(
        only ? 0 : 1,
      );
      await expect(intent.locator(".intent-story-outside")).toHaveText(
        "6 changed files outside Intent locations are shown in Review changes. Review changes",
      );
    });

    await test.step(`Selected story only ${state}: each changed file opens its diff, Proof naming the published revision`, async () => {
      for (const name of Object.values(changed)) {
        const diff = await intentDiff(intent, name);
        if (only) expect(diff, name).toBe(inIntent.get(name));
        inIntent.set(name, diff);
        await expect(await proofRevision()).toHaveText(
          shortRevision(published),
        );
      }
      await intentFile(intent, changed.deleted).click();
      await expect(await chooseReadingTab(intent, "Proof")).toContainText(
        `The published revision has no ${gone}.`,
      );
    });
  }

  await test.step("each changed file's diff in Intent is the one Review changes shows", async () => {
    expect(inIntent.get(changed.deleted)).toContain("gone 0");
    expect(inIntent.get(changed.modified)).toContain("completed");
    expect(inIntent.get(changed.added)).toContain("added");
    await openReviewFromIntent(page, intent);
    const review = page.getByRole("region", { name: "Story review" });
    await expect(review).toContainText("Published completion");
    // Its three test files and the six Intent counts outside the locations.
    await expect(review.locator(".story-review-files [data-kind]")).toHaveCount(
      9,
    );
    for (const [name, diff] of inIntent)
      expect(await reviewDiff(page, name), name).toBe(diff);
  });

  await test.step("the done card's Review changes selects and highlights it for Intent's lens; toggling its selection clears it and leaves the review open", async () => {
    const review = page.getByRole("region", { name: "Story review" });
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
    await press(card.getByRole("button", { name: "Review changes" }));
    await expectSelected(card, true);
    await intentChoice.click();
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
    await expect(scoped.locator(".intent-story-name")).toHaveText(
      "Story Story A SEED-A#a",
    );
    await development.click();
    await press(selectStory(card));
    await expectSelected(card, false);
    await expect(review.locator(".story-review-files")).toBeVisible();
    await intentChoice.click();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expect(scoped).toHaveCount(0);
  });
});

test("a completed story whose published comparison cannot be recovered says why, with no retry, and leaves the tree usable", async ({
  page,
  origin,
}) => {
  test.slow();
  const { card, intent } = await selectCompletedStoryInIntent(
    page,
    origin,
    "shallow",
  );
  const scoped = lens(intent);
  await expect(scoped.locator(".intent-story-name")).toHaveText(
    "Story Story A SEED-A#a",
  );
  const problem = scoped.locator(".intent-story-problem");
  await expect(problem).toHaveAttribute("role", "status");
  await expect(problem).toHaveText(
    `${unrecoverable} Intent shows the published tree without the story's changes.`,
  );
  await expect(scoped.getByRole("button", { name: "Retry" })).toHaveCount(0);
  await expect(scoped.locator(".intent-story-revisions")).toHaveCount(0);
  await expect(storyOnly(intent)).toHaveCount(0);
  await expect(intent.locator("[data-kind]")).toHaveCount(0);
  await expect(intent.locator(".intent-story-outside")).toHaveCount(0);
  await expect(intent.getByText(/No test files|no changes/i)).toHaveCount(0);
  await expandIntentGroup(intent, "dashboard/tests");
  await intentFile(intent, "dashboard/tests/a.spec.ts").click();
  await expect(intent.getByRole("region", { name: "Purpose" })).toContainText(
    "completed",
  );
  // Review changes gives the completed story the same explanation.
  const { development } = parts(page);
  await development.click();
  await card.getByRole("button", { name: "Review changes" }).click();
  await expect(
    page.getByRole("region", { name: "Story review" }),
  ).toContainText(unrecoverable);
});
