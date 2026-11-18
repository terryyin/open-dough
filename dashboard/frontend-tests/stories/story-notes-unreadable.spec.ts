// Built frontend with the notes service's unreadable answer; the real store's
// refusal and preservation are proved in story-notes-admission.spec.ts.
import { test } from "../../test-support/support/frontendApp.ts";
import {
  openFrontendBoardReview,
  storyA,
} from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";
import { installFrontendStoryNotes } from "../../test-support/support/frontendStoryNotes.ts";
import { storyNotesPage } from "../../test-support/support/storyNotesPage.ts";
import { parts } from "../../test-support/dashboardParts.ts";
import { showColumn } from "../../test-support/boardPage.ts";
import { readyStory, takenStory } from "../../test-support/launchJourney.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";

test("unreadable notes replace the count on every card kind and say so in Story notes", async ({
  page,
  frontendServices,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  const service = await installFrontendStoryNotes(page);
  service.answer("open-dough", {
    [storyA.identity]: [makeMe.aStoryNote.please()],
  });
  await openFrontendBoardReview(page, frontendServices);
  const notes = storyNotesPage(page);
  const done = parts(page).recentlyDone.getByRole("article", {
    name: storyA.title,
    exact: true,
  });
  await notes.expectCount(done, 1);
  service.unreadable("open-dough");
  await page.clock.runFor(checkIntervalMs);
  const problem = "The notes could not be read.";
  await notes.expectUnreadable(done, problem);
  await notes.open(done);
  await notes.expectProblem(problem);
  await notes.add();
  await notes.type("Keep this draft while the notes file needs recovery.");
  await notes.save();
  await notes.expectProblem("The note could not be saved.");
  await notes.expectComposing(
    "Keep this draft while the notes file needs recovery.",
  );
  await notes.close();
  await showColumn(page, "Taken");
  await notes.expectUnreadable(
    parts(page).taken.getByRole("article", { name: takenStory, exact: true }),
    problem,
  );
  await showColumn(page, "Backlog");
  await notes.expectUnreadable(
    parts(page).backlog.getByRole("article", { name: readyStory, exact: true }),
    problem,
  );
});
