// The reported session's final report in the Recently done sessions
// selection journeys (./recentlyDoneSelectionJourney.ts): opening it through
// its row's Open, and Development as it was around it.

import type { Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { finalReportParts, type FinalReportParts } from "./finalReportPages.ts";
import { report } from "./recentlyDoneSelectionJourney.ts";
import type { recentlyDoneParts } from "./recentlyDoneSessionsSidebarPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { terminalPanel } from "./terminalScreenPage.ts";

// Opens the reported session's final report through its row's Open, not its
// Select, and returns that report, showing exactly the session's message.
export async function showReport(
  page: Page,
  shown: ReturnType<typeof recentlyDoneParts>,
) {
  await shown.open(report.title).click();
  const shownReport = finalReportParts(page);
  await expect(shownReport.reportText).toHaveText(report.message);
  await expect(shown.select(report.title)).toHaveAttribute(
    "aria-current",
    "true",
  );
  return shownReport;
}

// Development as it was: still chosen, Intent unopened, nothing attached, and
// the Side panel still showing the report shown before, or, without one, empty.
export async function expectDevelopmentKept(
  page: Page,
  dashboard: DashboardServer,
  shownReport?: FinalReportParts,
) {
  const { development, intent } = parts(page);
  await expect(development).toBeChecked();
  await expect(intent).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get("perspective")).toBeNull();
  if (shownReport === undefined) {
    await expect(
      page.getByRole("region", { name: /^(Terminal|Final report)$/ }),
    ).toHaveCount(0);
  } else {
    await expect(shownReport.reportText).toHaveText(report.message);
    await expect(terminalPanel(page)).toHaveCount(0);
  }
  expect(dashboard.claudeAttaches()).toEqual([]);
}
