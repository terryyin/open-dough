// The frame of Review changes (./reviewChangesPage.ts) around its status and
// work area: the header naming what it reviews, the description assistive
// technology reads, whether the panel is shown at all, and what an
// unavailable review leaves out. A layout scenario takes the parts it
// measures through `partsToMeasure`; the caller decides first whether the
// details are shown.

import { expect, type Page } from "@playwright/test";
import {
  contextLine,
  fileBrowser,
  reviewBody,
  reviewFeedback,
} from "./support/reviewContextLine.ts";
import { reviewRegion } from "./support/reviewControls.ts";

export class ReviewFrame {
  readonly #page: Page;

  constructor(page: Page) {
    this.#page = page;
  }

  get #review() {
    return reviewRegion(this.#page);
  }

  // The story or session the panel's heading names.
  async expectHeading(title: string) {
    await expect(this.#review.getByRole("heading", { level: 2 })).toHaveText(
      title,
    );
    return this;
  }

  // The work identity the review names itself by.
  async expectIdentity(identity: string) {
    await expect(this.#review).toContainText(`Story review ${identity}`);
    return this;
  }

  async expectDescription(text: string) {
    await expect(this.#review).toHaveAccessibleDescription(text);
    return this;
  }

  // Text the review holds for assistive technology but never shows.
  async expectUnshown(text: string | RegExp) {
    await expect(this.#review.getByText(text)).toBeHidden();
    return this;
  }

  // No file browser, diff or comparison control at all.
  async expectNoFilesOrComparisons() {
    await expect(this.#review.getByRole("list")).toHaveCount(0);
    await expect(this.#review.getByRole("region")).toHaveCount(0);
    await expect(this.#review.getByRole("radio")).toHaveCount(0);
    await expect(this.#review.getByRole("checkbox")).toHaveCount(0);
    return this;
  }

  async expectClosed() {
    await expect(this.#review).toBeHidden();
    return this;
  }

  // The panel's parts a layout scenario measures, as they are now.
  partsToMeasure() {
    const review = this.#review;
    return {
      panel: review,
      header: review.locator(".side-panel-header"),
      top: review.locator(".story-review-top"),
      contextLine: contextLine(review),
      details: review.getByRole("group", { name: "Review details" }),
      feedback: reviewFeedback(review),
      body: reviewBody(review),
      workarea: review.locator(".story-review-workarea"),
      fileBrowser: fileBrowser(review),
    };
  }
}
