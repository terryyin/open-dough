// Choosing a Story commits row as a reader does: after the range chosen
// before it has been read. That read's answer changes the review's status
// lines and so moves the list; a pointer press or touch the row moves away
// from chooses no commit. The choice is made once the range it chooses has
// been read too.
import type { Locator } from "@playwright/test";
import { expectReviewRead } from "./reviewRead.ts";

export async function chooseCommit(
  review: Locator,
  row: Locator,
  press: (row: Locator) => Promise<void> = (shown) => shown.click(),
) {
  await expectReviewRead(review);
  await press(row);
  await expectReviewRead(review);
}
