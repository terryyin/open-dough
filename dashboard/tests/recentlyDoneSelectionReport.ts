// The reported session's final report in the Recently done sessions
// selection journeys (./recentlyDoneSelectionJourney.ts): opening it through
// its row's Open, and Development as it was around it.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { report } from "./recentlyDoneSelectionJourney.ts";
import type { recentlyDoneParts } from "./recentlyDoneSessionsSidebarPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";

// Opens the reported session's final report through its row's Open.
export async function showReport(
  page: Page,
  shown: ReturnType<typeof recentlyDoneParts>,
) {
  await shown.open(report.title).click();
  const panel = page.getByRole("region", { name: "Final report" });
  await expect(panel.locator(".final-report-text")).toHaveText(report.message);
  await expect(shown.entry(report.title)).toHaveAttribute(
    "aria-current",
    "true",
  );
  return panel;
}

// Development as it was: still chosen, Intent unopened, nothing attached, and
// the Side panel still showing the report in `panel`, or, without one, empty.
export async function expectDevelopmentKept(
  page: Page,
  dashboard: DashboardServer,
  panel?: Locator,
) {
  const { development, intent } = parts(page);
  await expect(development).toBeChecked();
  await expect(intent).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get("perspective")).toBeNull();
  if (panel === undefined) {
    await expect(
      page.getByRole("region", { name: /^(Terminal|Final report)$/ }),
    ).toHaveCount(0);
  } else {
    await expect(panel.locator(".final-report-text")).toHaveText(
      report.message,
    );
    await expect(page.getByRole("region", { name: "Terminal" })).toHaveCount(0);
  }
  expect(dashboard.claudeAttaches()).toEqual([]);
}
