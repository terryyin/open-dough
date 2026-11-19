import { assumeReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  filesColumn,
  intentModeViews,
} from "../../dashboard/test-support/intentModePage.ts";
// A Taken card's empty area selects its story: one header above the views
// names it, its revisions and outside count, and offers Project Intent and
// Review changes. Changed tests starts with "Selected story only"; the whole
// tree shows change styling, auto-opened containing folders and the first
// changed location. The location's change mark differs from a folder's row
// background and stays visible after selection. Changed Purpose matches Review
// changes; unchanged Purpose shows published source. Closing Review changes
// preserves selection (ADR 0008); deselecting restores Project Intent.
// Selected-only, gaps, long titles and keyboard return: related Frontend
// intent-story-*.spec.ts. Moves and deletions: ./intent-story-changes-moves.spec.ts.

import {
  parts,
  shortRevision,
} from "../../dashboard/test-support/dashboardPage.ts";
import { ciPanel } from "../../dashboard/test-support/intentCiStatusPage.ts";
import {
  emptyArea,
  expectSelected,
} from "../../dashboard/test-support/storyCardSelection.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  background,
  intentStory,
} from "../../dashboard/test-support/support/intentStoryPage.ts";
import { selectTakenStoryInIntent } from "../../dashboard/test-support/support/selectTakenStoryInIntent.ts";
import {
  kindStyles,
  nameStyle,
} from "../../dashboard/test-support/support/changeKindStyle.ts";
import { changed } from "../../dashboard/test-support/support/intentStoryWorktree.ts";
import {
  intentGroupToggle,
  intentLocationName,
  purposeRegion,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import {
  expectChangedLocationHeader,
  locationHeaderLookAt,
} from "../../dashboard/test-support/intentLocationHeaderLook.ts";

test("Intent highlights a selected Taken story's test changes over the published tree, each changed file with Review changes' own diff", async ({
  page,
  origin,
}) => {
  const { card, intent, baseline, head } = await selectTakenStoryInIntent(
    page,
    origin,
  );
  const story = intentStory(intent);
  const header = story.header;
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
    await expect(story.title).toHaveText("Story A");
    await expect(intent.getByText("Story A", { exact: true })).toHaveCount(1);
    await expect(story.views).toHaveText(
      "CI comparisonChanged testsIntent coverage",
    );
    await expect(
      column.locator(":scope > :not(.visually-hidden)").first(),
    ).toHaveClass("intent-story-scope");
    await expect(story.storyOnly(column)).not.toBeChecked();
  });

  await test.step("the header names the story and the revisions its comparison runs between, with nothing to collapse", async () => {
    await story.headerDetail();
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
    await story.expectOutsideCount(2);
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
      await expect(story.folderToggle(name, true)).toBeVisible();
    await expect(story.folderToggle("other", false)).toBeVisible();
    await expect(story.file("dashboard/tests/other/c.spec.ts")).toBeHidden();
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
      const file = story.file(name);
      await expect(file).toBeVisible();
      expect(await nameStyle(file)).toEqual(expected);
    }
  });

  let changedHeader: Awaited<ReturnType<typeof locationHeaderLookAt>>;
  await test.step("changed folders share the contains-changes background; a changed location keeps its own with a change mark, kept when selected", async () => {
    const marked = await background(story.folderRow("boundary"));
    expect(marked).not.toBe("rgba(0, 0, 0, 0)");
    for (const name of ["arriving", "boundary", "out"]) {
      await expect(story.folderItem(name)).toHaveAttribute(
        "data-contains-changes",
        "true",
      );
      expect(await background(story.folderRow(name))).toBe(marked);
    }
    await expect(story.folderItem("other")).not.toHaveAttribute(
      "data-contains-changes",
    );
    expect(await background(story.folderRow("other"))).not.toBe(marked);
    for (const location of ["dashboard/tests", "tests"]) {
      await expect(story.locationGroup(location)).toHaveAttribute(
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
    const inIntent = await story.diff(changed.modified);
    expect(inIntent).toContain("more");
    await story.openReview();
    const review = await assumeReviewChanges(page);
    await review.files.expectListed(/changed file/, [
      "Modified dashboard/src/App.tsx",
    ]);
    expect(await story.reviewDiff(changed.modified)).toBe(inIntent);
    expect(await story.diff(changed.added)).toBe(
      await story.reviewDiff(changed.added),
    );
  });

  await test.step("an unchanged file shows its published source", async () => {
    await story.file("dashboard/tests/boundary/kept.spec.ts").click();
    await expect(purposeRegion(intent)).toContainText("kept 11");
    await expect(story.diffReading.code).toHaveCount(0);
  });

  await test.step("closing the story's review keeps the selected story; deselecting its card removes the header", async () => {
    const { development, intentChoice } = parts(page);
    await (await assumeReviewChanges(page)).close();
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
    await expect(story.title).toHaveText("Story A");
    await development.click();
    await expectSelected(card, true);
    await emptyArea(card).click();
    await expectSelected(card, false);
    await intentChoice.click();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expect(header.region).toHaveCount(0);
    await expect(story.outsideCount).toHaveCount(0);
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
