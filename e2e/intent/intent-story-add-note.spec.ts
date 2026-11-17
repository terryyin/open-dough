// The first exposed Intent diff action must already save the correct view.
import { intentReadingPane } from "../../dashboard/tests/intentReadingPlacePage.ts";
import { contextExpansion } from "../../dashboard/tests/support/expandContextDiff.ts";
import { lineNumberControl } from "../../dashboard/tests/support/diffLineFollowUpPage.ts";
import {
  scrollPane,
  scrollTopOf,
} from "../../dashboard/tests/support/reviewPanes.ts";
import {
  expandContextLines,
  writeAt,
  commitAll,
  git,
} from "../../dashboard/tests/support/storyReviewWorktree.ts";
import { storySummary } from "../../dashboard/tests/intentModePage.ts";
import { queuedIdentity } from "../../dashboard/tests/support/startOrigin.ts";
import { parts } from "../../dashboard/tests/dashboardParts.ts";
import { showColumn } from "../../dashboard/tests/boardPage.ts";
import { expandIntentGroup } from "../../dashboard/tests/intentPerspectivePage.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import {
  completedChanges,
  selectCompletedStoryInIntent,
} from "../../dashboard/tests/support/intentCompletedStory.ts";
import {
  chooseStoryTab,
  intentFile,
  intentDiffReading,
} from "../../dashboard/tests/support/intentStoryPage.ts";
import { storyNotesPage } from "../../dashboard/tests/support/storyNotesPage.ts";

test("Intent Changed tests line note keeps its Intent view", async ({
  page,
  origin,
}) => {
  const { intent, card } = await selectCompletedStoryInIntent(page, origin);
  await chooseStoryTab(intent, "Changed tests");
  await expandIntentGroup(intent, "dashboard/tests");
  await intentFile(intent, completedChanges.modified).click();
  const reading = intentDiffReading(intent);
  await expect(reading.name).toHaveText(completedChanges.modified);
  const notes = storyNotesPage(page);
  await notes.fromLine(reading.container, "new", 13);
  await notes.expectComposerContext([
    "Intent → Changed tests",
    "dashboard/tests/a.spec.ts",
    "Published completion",
    "completed",
  ]);
  await notes.type("Intent observation");
  await notes.save();
  await notes.expectDiffSaved();
  await parts(page).development.click();
  await showColumn(page, "Recently done");
  await notes.open(card);
  await notes.expectNotes(["Intent observation"]);
  await notes.expectEntryContext(0, "Intent → Changed tests");
  await notes.expectEntryContext(0, "completed");
});

test("Notes from Intent Changed tests preserves the displayed diff and returns focus", async ({
  page,
  origin,
}) => {
  const original = expandContextLines("test", 160);
  const { intent } = await selectCompletedStoryInIntent(page, origin, {
    beforeStory: (project) => {
      writeAt(project, "dashboard/tests/a.spec.ts", original);
      commitAll(project, "long test with omitted context");
      git(project, "push", "--quiet", "origin", "main");
    },
    implementation: {
      message: "change a test line",
      files: {
        "dashboard/tests/a.spec.ts": original.replace(
          "test 54\n",
          "changed test\n",
        ),
      },
    },
  });
  await chooseStoryTab(intent, "Changed tests");
  await expandIntentGroup(intent, "dashboard/tests");
  await intentFile(intent, completedChanges.modified).click();
  const reading = intentDiffReading(intent);
  await expect(reading.name).toHaveText(completedChanges.modified);
  const notes = storyNotesPage(page);
  await notes.fromFile(reading.container);
  await notes.type("Keep this Intent observation");
  await notes.save();
  await notes.expectDiffSaved();
  await contextExpansion(
    reading.container.getByRole("list", {
      name: "Omitted lines before the next change",
    }),
    /Show 20 preceding/,
  ).click();
  const revealed = lineNumberControl(reading.container, "old", 40);
  await expect(revealed).toHaveCount(1);
  const readingPane = intentReadingPane(intent);
  const readingAt = await scrollPane(readingPane, 150);
  expect(readingAt).toBeGreaterThan(0);
  const summary = storySummary(intent);
  const comparisonBefore = await summary.textContent();
  if (comparisonBefore === null) throw new Error("Comparison was not shown");
  await notes.expectCount(summary, 1);
  await notes.open(summary, "keyboard");
  await notes.expectContext("Story A", queuedIdentity);
  await notes.expectNotes(["Keep this Intent observation"]);
  await notes.close();
  await notes.expectOpenerFocused(summary);
  await expect(summary).toHaveText(comparisonBefore);
  await expect(reading.name).toHaveText(completedChanges.modified);
  await expect(revealed).toHaveCount(1);
  expect(await scrollTopOf(readingPane)).toBe(readingAt);
});
