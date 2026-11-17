// Built app with explicit retained-run/diff/notes substitutes. Published Git
// selection remains the real journey's responsibility.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
} from "../../tests/support/frontendStoryReview.ts";
import { openFrontendDoneStoryReview } from "../../tests/support/frontendStoryReviewOpen.ts";
import { installFrontendStoryNotes } from "../../tests/support/frontendStoryNotes.ts";
import { closeSidePanel } from "../../tests/sidePanelFrame.ts";
import { storyNotesPage } from "../../tests/support/storyNotesPage.ts";
import { fileDiff } from "../../tests/support/reviewTreeRows.ts";
import { showColumn } from "../../tests/boardPage.ts";
import { parts } from "../../tests/dashboardParts.ts";
import { storyA } from "../../tests/support/frontendRecentlyDoneBoardReview.ts";

const oldPath = "old-name.ts";
const path = "new-name.ts";

test("Landed run file note shows and saves renamed path and exact comparison endpoints without a line", async ({
  page,
  frontendServices,
}) => {
  const service = await installFrontendStoryNotes(page);
  const landing = makeMe.aLaunchLanding
    .comparing({
      base: frontendReviewIds.baseline,
      revision: frontendReviewIds.tree,
    })
    .please();
  const file = makeMe.aReviewedFile
    .with({ kind: "renamed", path, oldPath })
    .please();
  const { review } = await openFrontendDoneStoryReview(
    page,
    frontendServices,
    {
      kind: "landed",
      landing: {
        ...landing,
        workflow: "execution",
        launchedAt: "2026-11-17T00:00:00.000Z",
      },
      baseline: frontendReviewIds.baseline,
      tree: frontendReviewIds.tree,
      files: [file],
    },
    (answers) => {
      answers.answerFile(frontendFileDiff(path, ["+changed"]), path);
    },
  );
  const diff = fileDiff(review, `Renamed ${oldPath} → ${path}`, {
    exact: true,
  });
  const notes = storyNotesPage(page);
  await notes.fromFile(diff);
  const comparison = `Landed run ${frontendReviewIds.baseline} → ${frontendReviewIds.tree}`;
  await notes.expectComposerContext([
    storyA.title,
    storyA.identity,
    "Review changes",
    `${oldPath} → ${path}`,
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
        view: "Review changes",
        path,
        oldPath,
        comparison: {
          name: "Landed run",
          baseline: frontendReviewIds.baseline,
          tree: frontendReviewIds.tree,
        },
      },
    },
  ]);
  const card = parts(page).recentlyDone.getByRole("article", {
    name: storyA.title,
    exact: true,
  });
  await closeSidePanel(review);
  await showColumn(page, "Recently done");
  await notes.open(card);
  await notes.expectNotes(["Rename observation"]);
  await notes.expectNoteContext("Rename observation", `${oldPath} → ${path}`);
  await notes.expectNoteContext("Rename observation", comparison);
});
