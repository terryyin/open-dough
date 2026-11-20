// System settings → Usage mounted operations and readings for cohort, period,
// selection, Refresh and task-detail cases (../../src/SystemSettingsUsage.tsx).
import { createElement } from "react";
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import { SystemSettingsUsage } from "../../src/SystemSettingsUsage.tsx";
import type { UsageSource } from "../../src/usageSource.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { usageToolsView } from "./system-settings-usage-tools-page.ts";

type FactWords = string | { readonly at: string; readonly outcome: string };

export type TaskDetail = {
  readonly title: string;
  readonly about: string;
  readonly facts: readonly (readonly [term: string, words: FactWords])[];
};

const usageChartName =
  /^Token index per finished task (by end date|in task order, equally spaced)$/;

// A mark's readout once selected: "Selected task" follows its tool's name.
const selectedReadout = (readout: string) =>
  readout.replace(/^([^·]+ · (?:Codex|Claude Code) · )/, "$1Selected task · ");

export async function mountUsage(source: UsageSource) {
  await mountComponent(createElement(SystemSettingsUsage, { source }));
  return usageView();
}

function usageView() {
  const view = page.getByRole("region", { name: "Token index", exact: true });
  const trend = view.getByRole("region", {
    name: "Token index trend",
    exact: true,
  });
  const daysField = view.getByRole("textbox", { name: /^Last N days/ });
  const refreshButton = view.getByRole("button", {
    name: "Refresh",
    exact: true,
  });
  const filter = (label: string) =>
    view.getByRole("combobox", { name: label, exact: true });
  const detail = view.getByRole("region", {
    name: "Selected task",
    exact: true,
  });
  const chartDrawing = () =>
    trend.getByRole("img", { name: usageChartName }).query();
  const mark = (readout: string) =>
    trend.getByRole("button", { name: readout, exact: true });
  const markCount = () =>
    trend.query()?.querySelectorAll(".history-chart-chart button").length ?? 0;
  const checkingStatus = () =>
    [...(view.query()?.querySelectorAll('[role="status"]') ?? [])].find(
      (each) => each.textContent.includes("Checking"),
    )?.textContent ?? null;
  const factElement = (term: string) =>
    [...(detail.query()?.querySelectorAll("dl > div") ?? [])]
      .find((row) => row.querySelector("dt")?.textContent === term)
      ?.querySelector("dd") ?? null;

  const selectedChoice = (select: ReturnType<typeof filter>) =>
    (select.query() as HTMLSelectElement | null)?.selectedOptions[0]
      ?.textContent;
  const showsProblem = async (words: string) => {
    await expect
      .poll(() => view.getByRole("alert").query()?.textContent)
      .toBe(words);
  };
  const showsFact = async (term: string, words: FactWords) => {
    if (typeof words === "string") {
      await expect.poll(() => factElement(term)?.textContent).toBe(words);
    } else {
      await expect
        .poll(() =>
          factElement(term)?.querySelector("time")?.getAttribute("datetime"),
        )
        .toBe(words.at);
      await expect
        .poll(() => factElement(term)?.textContent ?? "")
        .toMatch(new RegExp(` · ${words.outcome}$`));
    }
  };

  return {
    ...usageToolsView(view, trend, chartDrawing),
    async chooseDays(days: string) {
      await daysField.fill(days);
    },
    async showsDays(days: string) {
      await expect.element(daysField).toHaveValue(days);
    },
    async showsDaysProblem(words: string) {
      await expect.element(daysField).toHaveAttribute("aria-invalid", "true");
      await showsProblem(words);
    },
    async showsLoading() {
      await expect
        .poll(() => view.getByRole("status").query()?.textContent)
        .toBe("Loading usage…");
    },
    showsProblem,
    async showsNoProblem() {
      await expect.element(view.getByRole("alert")).not.toBeInTheDocument();
    },
    async showsCohort(cohort: Readonly<Record<string, string>>) {
      for (const [label, choice] of Object.entries(cohort)) {
        const select = filter(label);
        await expect.poll(() => selectedChoice(select)).toBe(choice);
      }
    },
    async offers(label: string, choices: readonly string[]) {
      const select = filter(label);
      await expect
        .poll(() =>
          [...(select.query()?.querySelectorAll("option") ?? [])].map(
            (option) => option.textContent,
          ),
        )
        .toEqual([...choices]);
    },
    async choose(label: string, choice: string) {
      const select = filter(label);
      await userEvent.selectOptions(
        select,
        select.getByRole("option", { name: choice, exact: true }),
      );
      await expect.poll(() => selectedChoice(select)).toBe(choice);
    },
    async showsPointCount(count: number) {
      await expect.poll(markCount).toBe(count);
    },
    async showsPoints(readouts: readonly string[]) {
      await expect.poll(markCount).toBe(readouts.length);
      for (const readout of readouts) {
        await expect.element(mark(readout)).toBeVisible();
      }
    },
    async refresh() {
      await userEvent.click(refreshButton);
    },
    async showsChecking() {
      await expect.element(refreshButton).toBeDisabled();
      await expect.poll(checkingStatus).toBe("Checking for new usage…");
    },
    async showsChecked() {
      await expect.element(refreshButton).toBeEnabled();
      await expect.poll(checkingStatus).toBeNull();
    },
    async showsCheckedAt(at: string) {
      await expect
        .poll(() =>
          [...(view.query()?.querySelectorAll("p") ?? [])]
            .find((paragraph) => paragraph.textContent.startsWith("Checked "))
            ?.querySelector("time")
            ?.getAttribute("datetime"),
        )
        .toBe(at);
    },
    async showsPartialPoints(count: number) {
      await expect
        .poll(
          () =>
            chartDrawing()?.querySelectorAll(".history-chart-partial").length ??
            0,
        )
        .toBe(count);
    },
    async showsNoPoints(words: string) {
      await expect
        .element(trend.getByText(words, { exact: true }))
        .toBeVisible();
      await expect.poll(markCount).toBe(0);
    },
    async selectPoint(readout: string, by: "pointer" | "keyboard") {
      const target = mark(readout);
      if (by === "pointer") {
        await userEvent.click(target);
      } else {
        await expect.element(target).toBeInTheDocument();
        (target.element() as HTMLElement).focus();
        await userEvent.keyboard("{Enter}");
      }
      await expect
        .element(trend.getByRole("button", { pressed: true }))
        .toHaveAccessibleName(selectedReadout(readout));
      await expect.element(detail).toBeVisible();
    },
    async showsDetail({ title, about, facts }: TaskDetail) {
      await expect
        .poll(() => detail.getByRole("heading").query()?.textContent)
        .toBe(title);
      await expect
        .poll(
          () => detail.query()?.querySelector(".settings-note")?.textContent,
        )
        .toBe(about);
      await expect
        .poll(() =>
          [...(detail.query()?.querySelectorAll("dt") ?? [])].map(
            (each) => each.textContent,
          ),
        )
        .toEqual(facts.map(([term]) => term));
      for (const [term, words] of facts) {
        await showsFact(term, words);
      }
    },
    showsFact,
    async closeDetail(readout: string) {
      await userEvent.click(
        detail.getByRole("button", { name: "Close", exact: true }),
      );
      await expect.element(detail).not.toBeInTheDocument();
      await expect.element(mark(readout)).toHaveFocus();
    },
  };
}
