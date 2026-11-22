// The chart key and tool summary swatches compared to their rendered marks.
import { expect } from "vitest";
import type { Locator } from "vitest/browser";
import {
  paintOf,
  shapeOf,
  type TraceMarks,
} from "./system-settings-usage-chart-mark.ts";
import type { UsageToolName } from "./system-settings-usage-tools-page.ts";

function expectMatchingMarks(shown: Element, drawn: Element) {
  expect(shapeOf(shown)).toBe(shapeOf(drawn));
  expect(paintOf(shown)).toEqual(paintOf(drawn));
}

export function usageLegendView(
  trend: Locator,
  marksFor: (name: UsageToolName) => TraceMarks,
) {
  const key = trend.getByRole("list", { name: "Chart key", exact: true });
  const summaries = trend.getByRole("list", {
    name: "Selected tools",
    exact: true,
  });
  const items = key.getByRole("listitem");
  const markIn = (item: Element | undefined) => item?.querySelector("svg > *");
  return {
    async showsKeyFor(names: readonly UsageToolName[]) {
      await expect
        .poll(() =>
          items
            .elements()
            .map((item) => item.textContent.trim().replace(/\s+/g, " ")),
        )
        .toEqual(
          names.flatMap((name) => [
            `${name} task`,
            `${name} partial or provisional`,
            `${name} rolling median (↑ above scale)`,
          ]),
        );
      for (const [index, name] of names.entries()) {
        const { task, partial, median } = marksFor(name);
        const [keyTask, keyPartial, keyMedian] = items
          .elements()
          .slice(index * 3, index * 3 + 3)
          .map(markIn);
        if (
          !task ||
          !partial ||
          !median ||
          !keyTask ||
          !keyPartial ||
          !keyMedian
        )
          throw new Error(`${name} is missing marks in the chart or key.`);
        expectMatchingMarks(keyTask, task);
        expectMatchingMarks(keyPartial, partial);
        expect(paintOf(keyMedian)).toEqual(paintOf(median));
      }
    },
    async showsSummarySwatches(names: readonly UsageToolName[]) {
      for (const name of names) {
        const row = summaries.getByRole("listitem", { name, exact: true });
        await expect.element(row).toBeVisible();
        const swatch = markIn(row.element().querySelector("h4") ?? undefined);
        const { task } = marksFor(name);
        if (!swatch || !task)
          throw new Error(
            `${name} is missing its summary swatch or chart mark.`,
          );
        expectMatchingMarks(swatch, task);
      }
    },
  };
}
