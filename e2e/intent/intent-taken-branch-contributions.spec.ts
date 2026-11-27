import path from "node:path";
import { shortRevision } from "../../dashboard/test-support/dashboardPage.ts";
import {
  openIntentReviewChanges,
  type IntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import type { StartOrigin } from "../../dashboard/test-support/support/startOrigin.ts";
import { openTaken } from "../../dashboard/test-support/support/storyReviewTrunkMode.ts";
import { yui } from "../../dashboard/test-support/support/storyReviewTrunkCommits.ts";
import { storyNotesPage } from "../../dashboard/test-support/support/storyNotesPage.ts";
import {
  branch,
  git,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { takenBranchContributionHistory } from "../../dashboard/test-support/support/takenBranchContributionHistory.ts";

test.use({ originRepository: takenBranchContributionHistory() });

test("Review changes reads a Taken story's published branch and keeps the selected file on refresh", async ({
  page,
  origin,
}) => {
  let review: IntentReviewChanges;
  let writer: string;
  let nextHead: string;
  const incoming = "Added guides/incoming.txt";
  const merge = "Added guides/merge.txt";
  const mixed = "Modified guides/mixed.txt, includes trunk's changes";

  await test.step("Given the story published its branch to origin from another checkout", () => {
    writer = publishBranchForReader(origin);
  });
  await test.step("When I open the Taken story's Review changes", async () => {
    review = await openIntentReviewChanges(page, await openTaken(page, origin));
  });
  await test.step("Then I see the recorded branch and its published head", async () => {
    await review.expectText(`origin/${branch}`);
    await review.expectText(
      `Head ${shortRevision(origin.revision("merge trunk"))}.`,
    );
  });
  await test.step("And its contribution includes the merge's own edit", async () => {
    await review.files.expectNotShown(incoming);
    await review.files.choose(merge);
    await review.diffs.expectShows(merge, "authored during the merge");
  });
  await test.step("And the mixed resolution retains both sides", async () => {
    await review.files.choose(mixed);
    await review.diffs.expectChangedLines(mixed, {
      removed: ["-original"],
      added: ["+branch edit and trunk edit"],
    });
  });
  await test.step("When I include merged changes", async () => {
    await review.comparison.includeMerged(true);
  });
  await test.step("Then I can read the published incoming file", async () => {
    await review.files.expectTreeLacksText("draft.txt", "later.txt");
    await review.files.choose(incoming);
    await review.diffs.expectShows(incoming, "incoming trunk change");
  });
  await test.step("And its note context names the displayed published pair", async () => {
    const notes = storyNotesPage(page);
    await notes.fromFile(review.diffs.toRead(incoming));
    await notes.expectComposerContext([
      `All changes ${origin.revision("story start")} → ${git(origin.project, "rev-parse", `${origin.revision("merge trunk")}^{tree}`)}`,
    ]);
  });
  await test.step("When I close the note composer", async () => {
    await storyNotesPage(page).cancel();
  });
  await test.step("When I refresh after a further publication", async () => {
    nextHead = publishBranchChange(writer);
    review = await review.refreshAndAnswer();
  });
  await test.step("Then the incoming selection and wider comparison remain at the new head", async () => {
    await review.comparison.expectMergedIncluded(true);
    await review.expectText(`Head ${shortRevision(nextHead)}.`);
    await review.files.expectSelected(incoming);
  });
  await test.step("And the incoming diff remains readable alongside the new file", async () => {
    await review.diffs.expectShows(incoming, "incoming trunk change");
    await expect(review.files.row("Added guides/refresh.txt")).toBeVisible();
  });
});

function publishBranchForReader(origin: StartOrigin) {
  const writer = path.join(origin.machine, "writer");
  const workspace = storyWorktree(origin).workspace;
  git(workspace, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);
  git(origin.project, "worktree", "remove", "--force", workspace);
  git(
    origin.machine,
    "clone",
    "--quiet",
    "--single-branch",
    "--branch",
    branch,
    origin.origin,
    writer,
  );
  return writer;
}

function publishBranchChange(writer: string) {
  makeMe
    .theWorkspace(writer)
    .writeAt("guides/refresh.txt", "new branch change\n")
    .please();
  git(writer, "add", "guides/refresh.txt");
  git(
    writer,
    "-c",
    `user.name=${yui.agent}`,
    "-c",
    `user.email=${yui.email}`,
    "commit",
    "--quiet",
    "-m",
    "another branch change",
  );
  git(writer, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);
  return git(writer, "rev-parse", "HEAD");
}
