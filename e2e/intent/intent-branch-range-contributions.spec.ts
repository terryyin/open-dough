import { shortRevision } from "../../dashboard/test-support/dashboardPage.ts";
import {
  openIntentReviewChanges,
  type IntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import { test } from "../../dashboard/test-support/support/preparationPage.ts";
import { openTaken } from "../../dashboard/test-support/support/storyReviewTrunkMode.ts";
import { storyNotesPage } from "../../dashboard/test-support/support/storyNotesPage.ts";
import { git } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { takenBranchContributionHistory } from "../../dashboard/test-support/support/takenBranchContributionHistory.ts";

test.use({
  originRepository: takenBranchContributionHistory({ laterIntegrations: true }),
});

test("a branch commit range widens between its own endpoints", async ({
  page,
  origin,
}) => {
  let review: IntentReviewChanges;
  const incoming = "Added guides/incoming.txt";
  const authored = "Added guides/clean-merge.txt";
  const mixed = "Modified guides/mixed.txt";
  const flagged = `${mixed}, includes trunk's changes`;
  const firstParent = git(
    origin.project,
    "rev-parse",
    `${origin.revision("merge trunk")}^1^{tree}`,
  );
  const end = git(
    origin.project,
    "rev-parse",
    `${origin.revision("merge clean trunk")}^{tree}`,
  );

  await test.step("When I open the Taken story's commits in Intent", async () => {
    review = await openIntentReviewChanges(page, await openTaken(page, origin));
    await review.comparison.choose("Commits");
    await review.expectRead();
  });
  await test.step("Then the uncommitted item shows its own diff", async () => {
    await review.comparison.expectMergedIncluded("not offered");
    await review.files.choose("Added guides/draft.txt");
    await review.diffs.expectShows(
      "Added guides/draft.txt",
      "uncommitted draft",
    );
  });
  await test.step("When I choose only the first two trunk integrations", async () => {
    await review.commits.chooseAlone(2);
    await review.commits.choose(3);
  });
  await test.step("Then the attributed range leaves out incoming-only paths", async () => {
    await review.commits.expectRange("Changes in 2 commits");
    await review.comparison.expectMergedIncluded(false);
    await review.files.expectOutsideLacks(
      "incoming.txt",
      "second-incoming.txt",
      "later.txt",
    );
  });
  await test.step("And the mixed resolution uses its file-specific starting tree", async () => {
    await review.files.choose(flagged);
    await review.diffs.expectLines("removed", ["-branch edit"]);
    await review.diffs.expectLines("added", ["+branch edit and trunk edit"]);
  });
  await test.step("And the contribution includes the clean merge's own edit", async () => {
    await review.files.choose(authored);
    await review.diffs.expectShows(authored, "authored during the clean merge");
  });
  await test.step("When I include merged changes", async () => {
    await review.comparison.includeMerged(true);
  });
  await test.step("Then the range widens from the selected first parent's tree", async () => {
    await review.commits.expectRangeSays(
      `Baseline ${shortRevision(firstParent)} · End tree ${shortRevision(end)}.`,
    );
    await review.commits.expectRangeSays(
      "Incoming trunk changes are included.",
    );
    await review.files.expectOutsideLacks(
      "later.txt",
      "branch.txt",
      "draft.txt",
    );
  });
  await test.step("And the common file remains selected with the widened note pair", async () => {
    await review.files.expectSelected(authored);
    const notes = storyNotesPage(page);
    await notes.fromFile(review.diffs.toRead(authored));
    await notes.expectComposerContext([`Commits ${firstParent} → ${end}`]);
  });
  await test.step("And the wider view reads the mixed file from the original parent without an attribution flag", async () => {
    await storyNotesPage(page).cancel();
    await review.files.choose(mixed);
    await review.diffs.expectChangedLines(mixed, {
      removed: ["-branch edit"],
      added: ["+branch edit and trunk edit"],
    });
  });
  await test.step("And incoming work is readable within the selected range", async () => {
    await review.files.choose(incoming);
    await review.diffs.expectShows(incoming, "incoming trunk change");
  });
  await test.step("When I switch back to the contribution", async () => {
    await review.comparison.includeMerged(false);
  });
  await test.step("Then the incoming-only selection and its diff are cleared", async () => {
    await review.files.expectNotShown(incoming);
    await review.diffs.expectAbsent();
  });
});
