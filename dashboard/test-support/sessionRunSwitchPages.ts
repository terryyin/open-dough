// A session review's Comparison switch over its kept runs, in the review
// details of the Side panel journeys (./sidePanelPages.ts).
import { PageObject } from "./fluentPageObject.ts";
import { expect } from "./support/preparationPage.ts";
import {
  comparison,
  comparisonChoice,
  expectShown,
  reviewRegion,
  showReviewDetails,
} from "./support/reviewControls.ts";

export class SessionRunSwitch extends PageObject {
  get #review() {
    return reviewRegion(this.page);
  }

  // The runs the switch lists, in order, by their whole labels.
  expectRuns(labels: readonly string[]) {
    return this.cueHere(`Comparison: lists ${labels.join("; ")}`, async () => {
      await showReviewDetails(this.#review);
      await expect(comparison(this.#review).locator("label")).toHaveText([
        ...labels,
      ]);
    });
  }

  // The one run the switch says is shown.
  expectShown(label: string) {
    return this.cueHere(`Comparison: shows ${label}`, async () => {
      await expectShown(await showReviewDetails(this.#review), label);
    });
  }

  pressFrom(label: string, key: string) {
    return this.cueHere(`Comparison: press ${key} from ${label}`, async () => {
      const review = await showReviewDetails(this.#review);
      await comparisonChoice(review, label, { exact: true }).press(key);
    });
  }

  chooseDefaultMainRun(label: string) {
    return this.cueHere(`Default main runs: choose ${label}`, async () => {
      const review = await showReviewDetails(this.#review);
      await review
        .getByRole("radiogroup", { name: "Default main runs" })
        .getByRole("radio", { name: label, exact: true })
        .check();
    });
  }

  choose(label: string) {
    return this.cueHere(`Comparison: choose ${label}`, async () => {
      const review = await showReviewDetails(this.#review);
      await comparisonChoice(review, label, { exact: true }).check();
    });
  }
}
