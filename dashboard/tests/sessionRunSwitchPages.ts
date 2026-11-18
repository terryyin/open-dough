// A session review's Comparison switch over its kept runs, and its Refresh,
// as a fluent page object for the Side panel journeys (./sidePanelPages.ts)
// beside the Story review (./storyReviewPages.ts) it belongs to.
import { PageObject } from "./fluentPageObject.ts";
import { expect } from "./support/preparationPage.ts";
import {
  comparison,
  comparisonChoice,
  expectShown,
  reviewRefresh,
  reviewRegion,
} from "./support/reviewControls.ts";

export class SessionRunSwitch extends PageObject {
  get #review() {
    return reviewRegion(this.page);
  }

  // The runs the switch lists, in order, by their whole labels.
  expectRuns(labels: readonly string[]) {
    return this.cueHere(`Comparison: lists ${labels.join("; ")}`, () =>
      expect(comparison(this.#review).locator("label")).toHaveText([...labels]),
    );
  }

  // The one run the switch says is shown.
  expectShown(label: string) {
    return this.cueHere(`Comparison: shows ${label}`, () =>
      expectShown(this.#review, label),
    );
  }

  choose(label: string) {
    return this.cueHere(`Comparison: choose ${label}`, () =>
      comparisonChoice(this.#review, label, { exact: true }).check(),
    );
  }

  // The hidden description the review's region is described by.
  expectDescription(text: string) {
    return this.cueHere(`Story review: is described as "${text}"`, () =>
      expect(this.#review).toHaveAccessibleDescription(text),
    );
  }

  refresh() {
    return this.cueHere("Story review: Refresh", () =>
      reviewRefresh(this.#review, { exact: true }).click(),
    );
  }
}
