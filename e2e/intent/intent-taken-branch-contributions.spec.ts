import { shortRevision } from "../../dashboard/test-support/dashboardPage.ts";
import {
  openIntentReviewChanges,
  type IntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { openTaken } from "../../dashboard/test-support/support/storyReviewTrunkMode.ts";
import { storyNotesPage } from "../../dashboard/test-support/support/storyNotesPage.ts";
import {
  git,
  storyWorktree,
  writeAt,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { takenBranchContributionHistory } from "../../dashboard/test-support/support/takenBranchContributionHistory.ts";

test.use({ originRepository: takenBranchContributionHistory() });

test("a Taken branch widens independently of uncommitted work and keeps both choices on refresh", async ({
  page,
  origin,
}) => {
  let review: IntentReviewChanges;
  const incoming = "Added guides/incoming.txt";
  const draft = "Added guides/draft.txt";
  let nextHead: string;

  await test.step("When I open the Taken story in Intent", async () => {
    review = await openIntentReviewChanges(page, await openTaken(page, origin));
  });
  await test.step("Then its contribution includes the draft and omits incoming trunk", async () => {
    await review.comparison.expectMergedIncluded(false);
    await review.files.expectNotShown(incoming);
    await expect(review.files.row(draft)).toBeVisible();
  });
  await test.step("And its comparison starts at the integrated trunk revision", async () => {
    await review.context.expectBaseline(
      `${origin.revision("incoming trunk")} where`,
    );
  });
  await test.step("When I include merged and leave out uncommitted changes", async () => {
    await review.comparison.includeMerged(true);
    await review.comparison.includeUncommitted(false);
  });
  await test.step("Then the wider pair starts at the story start and leaves out the draft", async () => {
    await review.context.expectBaseline(
      `${origin.revision("story start")} at the recorded story start`,
    );
    await review.files.expectOutsideLacks("draft.txt", "later.txt");
  });
  await test.step("And I can read the incoming file's diff", async () => {
    await review.files.choose(incoming);
    await review.diffs.expectShows(incoming, "incoming trunk change");
  });
  await test.step("And its note context names the displayed committed pair", async () => {
    const notes = storyNotesPage(page);
    await notes.fromFile(review.diffs.toRead(incoming));
    await notes.expectComposerContext([
      `All changes ${origin.revision("story start")} → ${git(origin.project, "rev-parse", `${origin.revision("merge trunk")}^{tree}`)}`,
    ]);
  });
  await test.step("When I close the note composer", async () => {
    await storyNotesPage(page).cancel();
  });
  await test.step("When I refresh after adding another branch commit", async () => {
    nextHead = commitAnotherBranchChange(storyWorktree(origin).workspace);
    review = await review.refreshAndAnswer();
  });
  await test.step("Then both choices are kept at the new branch revision", async () => {
    await review.comparison.expectMergedIncluded(true);
    await review.comparison.expectUncommittedIncluded(false);
    await review.expectText(`Head ${shortRevision(nextHead)}.`);
  });
  await test.step("And the incoming diff stays selected alongside the new file", async () => {
    await review.files.expectSelected(incoming);
    await review.diffs.expectShows(incoming, "incoming trunk change");
    await expect(review.files.row("Added guides/refresh.txt")).toBeVisible();
  });
});

function commitAnotherBranchChange(workspace: string) {
  writeAt(workspace, "guides/refresh.txt", "new branch change\n");
  git(workspace, "add", "guides/refresh.txt");
  git(workspace, "commit", "--quiet", "-m", "another branch change");
  return git(workspace, "rev-parse", "HEAD");
}
