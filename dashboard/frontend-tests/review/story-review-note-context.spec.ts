import { storyA } from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";
// A Done card's landed run keeps both paths and captured endpoints in its file note.
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { storyReviewIds as ids } from "../../../Distribution/tests/support/storyReviewSnapshotTestData.mjs";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { openFrontendDoneStoryReview } from "../../test-support/support/frontendStoryReviewOpen.ts";
import { frontendFileDiff } from "../../test-support/support/frontendStoryReview.ts";
import { installFrontendStoryNotes } from "../../test-support/support/frontendStoryNotes.ts";
import {
  intentDiffReading,
  intentFile,
  storySummary,
} from "../../test-support/support/intentStoryPage.ts";
import { storyNotesPage } from "../../test-support/support/storyNotesPage.ts";

test("Changes saves a landed run's renamed paths and exact endpoints without a line", async ({
  page,
  frontendServices,
}) => {
  const oldPath = "old-name.ts";
  const path = "new-name.ts";
  const landed = makeMe.aStoryReview.landed().renaming(oldPath, path).please();
  const service = await installFrontendStoryNotes(page);
  const { review: intent } = await openFrontendDoneStoryReview(
    page,
    frontendServices,
    landed,
    (answers) => {
      answers.answerHistoricalSnapshot(storyA.identity, landed);
      answers.answerFile(frontendFileDiff(path, ["+changed"]), path);
    },
  );
  const rename = `${oldPath} → ${path}`;
  await intentFile(intent, `Renamed ${rename}`).click();
  const reading = intentDiffReading(intent);
  await expect(reading.code).toContainText("+changed");
  const notes = storyNotesPage(page);
  const comparison = `Landed run ${ids.baseline} → ${ids.tree}`;
  await notes.fromFile(reading.container);
  await notes.expectComposerContext([
    storyA.title,
    storyA.identity,
    "Intent → Changes",
    rename,
    comparison,
  ]);
  await notes.expectNoComposerLine();
  await notes.saveDiffNote("Rename observation");
  expect(service.changes()).toEqual([
    {
      action: "add",
      identity: storyA.identity,
      text: "Rename observation",
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
  await notes.open(storySummary(intent), "keyboard");
  await notes.expectContext(storyA.title, storyA.identity);
  await notes.expectNoteContext("Rename observation", rename);
  await notes.expectNoteContext("Rename observation", comparison);
  await notes.expectNoteWithoutLine("Rename observation");
});
