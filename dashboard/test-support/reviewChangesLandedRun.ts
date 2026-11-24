// The landed run Review changes (./reviewChangesPage.ts) describes in its
// details under Landed runs: the "Landed run" heading over its context (who
// launched it when, where it was delivered, the pair it compares) and the run
// picker: choosing a run by its key or from the keyboard, and the runs it
// offers. Each operation first makes the details reachable; the scenario
// supplies the run keys, revisions and words. Choosing waits for no read.

import { expect, type Locator, type Page } from "@playwright/test";
import { comparison } from "./support/reviewControls.ts";

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

  #choices() {
    return comparison(this.#review).locator(
      "input[type=radio]:not([value=published])",
    );
  }

  #choice(key: string) {
    return this.#choices().and(
      this.#review.locator(`input[value=${JSON.stringify(key)}]`),
    );
  }

  async expectRunKeys(keys: readonly string[]) {
    await this.#reveal();
    await expect
      .poll(() =>
        this.#choices().evaluateAll((choices) =>
          choices.map((choice) => choice.getAttribute("value")),
        ),
      )
      .toEqual(keys);
    return this;
  }

  async expectRunCount(count: number) {
    await this.#reveal();
    await expect(this.#choices()).toHaveCount(count);
    return this;
  }

  async choose(key: string, using: "mouse" | "keyboard" = "mouse") {
    await this.#reveal();
    const choice = this.#choice(key);
    if (using === "keyboard") await choice.press("Space");
    else await choice.click();
    return this;
  }

  async chooseLatest() {
    await this.#reveal();
    await this.#choices().first().check();
    return this;
  }

  async expectOffered() {
    await this.#reveal();
    await expect(this.#choices().first()).toBeVisible();
    return this;
  }

  async expectChosen(key: string, options?: readonly (string | RegExp)[]) {
    await this.#reveal();
    await expect(this.#choice(key)).toBeChecked();
    if (options) {
      await expect(
        comparison(this.#review)
          .locator("label")
          .filter({
            has: this.#review
              .page()
              .locator("input[type=radio]:not([value=published])"),
          }),
      ).toHaveText([...options]);
    }
    return this;
  }
}
