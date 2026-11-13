import { closeSidePanel } from "../../dashboard/tests/sidePanelFrame.ts";
import { listedFile } from "../../dashboard/tests/support/reviewTreeRows.ts";
import { reviewRegion } from "../../dashboard/tests/support/storyReviewMark.ts";
import {
  filesColumn,
  intentModeViews,
} from "../../dashboard/tests/intentModePage.ts";
// Example 1 and 3: a Taken story whose worktree changes the tests Intent
// publishes (../../dashboard/tests/support/intentStoryWorktree.ts) is selected by its card's empty
// area, and one persistent header, led by the way to Project Intent, names it
// in full, with its identity, the revisions its default Review changes
// comparison runs between, and the count of changed files outside every
// location, pointing to Review changes, above the story's views; Changed tests'
// column starts with the "Selected story only" choice. The whole published tree
// shows, changed files styled by kind and the added one inserted; the folders
// containing changes have the contains-changes background and are open, with
// the first changed location, while everything else stays collapsed. A location
// containing changes keeps its own header background with a change mark,
// distinct from a changed folder's row, and keeps the mark once selected. A
// changed file's Purpose is the same diff Review changes shows; an unchanged
// file shows its published source. Closing Review changes keeps the story
// selected (ADR 0008); deselecting its card then removes the summary and shows
// Project Intent, whose reading borrowed none of it. "Selected story only":
// ../../dashboard/tests/intent/intent-story-changes-only.spec.ts. Deletions and renames, and a folder's
// Summary of the overlaid tree: ./intent-story-changes-moves.spec.ts. No
// comparison and a failed read: ../../dashboard/tests/intent/intent-story-changes-gaps.spec.ts. A long
// title: ../../dashboard/tests/intent/intent-story-summary-title.spec.ts. Where the keyboard returns after
// closing Review changes: ../../dashboard/tests/intent/intent-story-review-return.spec.ts.

import { parts } from "../../dashboard/tests/dashboardPage.ts";
import { ciPanel } from "../../dashboard/tests/intentCiStatusPage.ts";
import { expectSelected } from "../../dashboard/tests/storyCardSelection.ts";
import { shortRevision } from "../../dashboard/tests/dashboardParts.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import {
  background,
  folderToggle,
  folderItem,
  folderRow,
  intentDiff,
  intentFile,
  expectOutsideCount,
  locationGroup,
  openReviewFromIntent,
  outsideCount,
  reviewDiff,
  selectTakenStoryInIntent,
  storyHeaderDetail,
  storyOnly,
  storyTitle,
  storyHeaderReading,
  storyViews,
  intentDiffReading,
} from "../../dashboard/tests/support/intentStoryPage.ts";
import {
  kindStyles,
  nameStyle,
} from "../../dashboard/tests/support/changeKindStyle.ts";
import { changed } from "../../dashboard/tests/support/intentStoryWorktree.ts";
import {
  intentGroupToggle,
  intentLocationName,
  purposeRegion,
} from "../../dashboard/tests/intentPerspectivePage.ts";
import {
  expectChangedLocationHeader,
  locationHeaderLookAt,
} from "../../dashboard/tests/intentLocationHeaderLook.ts";

