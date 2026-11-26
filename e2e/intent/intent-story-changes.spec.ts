import {
  filesColumn,
  intentModeViews,
  storyHomeButton,
} from "../../dashboard/test-support/intentModePage.ts";
// A Taken card's empty area selects its story: one header above the views
// names it, its revisions and outside count, and offers Project Intent and
// Review changes. Changes starts with "Changes only" on; off, the whole
// tree shows change styling, auto-opened containing folders and the first
// changed location. Header appearance is proved by the mounted sidebar spec.
// Changed Purpose matches Review
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
  expandIntentGroup,
  intentGroupToggle,
  intentLocationName,
  purposeRegion,
  revealIntentLocation,
} from "../../dashboard/test-support/intentPerspectivePage.ts";

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

  await test.step("the selected story's persistent header sits above its views", async () => {
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
    await expect(intent.locator(":scope > *").first()).toHaveClass(
      "intent-page-frame",
    );
    await expect(intentModeViews(intent)).toHaveCount(0);
    await expect(header.crumb).toHaveText("Selected story");
    await expect(
      intent.getByRole("region", { name: "Selected story" }),
    ).toHaveCount(1);
    await expect(story.title).toHaveText("Story A");
    await expect(intent.getByText("Story A", { exact: true })).toHaveCount(1);
    await expect(story.views).toHaveText("CI comparisonIntent coverage");
    await expect(storyHomeButton(intent)).toBeVisible();
    await expect(story.changesOnly(column)).toBeChecked();
  });

  await test.step("the persistent header names the story and its published comparison", async () => {
    await story.headerDetail();
    await expect(header.identity).toHaveText("SEED-A#a");
    await expect(header.revisions).toContainText("Published story branch");
    await expect(header.revisions).toContainText(`Baseline ${baseline}.`);
    await expect(header.revisions).toContainText(
      `Head ${shortRevision(head)}.`,
    );
  });

  await test.step("the changed product and document files each have one repository row", async () => {
    await expect(story.tree.getByText("App.tsx")).toHaveCount(1);
    await expect(story.tree.getByText(/notes\.md/)).toHaveCount(1);
  });

  await test.step("the first changed location and its folders containing changes are open; the rest stay collapsed and unchanged folders are not listed", async () => {
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
    await expect(story.folderToggle("other", false)).toHaveCount(0);
    await expect(story.file("dashboard/tests/other/c.spec.ts")).toHaveCount(0);
  });

  await test.step("turning Changes only off lists the revision's unchanged files, their folders collapsed", async () => {
    await story.changesOnly(column).uncheck();
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

  await test.step("changed folders share the contains-changes background and changed locations remain marked", async () => {
    const marked = await background(
      story.folderRowAt("dashboard/tests/boundary"),
    );
    expect(marked).not.toBe("rgba(0, 0, 0, 0)");
    for (const path of [
      "dashboard/tests/arriving",
      "dashboard/tests/boundary",
      "scripts",
    ]) {
      await expect(story.folderAt(path)).toHaveAttribute(
        "data-contains-changes",
        "true",
      );
      expect(await background(story.folderRowAt(path))).toBe(marked);
    }
    await expect(story.folderAt("dashboard/tests/other")).not.toHaveAttribute(
      "data-contains-changes",
    );
    expect(
      await background(story.folderRowAt("dashboard/tests/other")),
    ).not.toBe(marked);
    for (const location of ["dashboard/tests", "tests"]) {
      await expect(story.folderAt(location)).toHaveAttribute(
        "data-contains-changes",
        "true",
      );
    }
    await story.folderToggle("dashboard", true).click();
    const root = await revealIntentLocation(intent, "dashboard/tests");
    await root.click();
    await expect(intentLocationName(intent, "dashboard/tests")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await story.folderToggle("dashboard", true).click();
    await expandIntentGroup(intent, "dashboard/tests");
    await expect(story.file(changed.modified)).toBeVisible();
  });

  await test.step("a changed file's Purpose is its diff", async () => {
    expect(await story.diff(changed.modified)).toContain("more");
  });

  await test.step("an unchanged file shows its published source", async () => {
    await story.file("dashboard/tests/boundary/kept.spec.ts").click();
    await expect(purposeRegion(intent)).toContainText("kept 11");
    await expect(story.diffReading.code).toHaveCount(0);
  });

  await test.step("deselecting its card removes the header", async () => {
    const { development, intentChoice } = parts(page);
    await development.click();
    await expectSelected(card, true);
    await emptyArea(card).click();
    await expectSelected(card, false);
    await intentChoice.click();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expect(header.region).toHaveCount(0);
    await expect(story.tree).toBeVisible();
    await expect(intent.locator("[data-kind]")).toHaveCount(0);
    await expect(intent.locator("[data-contains-changes]")).toHaveCount(0);
    // Intent now shows Project Intent, whose reading never borrowed the
    // story's file (../../dashboard/src/pageIntentReading.tsx): its CI status
    // homepage.
    await expect(column.locator('[aria-pressed="true"]')).toHaveCount(0);
    await expect(ciPanel(intent)).toContainText("CI status of main");
  });
});
