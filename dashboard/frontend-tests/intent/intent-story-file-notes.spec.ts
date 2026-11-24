// A file note from Intent → Changes keeps the selected comparison: the file's
// paths, the comparison's name and exact endpoints, and no line. Line notes
// are ./intent-story-notes.spec.ts; the published note is
// e2e/review/story-review-diff-add-note.spec.ts.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { storyReviewIds as ids } from "../../../Distribution/tests/support/storyReviewCompletedTestData.mjs";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { storyNotesNames as names } from "../../test-support/storyNotesNames.ts";
import { printedDiff } from "../review/styledDiffCases.ts";
import { openStoryChanges } from "./intent-story-changes-fixtures.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import { notesKept } from "./intent-story-notes-fixture.ts";
import {
  expectComposerNames,
  purpose,
  savedNote,
  saveNote,
} from "./intent-story-notes-page.ts";

const identity = "SEED-A#a";

async function saveFileNote(
  review: StoryReview,
  path: string,
  file: string,
  context: readonly string[],
) {
  const notes = notesKept();
  await openStoryChanges({
    storyNotes: notes.source,
    review: () => Promise.resolve(review),
    fileDiff: () =>
      Promise.resolve({
        kind: "diff",
        printed: printedDiff(path, ["@@ -0,0 +1 @@", "+changed"]),
      }),
    fileText: () =>
      Promise.resolve({ kind: "text", baseline: null, tree: "changed\n" }),
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  await story.outsideFile(file).click();
  await expect.poll(story.diffName).toBe(file);
  await purpose.getByRole("button", { name: names.add, exact: true }).click();
  expect(await expectComposerNames(context)).not.toMatch(/Line [0-9]+/);
  await saveNote("File observation");
  return { changes: notes.changes(), story };
}

test("a workspace file note names All changes and its exact endpoints without a line", async () => {
  const path = "dashboard/src/story.txt";
  const comparison = `All changes ${ids.baseline} → ${ids.tree}`;
  const { changes } = await saveFileNote(
    makeMe.aStoryReview.adding(path).please(),
    path,
    `Added ${path}`,
    ["Intent → Changes", path, comparison],
  );
  await purpose
    .getByRole("button", { name: "New line 1", exact: true })
    .click();
  const menu = page.getByRole("menu", { name: "New line 1", exact: true });
  await expect.element(menu).toBeVisible();
  expect(
    menu
      .getByRole("menuitem")
      .elements()
      .map((item) => item.textContent),
  ).toEqual([names.add]);
  expect(changes).toEqual([
    {
      action: "add",
      identity,
      text: "File observation",
      context: {
        view: "Intent → Changes",
        path,
        comparison: {
          name: "All changes",
          baseline: ids.baseline,
          tree: ids.tree,
        },
      },
    },
  ]);
});

test("a landed run's file note keeps the renamed paths and exact endpoints without a line", async () => {
  const oldPath = "dashboard/src/old-name.ts";
  const path = "dashboard/src/new-name.ts";
  const rename = `${oldPath} → ${path}`;
  const comparison = `Landed run ${ids.baseline} → ${ids.tree}`;
  const { changes, story } = await saveFileNote(
    makeMe.aStoryReview.landed().renaming(oldPath, path).please(),
    path,
    `Renamed ${rename}`,
    ["Intent → Changes", rename, comparison],
  );
  const entry = await savedNote(story.header, "File observation");
  expect(entry).toContain(rename);
  expect(entry).toContain(comparison);
  expect(entry).not.toMatch(/Line [0-9]+/);
  expect(changes).toEqual([
    {
      action: "add",
      identity,
      text: "File observation",
      context: {
        view: "Intent → Changes",
        path,
        oldPath,
        comparison: {
          name: "Landed run",
          baseline: ids.baseline,
          tree: ids.tree,
        },
      },
    },
  ]);
});
