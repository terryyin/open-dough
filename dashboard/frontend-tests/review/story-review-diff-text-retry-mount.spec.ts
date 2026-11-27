// A file's text that cannot be read leaves its diff plain and complete with
// only the context problem and Retry; a Retry that reads the text styles the
// same lines. Late text without a problem is ./story-review-diff-late-styling.spec.ts.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import type { ReviewedFileText } from "../../src/storyReviewContract.ts";
import { greetText } from "../../test-support/support/diffSyntaxFixtures.ts";
import {
  expectGreetingHunk,
  expectPlainAndComplete,
  openGreetingReview,
} from "./greetingDiff.ts";
import { reviewDiffPage } from "./reviewDiffPage.ts";

const unavailable = {
  kind: "unavailable",
  explanation: "The story's tree is not on this machine.",
} as const;

test("text that cannot be read leaves plain lines with only the context problem and Retry, and a Retry that reads it styles them", async () => {
  const texts: ReviewedFileText[] = [unavailable, greetText];
  await openGreetingReview(() => Promise.resolve(texts.shift() ?? greetText));
  const diff = reviewDiffPage();
  const problem = `Additional context could not be read: ${unavailable.explanation} Retry`;
  const alert = page
    .getByRole("region", { name: "Path reading" })
    .getByRole("alert");

  await expect.element(alert).toHaveTextContent(problem);
  await expectPlainAndComplete(diff);

  await alert.getByRole("button", { name: "Retry" }).click();
  await expect.element(diff.newLine(28).token(/^const$/)).toBeVisible();
  expectGreetingHunk(diff);
  await expect.element(alert).not.toBeInTheDocument();
});
