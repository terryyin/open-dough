// A published completion's facts wait behind the toolbar's eye like every
// other review's details.
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  frontendFileDiff,
  frontendPublishedReview,
} from "../../tests/support/frontendStoryReview.ts";
import { openFrontendStoryReviewAsOpened } from "../../tests/support/frontendStoryReviewOpen.ts";
import { expectToggleLeadsToolbar } from "../../tests/support/reviewControls.ts";
import {
  expectDetailsCollapsed,
  expectEyeBesideComparison,
  revealDetails,
} from "../../tests/support/reviewDetails.ts";
import { fileDiff } from "../../tests/support/reviewTreeRows.ts";

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
  const { review } = await openFrontendStoryReviewAsOpened(
    page,
    frontendServices,
    published,
    (initial) => {
      initial.answerFile(frontendFileDiff("first.txt", ["+alpha"]));
    },
  );
  await expect(fileDiff(review, "Added first.txt")).toContainText("+alpha");
  await expectToggleLeadsToolbar(review, "Published completion");
  await expectEyeBesideComparison(review, "Show review details");
  await expectDetailsCollapsed(review);
  await expect(review.locator("time")).toBeHidden();
  const details = await revealDetails(review);
  await expect(
    details.getByRole("heading", { name: "Published completion", exact: true }),
  ).toBeVisible();
  await expect(details.locator("time")).toHaveAttribute(
    "datetime",
    published.completedAt,
  );
  await expect(details).toContainText(`Completion ${published.completion}.`);
  await expect(details).toContainText("origin/main");
});
