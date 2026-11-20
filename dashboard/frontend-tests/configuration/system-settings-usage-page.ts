// System settings → Usage mounted operations and readings for cohort, period
// and task-detail cases (../../src/SystemSettingsUsage.tsx).
import { createElement } from "react";
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import { SystemSettingsUsage } from "../../src/SystemSettingsUsage.tsx";
import type { UsageSource } from "../../src/usageSource.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

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
  const filter = (label: string) =>
    view.getByRole("combobox", { name: label, exact: true });
  const detail = view.getByRole("region", {
    name: "Selected task",
    exact: true,
  });
  const summary = () =>
    trend
      .getByRole("list", { name: "Selected tools", exact: true })
      .getByRole("listitem")
      .query();
  const chartDrawing = () =>
    trend.getByRole("img", { name: usageChartName }).query();
  const mark = (readout: string) =>
    trend.getByRole("button", { name: readout, exact: true });
  const markCount = () =>
    trend.query()?.querySelectorAll(".history-chart-chart button").length ?? 0;
  const factElement = (term: string) =>
    [...(detail.query()?.querySelectorAll("dl > div") ?? [])]
      .find((row) => row.querySelector("dt")?.textContent === term)
      ?.querySelector("dd") ?? null;

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
    return usage;
  };

  const usage = {
    async chooseDays(days: string) {
      await daysField.fill(days);
      return usage;
    },
    async showsDays(days: string) {
      await expect.element(daysField).toHaveValue(days);
      return usage;
    },
    async showsDaysProblem(words: string) {
      await expect.element(daysField).toHaveAttribute("aria-invalid", "true");
      await expect
        .poll(() => view.getByRole("alert").query()?.textContent)
        .toBe(words);
      return usage;
    },
    async showsLoading() {
      await expect
        .poll(() => view.getByRole("status").query()?.textContent)
        .toBe("Loading usage…");
      return usage;
    },
    async choose(label: string, choice: string) {
      const select = filter(label);
      await userEvent.selectOptions(
        select,
        select.getByRole("option", { name: choice, exact: true }),
      );
      await expect
        .poll(
          () =>
            (select.query() as HTMLSelectElement | null)?.selectedOptions[0]
              ?.textContent,
        )
        .toBe(choice);
      return usage;
    },
    async showsCohortNote(words: string) {
      await expect
        .poll(() => summary()?.querySelector(".usage-tool-count")?.textContent)
        .toBe(words);
      return usage;
    },
    async showsMedian(figure: string) {
      await expect
        .poll(
          () => summary()?.querySelector(".usage-median strong")?.textContent,
        )
        .toBe(figure);
      await expect
        .poll(() => summary()?.querySelector(".usage-median span")?.textContent)
        .toBe("10-task rolling median");
      await expect
        .poll(() => {
          const lines = chartDrawing()?.querySelectorAll(".history-chart-line");
          return lines?.length === 1
            ? (lines[0]?.getBoundingClientRect().width ?? 0)
            : 0;
        })
        .toBeGreaterThan(0);
      return usage;
    },
    async showsNoMedian(words: string) {
      await expect
        .poll(
          () => summary()?.querySelector(".usage-median strong")?.textContent,
        )
        .toBe("—");
      await expect
        .poll(() => summary()?.querySelector(".usage-median span")?.textContent)
        .toBe(words);
      await expect
        .poll(
          () =>
            chartDrawing()?.querySelectorAll(".history-chart-line").length ?? 0,
        )
        .toBe(0);
      return usage;
    },
    async showsPointCount(count: number) {
      await expect.poll(markCount).toBe(count);
      return usage;
    },
    async showsPartialPoints(count: number) {
      await expect
        .poll(
          () =>
            chartDrawing()?.querySelectorAll(".history-chart-partial").length ??
            0,
        )
        .toBe(count);
      return usage;
    },
    async showsNoPoints(words: string) {
      await expect
        .element(trend.getByText(words, { exact: true }))
        .toBeVisible();
      await expect.poll(markCount).toBe(0);
      return usage;
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
      return usage;
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
      return usage;
    },
    showsFact,
    async closeDetail(readout: string) {
      await userEvent.click(
        detail.getByRole("button", { name: "Close", exact: true }),
      );
      await expect.element(detail).not.toBeInTheDocument();
      await expect.element(mark(readout)).toHaveFocus();
      return usage;
    },
  };
  return usage;
}