test("Intent highlights a selected Taken story's test changes over the published tree, each changed file with Review changes' own diff", async ({
  page,
  origin,
}) => {
  const { card, intent, baseline, head } = await selectTakenStoryInIntent(
    page,
    origin,
  );
  const header = storyHeaderReading(intent);
  const column = filesColumn(intent);

  await test.step("the story's view sits under the banner, one persistent header, led by the way to Project Intent, heading its views", async () => {
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
    await expect(intent.locator(":scope > *").first()).toHaveClass(
      "intent-page-frame",
    );
    await expect(intentModeViews(intent)).toHaveCount(0);
    await expect(header.crumb).toHaveText("Project Intent / Selected story");
    await expect(header.leadingControl).toHaveAccessibleName("Project Intent");
    await expect(
      intent.getByRole("region", { name: "Selected story" }),
    ).toHaveCount(1);
    await expect(storyTitle(intent)).toHaveText("Story A");
    await expect(intent.getByText("Story A", { exact: true })).toHaveCount(1);
    await expect(storyViews(intent)).toHaveText(
      "CI comparisonChanged testsIntent coverage",
    );
    await expect(
      column.locator(":scope > :not(.visually-hidden)").first(),
    ).toHaveClass("intent-story-scope");
    await expect(storyOnly(column)).not.toBeChecked();
  });

  await test.step("the header names the story and the revisions its comparison runs between, with nothing to collapse", async () => {
    await storyHeaderDetail(intent);
    await expect(header.identity).toHaveText("SEED-A#a");
    const revisions = header.revisions;
    await expect(revisions).toContainText(
      `Compared ${shortRevision(baseline)} with worktree `,
    );
    await expect(revisions).toContainText(
      `at ${shortRevision(head)}, uncommitted changes included.`,
    );
    await expect(revisions.locator(`code[title="${baseline}"]`)).toHaveCount(1);
    await expect(revisions.locator("code").nth(1)).toContainText(
      "another-agent-workspace",
    );
  });

  await test.step("the changed files outside every location are counted once each, pointing to Review changes", async () => {
    await expectOutsideCount(intent, 2);
    await expect(intent.getByText("App.tsx")).toHaveCount(0);
    await expect(intent.getByText(/notes\.md/)).toHaveCount(0);
  });

  await test.step("the first changed location and its folders containing changes are open; the rest stay collapsed", async () => {
    await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(intentGroupToggle(intent, "tests")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    for (const name of ["arriving", "boundary", "out"])
      await expect(folderToggle(intent, name, true)).toBeVisible();
    await expect(folderToggle(intent, "other", false)).toBeVisible();
    await expect(
      intentFile(intent, "dashboard/tests/other/c.spec.ts"),
    ).toBeHidden();
  });

  await test.step("changed files are styled by kind, the added one inserted at its path", async () => {
    const style = await kindStyles(intent);
    for (const [name, expected] of [
      [changed.modified, style.modified],
      [changed.added, style.added],
      [changed.deleted, style.deleted],
      [changed.into, style.renamed],
      [changed.outOf, style.renamed],
      ["dashboard/tests/boundary/kept.spec.ts", style.plain],
    ] as const) {
      const file = intentFile(intent, name);
      await expect(file).toBeVisible();
      expect(await nameStyle(file)).toEqual(expected);
    }
  });

  let changedHeader: Awaited<ReturnType<typeof locationHeaderLookAt>>;
  await test.step("changed folders share the contains-changes background; a changed location keeps its own with a change mark, kept when selected", async () => {
    const marked = await background(folderRow(intent, "boundary"));
    expect(marked).not.toBe("rgba(0, 0, 0, 0)");
    for (const name of ["arriving", "boundary", "out"]) {
      await expect(folderItem(intent, name)).toHaveAttribute(
        "data-contains-changes",
        "true",
      );
      expect(await background(folderRow(intent, name))).toBe(marked);
    }
    await expect(folderItem(intent, "other")).not.toHaveAttribute(
      "data-contains-changes",
    );
    expect(await background(folderRow(intent, "other"))).not.toBe(marked);
    for (const location of ["dashboard/tests", "tests"]) {
      await expect(locationGroup(intent, location)).toHaveAttribute(
        "data-contains-changes",
        "true",
      );
      changedHeader = await expectChangedLocationHeader(
        intent,
        location,
        marked,
      );
    }
    await intentLocationName(intent, "dashboard/tests").click();
    await expect(intentLocationName(intent, "dashboard/tests")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    const selected = await locationHeaderLookAt(intent, "dashboard/tests");
    expect(selected.background).not.toBe(changedHeader.background);
    expect(selected.background).not.toBe(marked);
    expect(selected).toMatchObject({
      mark: changedHeader.mark,
      controlsShowHeader: true,
      fullWidth: true,
    });
  });

  await test.step("a changed file's Purpose is Review changes' diff", async () => {
    const inIntent = await intentDiff(intent, changed.modified);
    expect(inIntent).toContain("more");
    const review = await openReviewFromIntent(page, intent);
    await expect(
      listedFile(review, "Modified dashboard/src/App.tsx", { exact: true }),
    ).toBeVisible();
    expect(await reviewDiff(page, changed.modified)).toBe(inIntent);
    expect(await intentDiff(intent, changed.added)).toBe(
      await reviewDiff(page, changed.added),
    );
  });

  await test.step("an unchanged file shows its published source", async () => {
    await intentFile(intent, "dashboard/tests/boundary/kept.spec.ts").click();
    const purpose = purposeRegion(intent);
    await expect(purpose).toContainText("kept 11");
    await expect(intentDiffReading(intent).code).toHaveCount(0);
  });

  await test.step("closing the story's review keeps the selected story; deselecting its card removes the header", async () => {
    const { development, intentChoice } = parts(page);
    const review = reviewRegion(page);
    await closeSidePanel(review);
    await expect(review).toHaveCount(0);
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
    await expect(storyTitle(intent)).toHaveText("Story A");
    await development.click();
    await expectSelected(card, true);
    await card.getByRole("heading", { level: 3 }).click();
    await expectSelected(card, false);
    await intentChoice.click();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expect(header.region).toHaveCount(0);
    await expect(outsideCount(intent)).toHaveCount(0);
    await expect(intent.locator("[data-kind]")).toHaveCount(0);
    await expect(intent.locator("[data-contains-changes]")).toHaveCount(0);
    const unchanged = await locationHeaderLookAt(intent, "tests");
    expect(unchanged.mark).toBe("none");
    expect(unchanged.background).toBe(changedHeader.background);
    // Intent now shows Project Intent, whose reading never borrowed the
    // story's file (../../dashboard/src/pageIntentReading.tsx): its CI status
    // homepage.
    await expect(column.locator('[aria-pressed="true"]')).toHaveCount(0);
    await expect(ciPanel(intent)).toContainText("CI status of main");
  });
});
