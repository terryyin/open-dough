// The shared-checkout evidence beside a session's published comparison.

import type { Locator } from "@playwright/test";
import { expectSharedCheckoutNote } from "./support/reviewComparisonContext.ts";

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
    await expectSharedCheckoutNote(this.#review, shown);
    return this;
  }
}
