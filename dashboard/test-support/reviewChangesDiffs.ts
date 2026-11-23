// The shown file's diff in Review changes (./reviewChangesPage.ts): what it
// says, its added and removed lines, a printed line, Follow up in its header,
// and the diff's own reading status. A
// scenario that proves a diff's structure (hunks, line numbers, scrolling)
// reads it through `toRead`, the one diff it names, with the diff-structure
// helpers (./support/reviewPanes.ts).

import { expect, type Locator } from "@playwright/test";
import { fileFollowUp } from "./support/fileFollowUpPage.ts";
import { fileDiff } from "./support/reviewTreeRows.ts";

type Name = string | RegExp;

export class ReviewDiffs {
  readonly #review: Locator;
  readonly #locateDiff: (file?: Name) => Locator;

  constructor(
    review: Locator,
    locateDiff = (file?: Name) =>
      file === undefined
        ? review.locator(".story-review-diff")
        : fileDiff(review, file, { exact: true }),
  ) {
    this.#review = review;
    this.#locateDiff = locateDiff;
  }

  #diff(file: Name) {
    return this.#locateDiff(file);
  }

  // The named file's diff, for reading its structure.
  toRead(file: Name) {
    return this.#diff(file);
  }

  // Exactly these added, or removed, lines of the diff shown, in order.
  async expectLines(kind: "added" | "removed", lines: readonly string[]) {
    await expect(this.#shown().locator(`.story-review-${kind}`)).toHaveText(
      lines,
    );
    return this;
  }

  // The file's diff prints `line` whole.
  async expectLine(file: Name, line: string) {
    await expect(
      this.#diff(file).getByText(line, { exact: true }),
    ).toBeVisible();
    return this;
  }

  // The diff shown reads nothing more: its own status says nothing.
  async expectSettled() {
    await expect(this.#shown().getByRole("status")).toBeEmpty();
    return this;
  }

  // The diff shown says it is reading, as in “Reading the file's diff…”.
  async expectReading(text: string) {
    await expect(this.#shown().getByRole("status")).toHaveText(text);
    return this;
  }

  // Whatever diff is shown.
  #shown() {
    return this.#locateDiff();
  }

  // The chosen file's diff, by the file's name, containing each text given.
  async expectShows(file: Name, ...texts: readonly Name[]) {
    const diff = this.#diff(file);
    await expect(diff).toBeVisible();
    for (const text of texts) await expect(diff).toContainText(text);
    return this;
  }

  // Whatever diff is shown contains, or lacks, `text`.
  async expectText(text: Name, shown = true) {
    await (shown
      ? expect(this.#shown()).toContainText(text)
      : expect(this.#shown()).not.toContainText(text));
    return this;
  }

  async expectAbsent() {
    await expect(this.#shown()).toHaveCount(0);
    return this;
  }

  async expectShown() {
    await expect(this.#shown()).toBeVisible();
    return this;
  }

  // The file's diff removes and adds exactly these lines, in order.
  async expectChangedLines(
    file: Name,
    lines: {
      readonly removed: readonly string[];
      readonly added: readonly string[];
    },
  ) {
    const diff = this.#diff(file);
    await expect(diff.locator(".story-review-removed")).toHaveText(
      lines.removed,
    );
    await expect(diff.locator(".story-review-added")).toHaveText(lines.added);
    return this;
  }

  // The file's diff says none of these texts.
  async expectLacks(file: Name, ...texts: readonly Name[]) {
    const diff = this.#diff(file);
    for (const text of texts) await expect(diff).not.toContainText(text);
    return this;
  }

  // The file's diff shows no lines, as for a binary file.
  async expectNoLines(file: Name) {
    await expect(this.#diff(file).getByRole("listitem")).toHaveCount(0);
    return this;
  }

  // Whether the shown diff's header offers Follow up for `storyName`.
  async expectFollowUp(storyName: string, offered = true) {
    const follow = fileFollowUp(this.#review, storyName);
    await (offered
      ? expect(follow).toBeVisible()
      : expect(follow).toHaveCount(0));
    return this;
  }

  // Follows up the shown diff's file; the dialog it opens is the caller's.
  async followUp(storyName: string) {
    await fileFollowUp(this.#review, storyName).click();
    return this;
  }
}
