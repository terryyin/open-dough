// Choosing a Story commits row as a reader does: after the range chosen
// before it has been read. That read's answer changes the review's status
// lines and so moves the list; a pointer press or touch the row moves away
// from chooses no commit.
import type { Locator } from "@playwright/test";
import { expect } from "./preparationPage.ts";
import { reviewFeedback } from "./reviewContextLine.ts";

export async function chooseCommit(
  review: Locator,
  row: Locator,
  press: (row: Locator) => Promise<void> = (shown) => shown.click(),
) {
  await expect(reviewFeedback(review)).not.toContainText(
    "Reading the chosen commits' changes…",
  );
  await press(row);
}
