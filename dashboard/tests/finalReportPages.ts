// A session's Final report, a Side panel content, as a fluent page object
// for the Side panel journeys (./sidePanelPages.ts). Each method writes one
// named cue on the phase's cue sheet (./support/cueSheet.ts) and returns the
// page object the reader is then at (./fluentPageObject.ts).

import { PageObject } from "./fluentPageObject.ts";
import { expect } from "./support/preparationPage.ts";

export class FinalReport extends PageObject {
  get #report() {
    return this.page.getByRole("region", { name: "Final report" });
  }

  expectText(text: string) {
    return this.cueHere(`Final report: says "${text}"`, () =>
      expect(this.#report).toContainText(text),
    );
  }
}
