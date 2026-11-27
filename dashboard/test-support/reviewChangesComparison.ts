// The comparison Review changes (./reviewChangesPage.ts) shows, as the reader
// chooses it: the Comparison switch and an execution checkout session's runs.
// Wherever these controls sit,
// each operation first makes them reachable (they live in the details behind
// the toolbar's eye today), so a scenario names the comparison it chooses,
// never where the choice sits. Choosing waits for no read it starts.

import { expect, type Locator } from "@playwright/test";
import { tapWhereShown } from "./pageLayout.ts";
import {
  comparison,
  comparisonChoice,
  comparisonLabel,
  expectShown,
} from "./support/reviewControls.ts";

export type Using = "mouse" | "keyboard" | "touch";

export class ReviewComparison {
  readonly #review: Locator;
  readonly #reach: () => Promise<unknown>;

  constructor(review: Locator, reach: () => Promise<unknown>) {
    this.#review = review;
    this.#reach = reach;
  }

  #choice(name: string) {
    return comparisonChoice(this.#review, name, { exact: true });
  }

  async choose(name: string, using: Using = "mouse") {
    await this.#reach();
    const choice = this.#choice(name);
    if (using === "keyboard") await choice.press("Space");
    else if (using === "touch") {
      const label = comparisonLabel(this.#review, name);
      await label.scrollIntoViewIfNeeded();
      await tapWhereShown(label);
    } else await choice.check();
    return this;
  }

  // Presses `key` with the keyboard on the comparison choice `name`.
  async press(name: string, key: string) {
    await this.#reach();
    await this.#choice(name).press(key);
    return this;
  }

  // The switch says `name` is the one comparison shown.
  async expectChosen(name: string) {
    await this.#reach();
    await expectShown(this.#review, name);
    return this;
  }

  // Whether the switch offers `name` among the comparisons.
  async expectOffered(name: string, offered = true) {
    await this.#reach();
    await (offered
      ? expect(this.#choice(name)).toBeVisible()
      : expect(this.#choice(name)).toHaveCount(0));
    return this;
  }

  // `name` is the one comparison offered, and it is chosen.
  async expectOnly(name: string) {
    await this.expectChosen(name);
    await expect(this.#review.getByRole("radio")).toHaveCount(1);
    return this;
  }

  // The comparisons the switch lists, in order, by their whole labels.
  async expectListed(labels: readonly string[]) {
    await this.#reach();
    await expect(comparison(this.#review).locator("label")).toHaveText([
      ...labels,
    ]);
    return this;
  }

  async expectNoSwitch() {
    await this.#reach();
    await expect(comparison(this.#review)).toHaveCount(0);
    return this;
  }

  // Chooses one of an execution checkout session's runs.
  async chooseExecutionCheckoutRun(label: string) {
    await this.#reach();
    await this.#review
      .getByRole("radiogroup", { name: "Execution checkout runs" })
      .getByRole("radio", { name: label, exact: true })
      .check();
    return this;
  }

  async choosePublishedRange(label: string) {
    await this.#reach();
    await this.#review
      .getByRole("radiogroup", { name: "Published ranges" })
      .getByRole("radio", { name: label, exact: true })
      .check();
    return this;
  }

  // The review scopes listed under Sessions, in order, by name: Whole story,
  // then each session by its workflow name, which its time follows.
  async expectSessions(names: readonly string[]) {
    await expect(this.#sessions().locator("label")).toHaveText(
      names.map((name) => new RegExp(`^\\s*${name}( — |$)`)),
    );
    return this;
  }

  // Chooses the scope listed at `position` under Sessions, Whole story first.
  async chooseSession(position: number) {
    await this.#sessions().getByRole("radio").nth(position).check();
    return this;
  }

  // The scope at `position` under Sessions is the chosen one; without a
  // position, some session rather than Whole story is.
  async expectSessionChosen(position?: number) {
    const radios = this.#sessions().getByRole("radio");
    await (position === undefined
      ? expect(radios.first()).not.toBeChecked()
      : expect(radios.nth(position)).toBeChecked());
    return this;
  }

  // The comparison summary counts its changed files as `files`, such as
  // "1 changed file".
  async expectSummaryCounts(files: string) {
    await expect(
      this.#review.getByRole("group", { name: "Comparison summary" }),
    ).toContainText(` — ${files}`);
    return this;
  }

  #sessions() {
    return this.#review.getByRole("radiogroup", { name: "Sessions" });
  }

  #mergedCheck() {
    return this.#review.getByRole("checkbox", {
      name: "Include merged changes",
      exact: true,
    });
  }

  async includeMerged(include: boolean) {
    await this.#reach();
    await this.#mergedCheck().setChecked(include);
    return this;
  }

  async expectMergedIncluded(included: boolean | "not offered") {
    await this.#reach();
    await (included === "not offered"
      ? expect(this.#mergedCheck()).toHaveCount(0)
      : expect(this.#mergedCheck()).toBeChecked({ checked: included }));
    return this;
  }
}
