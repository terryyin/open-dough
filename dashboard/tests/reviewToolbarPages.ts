// The review's toolbar under the panel header, as a fluent page object for
// the Side panel journeys (./sidePanelPages.ts) beside the Story review
// (./storyReviewPages.ts) it belongs to: the comparison it names, whether it
// offers the file sidebar's toggle, and whether its eye has the review
// details revealed.
import { PageObject } from "./fluentPageObject.ts";
import { expect } from "./support/preparationPage.ts";
import {
  detailsToggle,
  filesToggle,
  reviewRegion,
  toolbarComparison,
} from "./support/reviewControls.ts";

export class ReviewToolbar extends PageObject {
  get #review() {
    return reviewRegion(this.page);
  }

  // The name of the comparison shown, and nothing else.
  expectName(name: string) {
    return this.cueHere(`Review toolbar: names ${name}`, () =>
      expect(toolbarComparison(this.#review)).toHaveText(name),
    );
  }

  // No comparison name yet — before an answer or on a bare explanation.
  expectNoName() {
    return this.cueHere("Review toolbar: names no comparison", () =>
      expect(toolbarComparison(this.#review)).toHaveCount(0),
    );
  }

  // Whether the toolbar offers Hide files for the shown file sidebar.
  expectFilesToggle(offered: boolean) {
    const toggle = filesToggle(this.#review);
    return this.cueHere(
      `Review toolbar: ${offered ? "offers" : "does not offer"} Hide files`,
      () =>
        offered ? expect(toggle).toBeVisible() : expect(toggle).toHaveCount(0),
    );
  }

  // The eye offers to show the review details, which stay hidden.
  expectDetailsCollapsed() {
    return this.cueHere(
      "Review toolbar: review details collapsed",
      async () => {
        const eye = detailsToggle(this.#review);
        await expect(eye).toHaveAccessibleName("Show review details");
        await expect(eye).toHaveAttribute("aria-expanded", "false");
        await expect(
          this.#review.getByRole("group", { name: "Review details" }),
        ).toBeHidden();
      },
    );
  }

  // No eye and no details group: the details hold nothing to reveal.
  expectNoDetails() {
    return this.cueHere(
      "Review toolbar: offers no review details",
      async () => {
        await expect(detailsToggle(this.#review)).toHaveCount(0);
        await expect(
          this.#review.getByRole("group", { name: "Review details" }),
        ).toHaveCount(0);
      },
    );
  }
}
