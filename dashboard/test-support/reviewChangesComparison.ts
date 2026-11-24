// The comparison Review changes (./reviewChangesPage.ts) shows, as the reader
// chooses it: the Comparison switch, an execution checkout session's runs, and
// Include uncommitted changes for All changes. Wherever these controls sit,
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
  uncommittedCheck,
  uncommittedLabel,
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

  async touchTargetsToMeasure(...choices: string[]) {
    await this.#reach();
    return [
      ...choices.map((choice) => comparisonLabel(this.#review, choice)),
      uncommittedLabel(this.#review),
    ];
  }

  // Sets Include uncommitted changes, without waiting for any read.
  async includeUncommitted(include: boolean, using: Using = "mouse") {
    await this.#reach();
    const check = uncommittedCheck(this.#review);
    if (using === "touch") {
      const label = uncommittedLabel(this.#review);
      await label.scrollIntoViewIfNeeded();
      await tapWhereShown(label);
    } else if (using === "keyboard") await check.press("Space");
    else await check.setChecked(include);
    if (using !== "mouse")
      await expect(check).toBeChecked({ checked: include });
    return this;
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

  // Whether Include uncommitted changes is offered, and if so checked.
  async expectUncommittedIncluded(included: boolean | "not offered") {
    await this.#reach();
    const check = uncommittedCheck(this.#review);
    await (included === "not offered"
      ? expect(check).toHaveCount(0)
      : expect(check).toBeChecked({ checked: included }));
    return this;
  }
}
