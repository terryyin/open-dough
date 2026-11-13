// A session's Final report, a Side panel content. Procedural journeys open it
// through a Session entry's Read final report (./sessionEntryAccess.ts) and
// read its parts; the Side panel journeys (./sidePanelPages.ts) use it as a
// fluent page object, each method writing one named cue on the phase's cue
// sheet (./support/cueSheet.ts) and returning the page object the reader is
// then at (./fluentPageObject.ts).

import type { Locator, Page } from "@playwright/test";
import { PageObject } from "./fluentPageObject.ts";
import { readFinalReportControl } from "./sessionEntryAccess.ts";
import { sidePanelNamesOf } from "./sidePanelFrame.ts";
import { expect } from "./support/preparationPage.ts";
export { readFinalReportControl } from "./sessionEntryAccess.ts";

function finalReportPanel(page: Page) {
  return page.getByRole("region", { name: "Final report" });
}

// The report's own words, shown verbatim as text.
export const finalReportText = (page: Page) =>
  finalReportPanel(page).locator(".final-report-text");

// The Side panel's Final report: its report text; the body that takes the
// keyboard when the report opens; the frame that scrolls it; and what its
// header names.
export function finalReportParts(page: Page) {
  const panel = finalReportPanel(page);
  return {
    panel,
    reportText: finalReportText(page),
    reportBody: panel.locator(".final-report-body"),
    reportScroll: panel.locator(".final-report-scroll"),
    ...sidePanelNamesOf(panel),
  };
}
export type FinalReportParts = ReturnType<typeof finalReportParts>;

// Presses the entry's Read final report and returns the Final report it
// opens; the case states what that report must say.
export async function readFinalReport(entry: Locator) {
  await readFinalReportControl(entry).click();
  return finalReportParts(entry.page());
}

export class FinalReport extends PageObject {
  // Contains `text` anywhere in the panel; exact report text is read through
  // finalReportText by the procedural journeys.
  expectText(text: string) {
    return this.cueHere(`Final report: says "${text}"`, () =>
      expect(finalReportPanel(this.page)).toContainText(text),
    );
  }
}
