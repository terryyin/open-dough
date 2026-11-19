// A published completion's facts wait behind the toolbar's eye like every
// other review's details.
import { test } from "../../test-support/support/frontendApp.ts";
import {
  frontendFileDiff,
  frontendPublishedReview,
} from "../../test-support/support/frontendStoryReview.ts";
import { openFrontendStoryReviewAsOpened } from "../../test-support/support/frontendStoryReviewOpen.ts";

const added = (path: string) => ({
  kind: "added" as const,
  path,
  lines: { added: 1, removed: 0 },
});

test("a published completion keeps its facts behind the eye", async ({
  page,
  frontendServices,
}) => {
  const published = frontendPublishedReview([added("first.txt")]);
  const { reviewChanges: review } = await openFrontendStoryReviewAsOpened(
    page,
    frontendServices,
    published,
    (initial) => {
      initial.answerFile(frontendFileDiff("first.txt", ["+alpha"]));
    },
  );
  const { details } = review;
  await review.diffs.expectShows("Added first.txt", "+alpha");
  await review.expectFilesToggleLeads("Published completion");
  await details.expectEyeBesideComparison("Show review details");
  await review.details.expectCollapsed();
  await details.expectNoTimeShown();
  await details.reveal();
  await details.expectHeading("Published completion");
  await details.expectTime(published.completedAt);
  await details.expectText(`Completion ${published.completion}.`);
  await details.expectText("origin/main");
});
