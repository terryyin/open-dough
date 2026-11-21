// The Commits comparison of Review changes (./reviewChangesPage.ts): its
// Story commits rows, first Uncommitted changes, then the snapshot's own
// first-parent commits newest first, and the range heading a choice reads.
// Rows are named by position as the scenario counts them on screen: 0 is
// Uncommitted changes. A choice is made after the range chosen before it
// has been read, and is done once its own range has been read
// (./support/storyReviewCommitChoice.ts).

import { expect, type Locator } from "@playwright/test";
import {
  chooseCommit,
  commitRangeHeading,
} from "./support/storyReviewCommitChoice.ts";
import { expectReviewRead } from "./support/reviewRead.ts";

export class ReviewCommits {
  readonly #review: Locator;

  constructor(review: Locator) {
    this.#review = review;
  }

  #rows() {
    return this.#review
      .getByRole("list", { name: "Story commits", exact: true })
      .getByRole("button");
  }

  #row(at: number | "last") {
    return at === "last" ? this.#rows().last() : this.#rows().nth(at);
  }

  // Each row's text in order, Uncommitted changes first.
  async expectRows(rows: readonly (string | RegExp)[]) {
    await expect(this.#rows()).toHaveText(rows);
    return this;
  }

  async expectRowCount(count: number) {
    await expect(this.#rows()).toHaveCount(count);
    return this;
  }

  async expectRowText(at: number | "last", text: string | RegExp) {
    await expect(this.#row(at)).toContainText(text);
    return this;
  }

  // The commit row's time names when it was committed.
  async expectCommittedAt(at: number, committedAt: string) {
    await expect(this.#row(at).locator("time")).toHaveAttribute(
      "datetime",
      new Date(committedAt).toISOString(),
    );
    return this;
  }

  // Chooses one row; a second choice of the same row starts its own range.
  async choose(
    at: number | "last",
    press: (row: Locator) => Promise<void> = (row) => row.click(),
  ) {
    await chooseCommit(this.#review, this.#row(at), press);
    return this;
  }

  // Chooses one row alone: twice, so it starts and ends its own range.
  async chooseAlone(at: number | "last") {
    await this.choose(at);
    return this.choose(at);
  }

  // Presses a row without waiting for any read.
  async press(at: number | "last") {
    await this.#row(at).click();
    return this;
  }

  async expectChosen(at: number | "last", chosen = true) {
    await expect(this.#row(at)).toHaveAttribute("aria-pressed", String(chosen));
    return this;
  }

  async expectEnabled(at: number | "last", enabled = true) {
    await expect(this.#row(at)).toBeEnabled({ enabled });
    return this;
  }

  // The heading over the chosen commits: their count and range.
  async expectRange(count: string | RegExp, range?: string | RegExp) {
    await expect(
      this.#review.getByRole("heading", { name: count }),
    ).toBeVisible();
    if (range !== undefined)
      await expect(commitRangeHeading(this.#review)).toContainText(range);
    return this;
  }

  async expectRead() {
    await expectReviewRead(this.#review);
    return this;
  }

  // What the range heading says of the chosen commits, whatever their count.
  async expectRangeSays(range: string | RegExp) {
    await expect(commitRangeHeading(this.#review)).toContainText(range);
    return this;
  }

  // No heading names `count`: the chosen commits are not shown.
  async expectNoRange(count: string) {
    await expect(
      this.#review.getByRole("heading", { name: count }),
    ).toHaveCount(0);
    return this;
  }

  // The row names no commit time, as Uncommitted changes does.
  async expectNoTime(at: number | "last") {
    await expect(this.#row(at).locator("time")).toHaveCount(0);
    return this;
  }
}
