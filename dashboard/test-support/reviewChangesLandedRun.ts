// The landed run Review changes (./reviewChangesPage.ts) describes in its
// details under Landed runs: the "Landed run" heading over its context (who
// launched it when, where it was delivered, the pair it compares) and the run
// picker: choosing a run by its key or from the keyboard, and the runs it
// offers. Each operation first makes the details reachable; the scenario
// supplies the run keys, revisions and words. Choosing waits for no read.

import { expect, type Locator, type Page } from "@playwright/test";
import { landedRunChoice } from "./support/reviewControls.ts";

export class ReviewLandedRun {
  readonly #review: Locator;
  readonly #reveal: () => Promise<unknown>;

  constructor(review: Locator, reveal: () => Promise<unknown>) {
    this.#review = review;
    this.#reveal = reveal;
  }

  #headingIn(scope: Locator | Page) {
    return scope.getByRole("heading", { name: "Landed run", exact: true });
  }

  get #heading() {
    return this.#headingIn(this.#review);
  }

  // The run's own context: the innermost block holding its heading.
  get #context() {
    return this.#review
      .locator("div")
      .filter({ has: this.#headingIn(this.#review.page()) })
      .last();
  }

  // The details describe a landed run, saying each text given.
  async expectShown(...texts: readonly (string | RegExp)[]) {
    await this.#reveal();
    await expect(this.#heading).toBeVisible();
    for (const text of texts) await expect(this.#context).toContainText(text);
    return this;
  }

  // The details describe no landed run.
  async expectNotShown() {
    await this.#reveal();
    await expect(this.#heading).toHaveCount(0);
    return this;
  }

  // The details name when the run was launched, with its landed context or
  // with the gap that stands in for one.
  async expectLaunchedAt(launchedAt: string) {
    await this.#reveal();
    await expect(this.#review.locator("time")).toHaveAttribute(
      "datetime",
      launchedAt,
    );
    return this;
  }

  // The picker offers exactly these runs, by key, in order.
  async expectRunKeys(keys: readonly string[]) {
    await this.#reveal();
    expect(
      await landedRunChoice(this.#review)
        .locator("option")
        .evaluateAll((options) =>
          options.map((option) => option.getAttribute("value")),
        ),
    ).toEqual(keys);
    return this;
  }

  async expectRunCount(count: number) {
    await this.#reveal();
    await expect(landedRunChoice(this.#review).locator("option")).toHaveCount(
      count,
    );
    return this;
  }

  #picker(includeHidden = false) {
    return landedRunChoice(this.#review, { includeHidden });
  }

  async choose(key: string) {
    await this.#reveal();
    await this.#picker().selectOption(key);
    return this;
  }

  // Focuses the picker, then presses `keys` in order with the keyboard.
  async press(...keys: readonly string[]) {
    await this.#reveal();
    const picker = this.#picker();
    await picker.focus();
    for (const key of keys) await picker.press(key);
    return this;
  }

  // The picker shows `key`, and when given, these options in order.
  async expectChosen(key: string, options?: readonly (string | RegExp)[]) {
    await this.#reveal();
    await expect(this.#picker()).toHaveValue(key);
    if (options) await this.expectOptions(options);
    return this;
  }

  // The options the picker lists, in order, whichever is chosen.
  async expectOptions(options: readonly (string | RegExp)[]) {
    await this.#reveal();
    await expect(this.#picker().getByRole("option")).toHaveText(options);
    return this;
  }

  // No run picker, not even one mounted behind collapsed details.
  async expectNoPicker() {
    await expect(this.#picker(true)).toHaveCount(0);
    return this;
  }
}
