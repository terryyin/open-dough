// One notes collection follows identity across launches and published phases:
// each later mount reads the notes service the first mount saved to, as the
// built app's reloads read the same app-owned notes.
import { expect, test } from "vitest";
import { commands } from "vitest/browser";
import { mountAnsweredDashboard } from "../../test-support/mounted-dashboard/mountedDashboard.ts";
import {
  boardCard as card,
  wide,
} from "../../test-support/mounted-dashboard/mountedStoryNotesBoard.ts";
import { storyNotesPage } from "../../test-support/mounted-dashboard/mountedStoryNotesPage.ts";
import {
  closeSidePanel,
  fileDiff,
  openStoryReview,
} from "../../test-support/mounted-dashboard/mountedStoryReviewPage.ts";
import { frontendReviewIds } from "../../test-support/support/frontendStoryReviewFixtures.ts";

test("a Taken note survives a new launch and appears on Done without workspace or launch records", async () => {
  const boards = await commands.retainedNoteBoards();
  const { boardPositionKey, story } = boards;
  const notes = storyNotesPage();
  const reviewed = await mountAnsweredDashboard({
    answers: boards.reviewed,
    boardPositionKey,
    viewport: wide,
  });
  const review = await openStoryReview(card("Taken", story.title));
  await notes.fromLine(fileDiff(review, "Added story.txt"), "new", 1);
  await notes.saveDiffNote("Keep this observation through completion");
  await closeSidePanel(review);
  reviewed.unmount();
  const relaunched = await mountAnsweredDashboard({
    answers: boards.relaunched,
    boardPositionKey,
    viewport: wide,
    notes: reviewed.notes,
  });
  await notes.open(card("Taken", story.title));
  await notes.expectNotes(["Keep this observation through completion"]);
  await notes.close();
  relaunched.unmount();
  await mountAnsweredDashboard({
    answers: boards.done,
    boardPositionKey,
    viewport: wide,
    notes: reviewed.notes,
  });
  const done = card("Recently done", story.title);
  await notes.expectCount(done, 1);
  await notes.open(done);
  await notes.expectNotes(["Keep this observation through completion"]);
  for (const context of [
    `${story.title} · ${story.identity}`,
    "Review changes",
    "story.txt",
    `All changes ${frontendReviewIds.baseline} → ${frontendReviewIds.tree}`,
    "Line 1 · new",
    "Kept line",
  ])
    await notes.expectNoteContext(
      "Keep this observation through completion",
      context,
    );
  expect(reviewed.notes.changes).toEqual([
    {
      action: "add",
      identity: story.identity,
      text: "Keep this observation through completion",
      context: {
        view: "Review changes",
        path: "story.txt",
        comparison: {
          name: "All changes",
          baseline: frontendReviewIds.baseline,
          tree: frontendReviewIds.tree,
        },
        line: { number: 1, side: "new", text: "Kept line" },
      },
    },
  ]);
});
