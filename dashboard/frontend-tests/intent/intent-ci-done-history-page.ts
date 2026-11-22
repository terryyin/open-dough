// A selected Done story's CI wall time history in its CI comparison
// (../../src/IntentCiDoneWallTimeReference.tsx) as a reader meets it: the
// brief status, the compact readout's selected, average and change lines,
// the change's cue colour, the refresh and retry controls and the chart.
import { expect } from "vitest";
import { page } from "vitest/browser";
import { tokenColour } from "../configuration/system-settings-reading.ts";
import { visibleText } from "./intent-ci-comparison-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

export async function doneWallTimeHistory() {
  await intentStoryCompare().chooseTab("CI comparison");
  const region = page
    .getByRole("main", { name: "Intent", exact: true })
    .getByRole("region", { name: "CI wall time history", exact: true });
  await expect.element(region).toBeVisible();
  const textOf = (selector: string) => () => {
    const node = region.element().querySelector(selector);
    return node === null ? undefined : visibleText(node);
  };
  const line = (index: number) => () => {
    const node = Array.from(
      region.element().querySelectorAll(".intent-ci-prior-reference > p"),
    ).at(index);
    return node === undefined ? undefined : visibleText(node);
  };
  return {
    // The brief status, undefined where the history is retained there.
    status: textOf(".intent-ci-history-status"),
    selected: line(0),
    average: line(1),
    // The change line, undefined without a usable timing and average.
    change: textOf(".intent-ci-prior-change"),
    alert: textOf("[role=alert]"),
    // Which cue colour paints the change figure.
    changeCue: () => {
      const figure = region
        .element()
        .querySelector(".intent-ci-prior-change strong");
      if (figure === null) return undefined;
      const { color } = getComputedStyle(figure);
      return (
        (["slower", "faster"] as const).find(
          (direction) =>
            color === tokenColour(region.element(), `--ci-cue-${direction}`),
        ) ?? "uncued"
      );
    },
    chartMarks: () =>
      region.element().querySelectorAll(".history-chart-chart button").length,
    chartReadout: textOf(".history-chart-chart .history-chart-readout"),
    refresh: region.getByRole("button", {
      name: "Refresh history",
      exact: true,
    }),
    retry: region.getByRole("button", { name: "Retry history", exact: true }),
  };
}
