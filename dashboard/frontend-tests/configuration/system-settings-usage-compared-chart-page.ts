// Observe the geometry, trace styles and selected mark of a compared plot.
import { expect } from "vitest";
import type { Locator } from "vitest/browser";
import {
  centreOf,
  markContrast,
  paintOf,
  shapeOf,
  tokenColour,
  type TraceMarks,
} from "./system-settings-usage-chart-mark.ts";
import type { UsageToolName } from "./system-settings-usage-tools-page.ts";

export function usageComparedChartView(
  trend: Locator,
  drawn: (selector: string) => Element[],
  mark: (readout: string) => Locator,
  marksFor: (name: UsageToolName) => TraceMarks,
) {
  const traces = () => [marksFor("Codex"), marksFor("Claude Code")] as const;
  return {
    markCentres(readouts: readonly string[]) {
      return Promise.all(
        readouts.map(async (readout) => {
          const target = mark(readout);
          await expect.element(target).toBeVisible();
          return centreOf(target.element());
        }),
      );
    },
    async showsDistinctTraces() {
      const plotted = () =>
        traces().every(
          ({ task, partial, median }) =>
            task !== undefined && partial !== undefined && median !== undefined,
        );
      await expect.poll(plotted).toBe(true);
      const [codex, claude] = traces();
      const {
        task: codexTask,
        partial: codexPartial,
        median: codexMedian,
      } = codex;
      const {
        task: claudeTask,
        partial: claudePartial,
        median: claudeMedian,
      } = claude;
      if (
        !codexTask ||
        !codexPartial ||
        !codexMedian ||
        !claudeTask ||
        !claudePartial ||
        !claudeMedian
      )
        throw new Error(
          "Measured, partial and median marks must be drawn for both tools.",
        );

      expect(shapeOf(codexTask)).toBe("circle");
      expect(shapeOf(codexPartial)).toBe(4);
      expect(shapeOf(claudeTask)).toBe(3);
      expect(shapeOf(claudePartial)).toBe(3);
      const claudeFill = paintOf(claudeTask).fill;
      expect(claudeFill).not.toBe(paintOf(codexTask).fill);
      const caution = tokenColour(trend.element(), "--caution");
      for (const hollow of [codexPartial, claudePartial]) {
        const { fill, stroke } = paintOf(hollow);
        expect(stroke).toBe(caution);
        expect(fill).not.toBe(claudeFill);
      }
      const codexLine = paintOf(codexMedian);
      const claudeLine = paintOf(claudeMedian);
      expect(claudeLine.stroke).not.toBe(codexLine.stroke);
      expect(claudeLine.strokeDasharray).toBe("6px, 3px");
      expect(codexLine.strokeDasharray).toBe("none");
      for (const element of [
        claudeTask,
        claudePartial,
        codexPartial,
        claudeMedian,
      ]) {
        const { fill, stroke } = paintOf(element);
        expect(
          markContrast(element, [fill, stroke]),
          "chart mark contrast",
        ).toBeGreaterThanOrEqual(3);
      }
    },
    async showsSelectedDiamond(tool: UsageToolName) {
      const selectedMarks = () => drawn("path.history-chart-point");
      await expect.poll(selectedMarks).toHaveLength(1);
      await expect
        .poll(() =>
          drawn(".history-chart-selected").map((label) => label.textContent),
        )
        .toEqual(["Selected task"]);
      const [selected] = selectedMarks();
      const { partial } = marksFor(tool);
      if (!selected || !partial)
        throw new Error(
          `${tool} must draw a selected mark and an ordinary partial mark.`,
        );
      expect(shapeOf(selected)).toBe(4);
      expect(selected.getBoundingClientRect().height).toBeGreaterThan(
        partial.getBoundingClientRect().height,
      );
    },
    async showsNote(words: string) {
      await expect
        .element(trend.getByText(words, { exact: true }))
        .toBeVisible();
    },
  };
}
