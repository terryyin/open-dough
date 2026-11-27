// The shared-checkout evidence beside a session's published comparison.

import { expect, type Locator } from "@playwright/test";

export class ReviewContext {
  readonly #review: Locator;
  readonly #reveal: () => Promise<unknown>;

  constructor(review: Locator, reveal: () => Promise<unknown>) {
    this.#review = review;
    this.#reveal = reveal;
  }

  // The shared-checkout warning beside the comparison's revisions, or its
  // absence.
  async expectSharedCheckoutWarning(shown: boolean) {
    await this.#reveal();
    const note = this.#review.getByText(
      "the comparison may include that session's work.",
    );
    await (shown ? expect(note).toBeVisible() : expect(note).toHaveCount(0));
    return this;
  }
}
