// The chosen file's code pane in Review changes (./reviewChangesPage.ts), as
// a reader sees it: how tall it is, what it shows and whether a line is in
// view. A scenario keeps these measurements to prove the review keeps the
// reader's place or a usable pane.

import { expect, type Locator } from "@playwright/test";
import { box } from "./pageLayout.ts";
import { codePane } from "./support/reviewPanes.ts";
import { fileDiff } from "./support/reviewTreeRows.ts";

export class ReviewCode {
  readonly #review: Locator;

  constructor(review: Locator) {
    this.#review = review;
  }

  #pane(file: string) {
    return codePane(fileDiff(this.#review, file, { exact: true }));
  }

  // The file's code pane height, in CSS px, now.
  async height(file: string) {
    return (await box(this.#pane(file))).height;
  }

  async expectLineInView(file: string, line: string) {
    await expect(
      this.#pane(file).getByText(line, { exact: true }),
    ).toBeInViewport();
    return this;
  }

  async expectShows(file: string, text: string) {
    await expect(this.#pane(file)).toContainText(text);
    return this;
  }
}
