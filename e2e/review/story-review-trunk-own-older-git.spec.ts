import {
  openIntentReviewChanges,
  type IntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import { olderGit } from "../../dashboard/test-support/support/storyReviewOlderGit.ts";
import {
  openTaken,
  trunkModeStory,
} from "../../dashboard/test-support/support/storyReviewTrunkMode.ts";

olderGit.use({ originRepository: trunkModeStory({ published: 2 }) });

olderGit(
  "the published Trunk comparison explains when Git cannot separate the story's changes",
  async ({ page, origin }) => {
    let review: IntentReviewChanges;
    const explanation =
      "This machine's Git cannot separate this story's published changes from other work.";

    await olderGit.step(
      "When I open the Taken story's Review changes",
      async () => {
        review = await openIntentReviewChanges(
          page,
          await openTaken(page, origin),
        );
      },
    );
    await olderGit.step(
      "Then the comparison explains the attribution gap",
      async () => {
        await review.expectText(explanation);
        await review.diffs.expectAbsent();
      },
    );
    await olderGit.step("When I refresh the published comparison", async () => {
      review = await review.refreshAndAnswer();
    });
    await olderGit.step(
      "Then the gap still explains why there is no diff",
      async () => {
        await review.expectText(explanation);
        await review.diffs.expectAbsent();
      },
    );
  },
);
