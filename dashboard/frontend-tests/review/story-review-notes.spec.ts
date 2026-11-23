// A workspace's file note keeps the default comparison and has no line;
// only Add note is offered on a line of active work.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { takenIdentity, takenStory } from "../../test-support/launchJourney.ts";
import { openFrontendStoryReview } from "../../test-support/support/frontendStoryReviewOpen.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
} from "../../test-support/support/frontendStoryReview.ts";
import { installFrontendStoryNotes } from "../../test-support/support/frontendStoryNotes.ts";
import {
  intentDiffReading,
  intentFile,
} from "../../test-support/support/intentStoryPage.ts";
import { storyNotesPage } from "../../test-support/support/storyNotesPage.ts";
import { lineNumberLabel } from "../../src/diffLineSide.ts";

test("workspace file notes name the Changes comparison and its endpoints", async ({
  page,
  frontendServices,
}) => {
  const service = await installFrontendStoryNotes(page);
  const { review: intent } = await openFrontendStoryReview(
    page,
    frontendServices,
    undefined,
    (answers) => {
      answers.answerFile(frontendFileDiff("story.txt", ["+story line"]));
    },
  );
  await intentFile(intent, "Added story.txt").click();
  const reading = intentDiffReading(intent);
  await expect(reading.code).toContainText("+story line");
  const notes = storyNotesPage(page);
  const { baseline, tree } = frontendReviewIds;
  await notes.fromFile(reading.container);
  await notes.expectContext(takenStory, takenIdentity);
  await notes.expectNoComposerLine();
  await notes.expectComposerContext([
    "Intent → Changes",
    "story.txt",
    `All changes ${baseline} → ${tree}`,
  ]);
  await notes.saveDiffNote("Workspace file observation");
  expect(service.changes()).toEqual([
    {
      action: "add",
      identity: takenIdentity,
      text: "Workspace file observation",
      context: {
        view: "Intent → Changes",
        path: "story.txt",
        comparison: { name: "All changes", baseline, tree },
      },
    },
  ]);
  await reading.container
    .getByRole("button", { name: lineNumberLabel("new", 1) })
    .click();
  await expect(page.getByRole("menu").getByRole("menuitem")).toHaveText([
    "Add note",
  ]);
});
