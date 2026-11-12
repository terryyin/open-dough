// A session's Final report, a Side panel content, as a fluent page object
// for the Side panel journeys (./sidePanelPages.ts). Each method writes one
// named cue on the phase's cue sheet (./support/cueSheet.ts) and returns the
// page object the reader is then at (./fluentPageObject.ts).

import { PageObject } from "./fluentPageObject.ts";
import { expect } from "./support/preparationPage.ts";
import type { Page } from "@playwright/test";

function finalReportPanel(page: Page) {
  return page.getByRole("region", { name: "Final report" });
}

// The report text the panel shows once its read answers with one.
export const finalReportText = (page: Page) =>
  finalReportPanel(page).locator(".final-report-text");

export class FinalReport extends PageObject {
  get #report() {
    return finalReportPanel(this.page);
  }

  expectText(text: string) {
    return this.cueHere(`Final report: says "${text}"`, () =>
      expect(this.#report).toContainText(text),
    );
  }
}
