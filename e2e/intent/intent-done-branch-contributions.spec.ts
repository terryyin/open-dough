import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { doneStoryReview } from "../../dashboard/test-support/doneStoryReviewPage.ts";
import { openUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { completedStoryContributionHistory } from "../../dashboard/test-support/support/completedStoryHistory.ts";
import { git } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { storyNotesPage } from "../../dashboard/test-support/support/storyNotesPage.ts";
import { test } from "../../dashboard/test-support/support/preparationPage.ts";

test.use({ originRepository: completedStoryContributionHistory() });

const contribution = "Modified guides/branch.txt";
const incoming = "Added guides/incoming.txt";

test("a Done branch shows its contribution and widens to the same completion", async ({
  page,
  origin,
}) => {
  const { completion, tree } =
    await test.step("Given the branch completion is published", async () => {
      const revision = origin.revision("completion");
      await publishCommittedOrigin(page, {
        repoDir: origin.origin,
        revision,
        repository: "terryyin/open-dough",
      });
      return {
        completion: revision,
        tree: git(origin.project, "rev-parse", `${revision}^{tree}`),
      };
    });

  const review =
    await test.step("When I review the Done story in Intent", async () => {
      await openUntilRead(page);
      const board = await doneStoryReview(page).open();
      return openIntentReviewChanges(page, board.card("Story A").article);
    });
  const contributionStart =
    await test.step("Then the published comparison identifies its attributed baseline", async () => {
      if (review.answer.kind !== "published")
        throw new Error("No published completion");
      await review.expectText(`Baseline ${review.answer.baseline}.`);
      return review.answer.baseline;
    });
  await test.step("And the default view excludes the incoming file", async () => {
    await review.comparison.expectMergedIncluded(false);
    await review.expectText(`Completion ${completion}.`);
    await review.files.expectNotShown(incoming);
  });
  await test.step("And with Selected story only, the guides folder reports one changed file", async () => {
    await review.files.expectInventoryNotice(
      /^No Intent locations are configured for Open Dough\./,
    );
    await review.files.showOnlyChanged();
    await (
      await review.files.collapseFolder("guides")
    ).expectFolderName("guides 1 file");
  });

  await test.step("When I include merged changes", () =>
    review.comparison.includeMerged(true));
  await test.step("Then Intent compares the story start to the same completion", async () => {
    await review.expectText(`Baseline ${origin.revision("story start")}.`);
    await review.expectText(`Completion ${completion}.`);
  });
  await test.step("And the widened guides folder reports three changed files", () =>
    review.files.expectFolderName("guides 3 files"));
  await test.step("And I can read the incoming file's diff", async () => {
    await (await review.files.expandFolder("guides")).choose(incoming);
    await review.diffs.expectShows(incoming, "incoming trunk line");
  });

  await test.step("When I exclude merged changes", () =>
    review.comparison.includeMerged(false));
  await test.step("Then the incoming file and its diff disappear", async () => {
    await review.files.expectNotShown(incoming);
    await review.diffs.expectAbsent();
  });
  await test.step("When I select the story's contribution", async () => {
    await review.files.choose(contribution);
    await review.diffs.expectShows(contribution, "story contribution");
  });
  await test.step("Then a note on it uses the attributed pair", async () => {
    const notes = storyNotesPage(page);
    await notes.fromFile(review.diffs.toRead(contribution));
    await notes.expectComposerContext([
      `Published completion ${contributionStart} → ${tree}`,
    ]);
  });

  await test.step("When I close the note and include merged changes", async () => {
    await storyNotesPage(page).cancel();
    await review.comparison.includeMerged(true);
  });
  await test.step("Then the story's contribution remains selected and readable", async () => {
    await review.files.expectSelected(contribution);
    await review.diffs.expectShows(contribution, "story contribution");
  });
  await test.step("And a note on it uses the widened pair", async () => {
    const notes = storyNotesPage(page);
    await notes.fromFile(review.diffs.toRead(contribution));
    await notes.expectComposerContext([
      `Published completion ${origin.revision("story start")} → ${tree}`,
    ]);
  });
});
