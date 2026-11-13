// A session's Final report, a Side panel content, as a fluent page object
// for the Side panel journeys (./sidePanelPages.ts). Each method writes one
// named cue on the phase's cue sheet (./support/cueSheet.ts) and returns the
// page object the reader is then at (./fluentPageObject.ts).

import { PageObject } from "./fluentPageObject.ts";
import { expect } from "./support/preparationPage.ts";
import type { Locator, Page } from "@playwright/test";
import { readFinalReportControl } from "./sessionEntryAccess.ts";
export { readFinalReportControl } from "./sessionEntryAccess.ts";

export function finalReportPanel(page: Page) {
  return page.getByRole("region", { name: "Final report" });
}

export const finalReportText = (page: Page) =>
  finalReportPanel(page).locator(".final-report-text");

// A quiet completion leaves its native final report independently readable.
// Wait for the report text as the open's observable; a concurrent Board
// refresh can drop a click, so click again only while the report is absent.
export async function readReportUntilText(
  entry: Locator,
  reportText: Locator,
  text: string,
) {
  const openReport = readFinalReportControl(entry, { exact: false });
  await expect(async () => {
    if ((await reportText.count()) === 0) await openReport.click();
    await expect(reportText).toHaveText(text);
  }).toPass();
}

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
