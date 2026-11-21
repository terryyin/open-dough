// The review's toolbar under the panel header, as a fluent page object for
// the Side panel journeys (./sidePanelPages.ts) beside the Story review
// (./storyReviewPages.ts) it belongs to: the comparison it names, whether it
// offers the file sidebar's toggle, and whether its eye has the review
// details revealed. Each cue runs the one Review changes page object
// (./reviewChangesPage.ts), which owns where these controls live.
import { PageObject } from "./fluentPageObject.ts";
import { assumeReviewChanges } from "./reviewChangesPage.ts";

export class ReviewToolbar extends PageObject {
  #review() {
    return assumeReviewChanges(this.page);
  }

  // The name of the comparison shown, and nothing else.
  expectName(name: string) {
    return this.cueHere(`Review toolbar: names ${name}`, async () => {
      await (await this.#review()).expectComparisonNamed(name);
    });
  }

  // Whether the toolbar offers Hide files for the shown file sidebar.
  expectFilesToggle(offered: boolean) {
    return this.cueHere(
      `Review toolbar: ${offered ? "offers" : "does not offer"} Hide files`,
      async () => {
        const review = await this.#review();
        await (offered
          ? review.expectFilesToggleNamed("Hide files")
          : review.expectNoFilesToggle());
      },
    );
  }

  // The eye offers to show the review details, which stay hidden.
  expectDetailsCollapsed() {
    return this.cueHere(
      "Review toolbar: review details collapsed",
      async () => {
        await (await this.#review()).details.expectCollapsed();
      },
    );
  }
}
