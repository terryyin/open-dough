// System settings → Usage (../../src/SystemSettingsUsage.tsx) as Terry
// meets it: its view beside General, the cohort its filters show and offer,
// choosing a filter's option, the cohort note's counts, the Token index
// points on the shared history chart (../historyChartPage.ts), partial ones
// hollow, the moving average's figure or why there is none, the tariff
// version, the check time, the detail of a point selected by pointer or
// keyboard, and Refresh with its checking note and any error. Scenarios
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

// What the selected task's detail reads: its heading, the line naming its
// project, story, tool and launch workflow, and each fact by its term, in
// order. `Ended` is the end instant (ISO) and the outcome's words.
export type TaskDetail = {
  readonly title: string;
  readonly about: string;
  readonly facts: readonly (
    | readonly [term: string, words: string]
    | readonly ["Ended", { readonly at: string; readonly outcome: string }]
  )[];
};

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
  const detail = view.getByRole("region", {
    name: "Selected task",
    exact: true,
  });
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
    // How many partial points the chart draws hollow.
    async showsPartialPoints(count: number) {
      await expect(chart.partial).toHaveCount(count);
    },
    // The cohort note's counts, such as "11 tasks · 1 partial · 1 unpriced".
    async showsCohortNote(words: string) {
      await expect(
        trend.locator(".usage-chart-head p.settings-note"),
      ).toHaveText(words);
    },
    // The latest moving average's figure, with its line drawn across some
    // width, even for a single value.
    async showsAverage(figure: string) {
      const average = trend.locator(".usage-average");
      await expect(average.locator("strong")).toHaveText(figure);
      await expect(average).toContainText("10-task moving average");
      await expect(chart.line).toHaveCount(1);
      await expect
        .poll(async () => (await chart.line.boundingBox())?.width ?? 0)
        .toBeGreaterThan(0);
    },
    // No figure and no line, with the words saying why.
    async showsNoAverage(words: string) {
      const average = trend.locator(".usage-average");
      await expect(average.locator("strong")).toHaveText("—");
      await expect(average).toContainText(words);
      await expect(chart.line).toHaveCount(0);
    },
    // No chart, with the words saying why.
    async showsNoPoints(words: string) {
      await expect(trend.getByText(words, { exact: true })).toBeVisible();
      await expect(chart.marks).toHaveCount(0);
    },
    // Selects the point read as `readout`, pressing it by pointer or, once
    // focused, with Enter; it shows as the one selected point.
    async selectPoint(readout: string, by: "pointer" | "keyboard") {
      const mark = chart.mark(readout);
      if (by === "pointer") await mark.click();
      else {
        await mark.focus();
        await page.keyboard.press("Enter");
      }
      await expect(
        chart.box.getByRole("button", { pressed: true }),
      ).toHaveAccessibleName(readout.replace(" · ", " · Selected task · "));
      await expect(detail).toBeVisible();
    },
    async showsDetail({ title, about, facts }: TaskDetail) {
      await expect(detail.getByRole("heading")).toHaveText(title);
      await expect(detail.locator(".settings-note")).toHaveText(about);
      await expect(detail.locator("dt")).toHaveText(
        facts.map(([term]) => term),
      );
      for (const [at, [, words]] of facts.entries()) {
        const fact = detail.locator("dd").nth(at);
        if (typeof words === "string") await expect(fact).toHaveText(words);
        else {
          await expect(fact.locator("time")).toHaveAttribute(
            "datetime",
            words.at,
          );
          await expect(fact).toHaveText(new RegExp(` · ${words.outcome}$`));
        }
      }
    },
    // The selected task's fact named `term`, read as `words`.
    async showsFact(term: string, words: string) {
      const fact = detail
        .locator("dl > div")
        .filter({ has: page.getByText(term, { exact: true }) });
      await expect(fact.locator("dd")).toHaveText(words);
    },
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
      ).toHaveText("Checking Codex rollouts for new usage…");
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
    // "Checked" with the recorded instant `at` (ISO).
    async showsCheckedAt(at: string) {
      await expect(
        view.locator("p", { hasText: /^Checked / }).locator("time"),
      ).toHaveAttribute("datetime", at);
    },
  };
}
