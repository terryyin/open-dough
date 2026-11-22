// A session review's Comparison switch over its kept runs, in the review
// details of the Side panel journeys (./sidePanelPages.ts). Each cue runs the
// one Review changes page object (./reviewChangesPage.ts), which reveals the
// details its choices need.
import { PageObject } from "./fluentPageObject.ts";
import { assumeReviewChanges } from "./reviewChangesPage.ts";

export class SessionRunSwitch extends PageObject {
  #review() {
    return assumeReviewChanges(this.page);
  }

  // The runs the switch lists, in order, by their whole labels.
  expectRuns(labels: readonly string[]) {
    return this.cueHere(`Comparison: lists ${labels.join("; ")}`, async () => {
      await (await this.#review()).comparison.expectListed(labels);
    });
  }

  // The one run the switch says is shown.
  expectShown(label: string) {
    return this.cueHere(`Comparison: shows ${label}`, async () => {
      await (await this.#review()).comparison.expectChosen(label);
    });
  }

  pressFrom(label: string, key: string) {
    return this.cueHere(`Comparison: press ${key} from ${label}`, async () => {
      await (await this.#review()).comparison.press(label, key);
    });
  }

  chooseDefaultMainRun(label: string) {
    return this.cueHere(`Default main runs: choose ${label}`, async () => {
      await (await this.#review()).comparison.chooseDefaultMainRun(label);
    });
  }

  choose(label: string) {
    return this.cueHere(`Comparison: choose ${label}`, async () => {
      await (await this.#review()).comparison.choose(label);
    });
  }
}
