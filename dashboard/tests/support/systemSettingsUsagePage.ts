// System settings → Usage (../../src/SystemSettingsUsage.tsx) as Terry
// meets it: its view beside General, the cohort its filters show and offer,
// choosing a filter's option, the Token index points on the shared history
// chart (../historyChartPage.ts), the
// moving average's figure, the tariff version and the check time. Scenarios
// supply every expected value.
import type { Page } from "@playwright/test";
import { historyChart } from "../historyChartPage.ts";
import { expect } from "../dashboardTest.ts";

const viewButton = (page: Page, name: "General" | "Usage") =>
  page
    .getByRole("navigation", { name: "System settings views" })
    .getByRole("button", { name, exact: true });

// General is the view System settings opens on, with the existing settings.
export async function expectGeneralSettingsShown(page: Page) {
  await expect(viewButton(page, "General")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    page.getByRole("heading", { name: "Projects", exact: true }),
  ).toBeVisible();
}

// Opens Usage from System settings; the existing settings leave the page.
export async function openUsage(page: Page) {
  await viewButton(page, "Usage").click();
  await expect(viewButton(page, "Usage")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    page.getByRole("heading", { name: "Projects", exact: true }),
  ).toHaveCount(0);
  return usageView(page);
}

export function usageView(page: Page) {
  const view = page.getByRole("region", { name: "Token index", exact: true });
  const trend = view.getByRole("region", {
    name: "Token index trend",
    exact: true,
  });
  const chart = historyChart(
    trend,
    "Token index per finished task by end date",
  );
  const filter = (label: string) =>
    view.getByRole("combobox", { name: label, exact: true });
  return {
    // The chosen option of each filter, by its label.
    async showsCohort(cohort: Readonly<Record<string, string>>) {
      for (const [label, choice] of Object.entries(cohort))
        await expect(filter(label).locator("option:checked")).toHaveText(
          choice,
        );
    },
    // Every option the filter labelled `label` offers, in order.
    async offers(label: string, choices: readonly string[]) {
      await expect(filter(label).getByRole("option")).toHaveText([...choices]);
    },
    async choose(label: string, choice: string) {
      await filter(label).selectOption({ label: choice });
      await expect(filter(label).locator("option:checked")).toHaveText(choice);
    },
    // One mark per plotted task, each read as "<end date> · <index>".
    async showsPoints(readouts: readonly string[]) {
      await expect(chart.marks).toHaveCount(readouts.length);
      for (const readout of readouts)
        await expect(chart.mark(readout)).toBeVisible();
    },
    // The latest moving average's figure, with its line drawn.
    async showsAverage(figure: string) {
      const average = trend.locator(".usage-average");
      await expect(average.locator("strong")).toHaveText(figure);
      await expect(average).toContainText("10-task moving average");
      await expect(chart.line).toHaveCount(1);
    },
    async showsTariff(label: string) {
      await expect(trend.getByText(label, { exact: true })).toBeVisible();
    },
    // "Checked" with the recorded instant `at` (ISO).
    async showsCheckedAt(at: string) {
      await expect(
        view.locator("p", { hasText: /^Checked / }).locator("time"),
      ).toHaveAttribute("datetime", at);
    },
  };
}
