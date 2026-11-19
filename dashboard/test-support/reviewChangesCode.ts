// The chosen file's code pane in Review changes (./reviewChangesPage.ts), as
// a reader scrolls and sees it: where its scroll rests, how tall it is, and
// whether a line is in view. A scenario keeps these measurements to prove the
// review keeps the reader's place or a usable pane.

import { expect, type Locator } from "@playwright/test";
import { box } from "./pageLayout.ts";
import { codePane, scrollPane, scrollTopOf } from "./support/reviewPanes.ts";
import { fileDiff } from "./support/reviewTreeRows.ts";

export class ReviewCode {
  readonly #review: Locator;

  constructor(review: Locator) {
    this.#review = review;
  }

  #pane(file: string) {
    return codePane(fileDiff(this.#review, file, { exact: true }));
  }

  // Scrolls the file's code to `to` px; answers where it came to rest.
  scrollTo(file: string, to: number) {
    return scrollPane(this.#pane(file), to);
  }

  // Where the file's code is scrolled to now, in px.
  scrollTop(file: string) {
    return scrollTopOf(this.#pane(file));
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
