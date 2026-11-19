// System settings → Usage actions and observations, with expectations supplied by cases.
import type { Page } from "@playwright/test";
import { historyChart } from "../historyChartPage.ts";
import { expect } from "../dashboardTest.ts";
import { usageChartName } from "./usageChartPage.ts";
import { usageToolsView } from "./usageToolsPage.ts";

export type { UsageToolName } from "./usageToolsPage.ts";

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

export async function visitUsage(page: Page, baseURL = "") {
  await page.goto(`${baseURL}/?view=settings`);
  await expectGeneralSettingsShown(page);
  return openUsage(page);
}

type FactWords = string | { readonly at: string; readonly outcome: string };
export type TaskDetail = {
  readonly title: string;
  readonly about: string;
  readonly facts: readonly (readonly [term: string, words: FactWords])[];
};

// A mark's readout once selected: "Selected task" follows its tool's name.
const selectedReadout = (readout: string) =>
  readout.replace(/^([^·]+ · (?:Codex|Claude Code) · )/, "$1Selected task · ");

export function usageView(page: Page) {
  const view = page.getByRole("region", { name: "Token index", exact: true });
  const trend = view.getByRole("region", {
    name: "Token index trend",
    exact: true,
  });
  const chart = historyChart(trend, usageChartName);
  const filter = (label: string) =>
    view.getByRole("combobox", { name: label, exact: true });
  const detail = view.getByRole("region", {
    name: "Selected task",
    exact: true,
  });
  const fact = (term: string) =>
    detail
      .locator("dl > div")
      .filter({
        has: page.getByText(term, { exact: true }),
      })
      .locator("dd");
  const showsFact = async (term: string, words: FactWords) => {
    const value = fact(term);
    if (typeof words === "string") await expect(value).toHaveText(words);
    else {
      await expect(value.locator("time")).toHaveAttribute("datetime", words.at);
      await expect(value).toHaveText(new RegExp(` · ${words.outcome}$`));
    }
  };
  return {
    ...usageToolsView(page, view, trend, chart),
    async chooseDays(days: string) {
      await view.getByRole("textbox", { name: "Last N days" }).fill(days);
    },
    async showsDays(days: string) {
      await expect(
        view.getByRole("textbox", { name: "Last N days" }),
      ).toHaveValue(days);
    },
    async showsDaysProblem(words: string) {
      await expect(
        view.getByRole("textbox", { name: "Last N days" }),
      ).toHaveAttribute("aria-invalid", "true");
      await expect(view.getByRole("alert")).toHaveText(words);
    },
    async showsNoDetail() {
      await expect(detail).toHaveCount(0);
    },
    async showsLoading() {
      await expect(view.getByRole("status")).toHaveText("Loading usage…");
    },
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
    async showsPointCount(count: number) {
      await expect(chart.marks).toHaveCount(count);
    },
    // One mark per plotted task, each read as "<end date> · <index>".
    async showsPoints(readouts: readonly string[]) {
      await expect(chart.marks).toHaveCount(readouts.length);
      for (const readout of readouts)
        await expect(chart.mark(readout)).toBeVisible();
    },
    // How many partial points the chart draws hollow.
    async showsPartialPoints(count: number) {
      await expect(chart.partial).toHaveCount(count);
    },
    // How many points carry the visible estimate cue (≈) beside them.
    async showsEstimatedPoints(count: number) {
      await expect(chart.box.locator(".history-chart-estimate")).toHaveCount(
        count,
      );
      if (count > 0)
        await expect(
          trend.getByText(/≈ marks an estimated rate\.$/),
        ).toBeVisible();
    },
    async showsNoPoints(words: string) {
      await expect(trend.getByText(words, { exact: true })).toBeVisible();
      await expect(chart.marks).toHaveCount(0);
    },
    // Selects the point read as `readout`, pressing it by pointer or, once
    // focused, with Enter; it shows as the one selected point.
    async selectPoint(readout: string, by: "pointer" | "keyboard" | "touch") {
      const mark = chart.mark(readout);
      if (by === "pointer") await mark.click();
      else if (by === "touch") await mark.tap();
      else {
        await mark.focus();
        await page.keyboard.press("Enter");
      }
      await expect(
        chart.box.getByRole("button", { pressed: true }),
      ).toHaveAccessibleName(selectedReadout(readout));
      await expect(detail).toBeVisible();
    },
    async showsDetail({ title, about, facts }: TaskDetail) {
      await expect(detail.getByRole("heading")).toHaveText(title);
      await expect(detail.locator(".settings-note")).toHaveText(about);
      await expect(detail.locator("dt")).toHaveText(
        facts.map(([term]) => term),
      );
      for (const [term, words] of facts) await showsFact(term, words);
    },
    showsFact,
    // Closes the detail; focus returns to the point read as `readout`.
    async closeDetail(readout: string) {
      await detail.getByRole("button", { name: "Close", exact: true }).click();
      await expect(detail).toHaveCount(0);
      await expect(chart.mark(readout)).toBeFocused();
    },
    async showsTariff(label: string) {
      await expect(trend.getByText(label, { exact: true })).toBeVisible();
    },
    async refresh() {
      await view.getByRole("button", { name: "Refresh", exact: true }).click();
    },
    // While a Refresh checks, Refresh waits and a note says so.
    async showsChecking() {
      await expect(
        view.getByRole("button", { name: "Refresh", exact: true }),
      ).toBeDisabled();
      await expect(
        view.getByRole("status").filter({ hasText: "Checking" }),
      ).toHaveText("Checking for new usage…");
    },
    // The Refresh finished: it can be pressed again and no note says
    // checking.
    async showsChecked() {
      await expect(
        view.getByRole("button", { name: "Refresh", exact: true }),
      ).toBeEnabled();
      await expect(
        view.getByRole("status").filter({ hasText: "Checking" }),
      ).toHaveCount(0);
    },
    async showsProblem(words: string) {
      await expect(view.getByRole("alert")).toHaveText(words);
    },
    async showsNoProblem() {
      await expect(view.getByRole("alert")).toHaveCount(0);
    },
    // "Checked" with the recorded instant `at` (ISO).
    async showsCheckedAt(at: string) {
      await expect(
        view.locator("p", { hasText: /^Checked / }).locator("time"),
      ).toHaveAttribute("datetime", at);
    },
  };
}
