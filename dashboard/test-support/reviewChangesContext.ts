// The context line of Review changes (./reviewChangesPage.ts), in its
// details: the branch, baseline and worktree of the comparison shown, read by
// the values' accessible name and shortened to one line until activated. Each
// operation reveals the details first; the scenario supplies the words.

import { expect, type Locator } from "@playwright/test";
import { contextLine, contextValues } from "./support/reviewContextLine.ts";

export class ReviewContext {
  readonly #review: Locator;
  readonly #reveal: () => Promise<unknown>;

  constructor(review: Locator, reveal: () => Promise<unknown>) {
    this.#review = review;
    this.#reveal = reveal;
  }

  get #baseline() {
    return contextLine(this.#review).locator(".story-review-context-baseline");
  }

  // The context line says `text`.
  async expectSays(text: string | RegExp) {
    await this.#reveal();
    await expect(contextLine(this.#review)).toContainText(text);
    return this;
  }

  // The values read in full by their name, however they are shown.
  async expectWords(words: string) {
    await this.#reveal();
    await expect(contextValues(this.#review)).toHaveAccessibleName(words);
    return this;
  }

  // The baseline's words: exactly, or containing `text` when `exact` is false.
  async expectBaseline(text: string | RegExp, { exact = false } = {}) {
    await this.#reveal();
    await (exact
      ? expect(this.#baseline).toHaveText(text)
      : expect(this.#baseline).toContainText(text));
    return this;
  }

  async expectBaselineLacks(text: string) {
    await this.#reveal();
    await expect(this.#baseline).not.toContainText(text);
    return this;
  }

  // The short revision the one-line baseline shows.
  async expectShortBaseline(short: string) {
    await this.#reveal();
    await expect(this.#baseline.locator("code[aria-hidden]")).toHaveText(short);
    return this;
  }

  // Activates the values from the keyboard to show them in full, or to
  // return them to one line.
  async showInFull(full = true) {
    await this.#reveal();
    const values = contextValues(this.#review);
    await values.press("Enter");
    await expect(values).toHaveAttribute("aria-expanded", String(full));
    return this;
  }

  // The line and its values as shown now, for a scenario that measures them.
  async toMeasure() {
    await this.#reveal();
    return {
      line: contextLine(this.#review),
      values: contextValues(this.#review),
    };
  }
}
