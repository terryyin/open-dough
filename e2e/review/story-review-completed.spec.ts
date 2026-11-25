import {
  expectReviewChangesOffered,
  openIntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  expectNoStorySessions,
  expectReviewed,
  openDoneStoryCard,
} from "../../dashboard/test-support/doneStoryReviewPage.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import path from "node:path";
import {
  advanceCompletedTrunk,
  keepUnusableCompletedCapture,
} from "../../dashboard/test-support/support/completedStoryVisibleActions.ts";
import { ordinaryJourneyCompletedHistory } from "../../dashboard/test-support/support/completedFollowUpHistory.ts";
import { renameExecutionCheckout } from "../../dashboard/test-support/support/reviewRepositoryFixture.ts";

test.use({ originRepository: ordinaryJourneyCompletedHistory() });

test("a CLI-completed story without a local launch opens fixed published changes and file diffs after trunk advances and its checkout moves", async ({
  page,
  dashboard,
  origin,
}) => {
  const completion =
    await test.step("Given Story A was completed and published by the CLI", async () => {
      const revision = origin.revision("completion");
      await publishCommittedOrigin(page, {
        repoDir: origin.origin,
        revision,
        repository: "terryyin/open-dough",
      });
      return revision;
    });
  const card = await test.step("When I find Story A in Recently done", () =>
    openDoneStoryCard(page, "Story A"));
  await test.step("Then the unreviewed story has Review changes without a local launch", async () => {
    await expectNoStorySessions(card);
    await expectReviewChangesOffered(card);
    await expectReviewed(card, false);
  });

  const review = await test.step("When I open Review changes", () =>
    openIntentReviewChanges(page, card));
  const published =
    await test.step("Then the review uses the published completion revision", () => {
      expect(review.answer).toMatchObject({ kind: "published", completion });
      if (review.answer.kind !== "published")
        throw new Error("No published review");
      return review.answer;
    });
  await test.step("And the comparison includes the literal filename and excludes the other story", () => {
    const paths = published.files.map((file) => file.path);
    expect(paths).toContain("[literal]*.txt");
    expect(paths).not.toContain("other-story.txt");
  });
  await test.step("And the header shows the published comparison, completion time, and target", async () => {
    await review.expectText("Published completion");
    await review.expectCompletedAt(published.completedAt);
    await review.expectText(published.target);
  });
  await test.step("When I select the shared file", () =>
    review.files.choose("Modified shared.txt"));
  await test.step("Then its diff shows the story's change", () =>
    review.diffs.expectChangedLines("Modified shared.txt", {
      removed: ["-line 0"],
      added: ["+story first"],
    }));
  await test.step("And no other comparison is offered", () =>
    review.comparison.expectNoSwitch());
  await test.step("When I hide the files", () => review.hideFiles());
  await test.step("And show the files again", () => review.setFilesShown(true));

  await test.step("Given trunk advances after completion", () =>
    advanceCompletedTrunk(origin));
  const moved = await test.step("And the execution checkout moves", () =>
    renameExecutionCheckout(origin));
  const refreshed = await test.step("When I refresh the review", () =>
    review.refreshAndAnswer());
  await test.step("Then the comparison is unchanged", () => {
    expect(refreshed.answer).toEqual(published);
  });
  await test.step("When I return to Development", () =>
    refreshed.returnToDevelopment());
  await test.step("Then opening the comparison has left Story A unreviewed", () =>
    expectReviewed(card, false));
  const reopened = await test.step("When I reopen Review changes", () =>
    openIntentReviewChanges(page, card));
  await test.step("Then the original published completion reopens", async () => {
    expect(reopened.answer).toEqual(published);
    await reopened.expectText("Published completion");
  });
  await test.step("When I select the added file with a literal filename", () =>
    reopened.files.choose("Added [literal]*.txt"));
  await test.step("Then its diff shows the original published text", () =>
    reopened.diffs.expectShows(
      "Added [literal]*.txt",
      "+delivered on another machine",
    ));
  await test.step("And the comparison omits the file added later", () =>
    reopened.expectNoText("later.txt"));

  await test.step("Given the execution checkout is restored", () => {
    moved.restore();
  });
  await test.step("And a retained landing has a missing capture repository", () => {
    keepUnusableCompletedCapture(dashboard, origin, {
      workspace: path.join(origin.project, ".worktrees", "missing-completed"),
      completion,
      baseline: origin.revision("interleaving"),
    });
  });
  const withRun = await test.step("When I refresh the comparison choices", () =>
    reopened.refreshAndAnswer());
  await test.step("Then Published completion keeps its original files and stays selected", async () => {
    expect(withRun.answer).toMatchObject({
      kind: "published",
      completion,
      files: published.files,
    });
    await withRun.comparison.expectChosen("Published completion");
  });
  await test.step("When I choose the landed run", () =>
    withRun.landedRun.chooseLatest());
  await test.step("Then the review shows the fixed landing revision", () =>
    withRun.landedRun.expectShown(completion));
  await test.step("When I switch back to Published completion", () =>
    withRun.comparison.choose("Published completion"));
  await test.step("Then Published completion is selected again", () =>
    withRun.comparison.expectChosen("Published completion"));
  await test.step("When I select the added file again", () =>
    withRun.files.choose("Added [literal]*.txt"));
  await test.step("Then it still shows the original published diff", () =>
    withRun.diffs.expectShows(
      "Added [literal]*.txt",
      "+delivered on another machine",
    ));
});
