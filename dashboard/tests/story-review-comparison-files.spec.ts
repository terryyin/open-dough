// Each comparison of a marked story's review lists its own files, of Story
// A's twelve-file worktree marked and then changed
// (./support/storyReviewMark.ts): it opens on its first file, counts each
// file's lines from its own *from* tree, and Previous file and Next file move
// through its files only. Switching keeps a file both comparisons list
// selected, and otherwise selects the first file shown.

import { expect, test } from "./support/preparationPage.ts";
import {
  expectFileSelected,
  expectLineCounts,
} from "./support/reviewTreeRows.ts";
import {
  comparison,
  markedThenChanged,
  storyFile,
} from "./support/storyReviewMark.ts";

test("each comparison opens on its first file, counts its own lines, and moves through its own files", async ({
  page,
  dashboard,
  origin,
}) => {
  const { review } = await markedThenChanged(page, dashboard, origin);
  const expectCounts = (name: string, shown: string) =>
    expectLineCounts(review, name, shown);
  const expectSelected = (name: string) => expectFileSelected(review, name);
  const previous = review.getByRole("button", { name: "Previous file" });
  const next = review.getByRole("button", { name: "Next file" });
  const [two, nine, thirteen] = [2, 9, 13].map(storyFile);

  // Since the review: only the later edits are counted.
  await expectSelected(`Modified ${two}`);
  await expect(previous).toHaveAttribute("aria-disabled", "true");
  await expectCounts(`Modified ${two}`, "+1 −1");
  await expectCounts(`Added ${thirteen}`, "+1 −0");
  await next.click();
  await expectSelected(`Modified ${nine}`);
  await expect(
    review.getByRole("region", { name: `Modified ${nine}` }),
  ).toContainText("+f9 five");
  await next.click();
  await expectSelected(`Added ${thirteen}`);
  await expect(next).toHaveAttribute("aria-disabled", "true");

  // All changes keeps the file both list, and counts from the baseline.
  await comparison(review).getByRole("radio", { name: "All changes" }).check();
  await expectSelected(`Added ${thirteen}`);
  await expectCounts(`Added ${two}`, "+12 −0");
  await expect(next).toHaveAttribute("aria-disabled", "true");
  await previous.click();
  await expectSelected(`Added ${storyFile(12)}`);

  // A file the changes since the review do not list gives way to their first.
  await comparison(review)
    .getByRole("radio", { name: "Since the review" })
    .check();
  await expectSelected(`Modified ${two}`);
});
