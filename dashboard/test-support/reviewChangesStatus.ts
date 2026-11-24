// What Review changes (./reviewChangesPage.ts) says above its work area and
// what the work area holds beneath it: the feedback status, the body that
// holds the file browser and diff or stays empty, Refresh beside Close in its
// header.

import { expect, type Locator } from "@playwright/test";
import { reviewBody, reviewFeedback } from "./support/reviewContextLine.ts";
import { reviewRefresh } from "./support/reviewControls.ts";
import { expectReviewRead } from "./support/reviewRead.ts";

export class ReviewStatus {
  readonly #review: Locator;

  constructor(review: Locator) {
    this.#review = review;
  }

  get #refresh() {
    return reviewRefresh(this.#review, { exact: true });
  }

  // The feedback says exactly `text`.
  async expectFeedback(text: string | RegExp) {
    await expect(reviewFeedback(this.#review)).toHaveText(text);
    return this;
  }

  // What the body says in place of the file browser.
  async expectBodyText(text: string | RegExp) {
    await expect(reviewBody(this.#review)).toContainText(text);
    return this;
  }

  // The body beneath details and status has the keyboard.
  async expectKeyboardInBody() {
    await expect(reviewBody(this.#review)).toBeFocused();
    return this;
  }

  async expectFeedbackSays(text: string | RegExp, says = true) {
    const feedback = reviewFeedback(this.#review);
    await (says
      ? expect(feedback).toContainText(text)
      : expect(feedback).not.toContainText(text));
    return this;
  }

  // The body shows nothing, below the feedback that explains why.
  async expectBodyEmptyBelowFeedback() {
    const body = reviewBody(this.#review);
    await expect(body).toBeEmpty();
    expect((await body.boundingBox())?.y).toBeGreaterThanOrEqual(
      await reviewFeedback(this.#review).evaluate(
        (shown) => shown.getBoundingClientRect().bottom,
      ),
    );
    return this;
  }

  // The review shows `text` where the reader can see it.
  async expectShownText(text: string | RegExp) {
    await expect(this.#review.getByText(text)).toBeVisible();
    return this;
  }

  async expectBodyEmpty() {
    await expect(reviewBody(this.#review)).toBeEmpty();
    return this;
  }

  // The header offers Refresh and Close.
  async expectRefreshAndCloseOffered() {
    await expect(reviewRefresh(this.#review)).toBeVisible();
    await expect(
      this.#review.getByRole("button", { name: "Close", exact: true }),
    ).toBeVisible();
    return this;
  }

  // Presses Refresh without waiting for the read it starts.
  async refresh() {
    await this.#refresh.click();
    return this;
  }

  // Refreshes from the keyboard, once every read it starts is answered.
  async refreshByKeyboard() {
    await this.#refresh.press("Enter");
    await expectReviewRead(this.#review);
    return this;
  }

  async expectRefreshFocused() {
    await expect(this.#refresh).toBeFocused();
    return this;
  }

  // Refreshes, once every read it starts is answered.
  async refreshAndRead() {
    await this.#refresh.click();
    await expectReviewRead(this.#review);
    return this;
  }

  // How many statuses the review announces, its feedback among them.
  async expectStatusCount(count: number) {
    await expect(this.#review.getByRole("status")).toHaveCount(count);
    return this;
  }
}
