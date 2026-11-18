// One notes collection follows identity across launches and published phases.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { installFrontendStoryNotes } from "../../test-support/support/frontendStoryNotes.ts";
import { openFrontendStoryReview } from "../../test-support/support/frontendStoryReviewOpen.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
} from "../../test-support/support/frontendStoryReview.ts";
import { fileDiff } from "../../test-support/support/reviewTreeRows.ts";
import { closeSidePanel } from "../../test-support/sidePanelFrame.ts";
import {
  putFrontendDoneRecords,
  frontendStoryLaunch,
} from "../../test-support/support/frontendServiceState.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { takenIdentity, takenStory } from "../../test-support/launchJourney.ts";
import { parts } from "../../test-support/dashboardParts.ts";
import { showColumn } from "../../test-support/boardPage.ts";
import { storyNotesPage } from "../../test-support/support/storyNotesPage.ts";
import { describedBacklog } from "../../test-support/describedRevisions.ts";

test("a Taken note survives a new launch and appears on Done without workspace or launch records", async ({
  page,
  frontendServices,
}) => {
  const service = await installFrontendStoryNotes(page);
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    undefined,
    (answers) => {
      answers.answerFile(
        frontendFileDiff("story.txt", ["+Kept line"]),
        "story.txt",
      );
    },
  );
  const card = parts(page).taken.getByRole("article", {
    name: takenStory,
    exact: true,
  });
  const notes = storyNotesPage(page);
  await notes.fromLine(fileDiff(review, "Added story.txt"), "new", 1);
  await notes.saveDiffNote("Keep this observation through completion");
  await closeSidePanel(review);
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
  for (const context of [
    `${takenStory} · ${takenIdentity}`,
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
  expect(service.changes()).toEqual([
    {
      action: "add",
      identity: takenIdentity,
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
