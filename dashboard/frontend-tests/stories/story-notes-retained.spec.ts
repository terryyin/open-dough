// One notes collection follows identity across launches and published phases.
import { expect, test } from "../../tests/support/frontendApp.ts";
import { installFrontendStoryNotes } from "../../tests/support/frontendStoryNotes.ts";
import { openFrontendBoardReview } from "../../tests/support/frontendRecentlyDoneBoardReview.ts";
import {
  putFrontendDoneRecords,
  frontendStoryLaunch,
} from "../../tests/support/frontendServiceState.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { takenIdentity, takenStory } from "../../tests/launchJourney.ts";
import { parts } from "../../tests/dashboardParts.ts";
import { showColumn } from "../../tests/boardPage.ts";
import { storyNotesPage } from "../../tests/support/storyNotesPage.ts";
import { describedBacklog } from "../../tests/describedRevisions.ts";

test("a Taken note survives a new launch and appears on Done without workspace or launch records", async ({
  page,
  frontendServices,
}) => {
  const service = await installFrontendStoryNotes(page);
  frontendServices.answerMachine(
    makeMe.aMachineAnswer
      .observingOpen(frontendStoryLaunch("executing", takenStory).please())
      .please(),
  );
  await openFrontendBoardReview(page, frontendServices);
  await showColumn(page, "Taken");
  const card = parts(page).taken.getByRole("article", {
    name: takenStory,
    exact: true,
  });
  const notes = storyNotesPage(page);
  await notes.open(card);
  await notes.add();
  await notes.type("Keep this observation through completion");
  await notes.save();
  await notes.expectSaved();
  await notes.close();
  frontendServices.answerMachine(
    makeMe.aMachineAnswer
      .observingOpen(
        frontendStoryLaunch("executing", takenStory)
          .inClaudeSession({
            sessionId: "second-story-launch",
            shortId: "second",
          })
          .please(),
      )
      .please(),
  );
  await page.reload();
  await showColumn(page, "Taken");
  await notes.open(card);
  await notes.expectNotes(["Keep this observation through completion"]);
  await notes.close();
  Object.assign(frontendServices, {
    backlog: describedBacklog(
      makeMe.aRepository
        .withRevision("story-completed", { backlog: { queued: [] } })
        .please(),
    ),
  });
  putFrontendDoneRecords(frontendServices, "open-dough", [
    makeMe.aDoneRecord
      .with({
        identity: takenIdentity,
        title: takenStory,
        completedAt: new Date().toISOString(),
      })
      .please(),
  ]);
  frontendServices.answerMachine(makeMe.aMachineAnswer.please());
  await page.reload();
  await showColumn(page, "Recently done");
  const done = parts(page).recentlyDone.getByRole("article", {
    name: takenStory,
    exact: true,
  });
  await notes.expectCount(done, 1);
  await notes.open(done);
  await notes.expectNotes(["Keep this observation through completion"]);
  await notes.expectEntryContext(0, `${takenStory} · ${takenIdentity}`);
  expect(service.changes()).toEqual([
    {
      action: "add",
      identity: takenIdentity,
      text: "Keep this observation through completion",
    },
  ]);
});
