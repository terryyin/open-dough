// A scope history's chart (../../src/HistoryChart.tsx) as a reader meets it:
// each build's mark by shape, place and paint, the button over each drawn
// mark, its readout by pointer, keyboard or touch, and the duration axis.
import type { Locator } from "vitest/browser";
import {
  paintContrast,
  tokenColour,
} from "../configuration/system-settings-reading.ts";
import { centreOf } from "../configuration/system-settings-usage-chart-mark.ts";
import { tapWhereShown } from "../navigation/board-touch-page.ts";
import { visibleText } from "./intent-ci-comparison-page.ts";

// Each kind of drawn mark: measured, the selected diamond, a failed build's
// × and a hollow mark for no timing.
const parts = {
  measured: ":is(circle, polygon).history-chart-point",
  selected: "path.history-chart-point",
  failed: ".history-chart-failed",
  unavailable: ".history-chart-unavailable",
} as const;
type Part = keyof typeof parts;

const lookOf = (node: Element | undefined) => {
  if (node === undefined) throw new Error("Chart part not drawn");
  return getComputedStyle(node);
};

// The build a chart marks: a Done story's landing or Project Intent's trunk.
export type ChartEndpoint = "selected landing" | "observed trunk endpoint";

// The chart for UNIT ("test cases", "test files") through ENDPOINT. Its
// drawing is laid out only once its plot is measured, after the history's
// readout settles; it is drawn when its marks and readout are shown.
export function chartIn(
  history: Locator,
  unit: string,
  endpoint: ChartEndpoint,
) {
  const drawing = () =>
    history
      .element()
      .querySelector(
        `[role=img][aria-label="Test execution time for ${unit} by build date; ${endpoint} marked"]`,
      );
  const box = () => drawing()?.closest(".history-chart-chart") ?? null;
  const within = (selector: string) => [
    ...(drawing()?.querySelectorAll(selector) ?? []),
  ];
  const yOf = (node: Element | undefined) => {
    if (node === undefined) throw new Error("Chart part not drawn");
    return centreOf(node).y;
  };
  const markButtons = () => [...(box()?.querySelectorAll("button") ?? [])];
  const markNamed = (readout: string) =>
    markButtons().find((mark) => mark.getAttribute("aria-label") === readout);
  const markFor = (readout: string) => {
    const mark = markNamed(readout);
    if (mark === undefined) throw new Error(`No mark ${readout}`);
    return mark;
  };
  const readoutElement = () =>
    box()?.querySelector(".history-chart-readout") ?? null;
  const axisLabelNodes = () => within("g:has(> .history-chart-grid) > text");
  return {
    drawn: () => readoutElement() !== null,
    marks: () => markButtons().length,
    // Each mark's name: its date, timing and build role.
    markNames: () =>
      markButtons().map((mark) => mark.getAttribute("aria-label")),
    // Each mark's horizontal centre, in build order.
    markXs: () => markButtons().map((mark) => centreOf(mark).x),
    // How many builds are drawn measured, as the selected point, or hollow
    // for no timing.
    builds: () => ({
      measured: within(parts.measured).length,
      selected: within(parts.selected).length,
      unavailable: within(parts.unavailable).length,
    }),
    // The selected build's drawn outline.
    selectedShape: () => within(parts.selected)[0]?.getAttribute("d"),
    // How the prior average's line is dashed.
    averageDashes: () =>
      lookOf(within(".history-chart-reference line")[0]).strokeDasharray,
    // The line's strokes; each "M" starts a stroke not joined to the last.
    line: () =>
      within(".history-chart-line")[0]?.getAttribute("d") ?? undefined,
    // Each drawn part's title: a mark's date, timing, unit and build role.
    titles: () => within("title").map((node) => node.textContent),
    readout: () => {
      const node = readoutElement();
      return node === null ? "" : visibleText(node);
    },
    axisLabels: () => axisLabelNodes().map(visibleText),
    // The duration axis labels lying wholly inside the chart's drawing.
    axisLabelsInside: () => {
      const bounds = drawing()?.getBoundingClientRect();
      return axisLabelNodes().filter((label) => {
        const { left, right } = label.getBoundingClientRect();
        return (
          bounds !== undefined && left >= bounds.left && right <= bounds.right
        );
      }).length;
    },
    // The build dates written along the chart's foot.
    dateLabels: () =>
      within(":scope > text")
        .map(visibleText)
        .filter((words) => /^[A-Z][a-z]{2} \d{1,2}$/.test(words)),
    // Where the duration axis's lowest line lies.
    floorY: () => yOf(within(".history-chart-grid")[0]),
    averageLabel: () =>
      within(".history-chart-reference title").map((n) => n.textContent),
    averageY: () => yOf(within(".history-chart-reference line")[0]),
    markY: (readout: string) => yOf(markNamed(readout)),
    // A drawn PART lies under the mark naming READOUT, centred on it.
    drawnUnder: (readout: string, part: Part) => {
      const mark = markNamed(readout);
      if (mark === undefined) return false;
      const b = centreOf(mark);
      return within(parts[part]).some((shape) => {
        const a = centreOf(shape);
        return Math.abs(a.x - b.x) < 1.5 && Math.abs(a.y - b.y) < 1.5;
      });
    },
    // In the current appearance: the failed × in the failure colour, the
    // mark for no timing hollow on the chart's surface, each kind of mark
    // read against the surface, and the readout read as text.
    painting: () => {
      const chart = box();
      if (chart === null) throw new Error("Chart not drawn");
      const surface = getComputedStyle(chart).backgroundColor;
      const failed = lookOf(within(parts.failed)[0]);
      const hollow = lookOf(within(parts.unavailable)[0]);
      const contrast = (node: Element | undefined) => {
        const look = lookOf(node);
        return paintContrast(node as Element, [look.stroke, look.fill]);
      };
      const readout = readoutElement();
      return {
        failedInProblemColour:
          failed.stroke === tokenColour(chart, "--problem") &&
          failed.fill === "none",
        hollowOnSurface:
          hollow.fill === surface &&
          hollow.stroke !== surface &&
          hollow.stroke !== lookOf(within(parts.measured)[0]).fill,
        marksRead: Object.values(parts).every(
          (selector) => contrast(within(selector)[0]) >= 3,
        ),
        readoutRead:
          readout !== null &&
          paintContrast(readout, [getComputedStyle(readout).color]) >= 4.5,
      };
    },
    // The focused mark's outline: shown for the keyboard, at least 2 px,
    // read against the chart's surface.
    focusPainted: () => {
      const mark = document.activeElement;
      if (mark === null || !markButtons().includes(mark as HTMLButtonElement))
        return false;
      const look = getComputedStyle(mark);
      return (
        mark.matches(":focus-visible") &&
        look.outlineStyle !== "none" &&
        parseFloat(look.outlineWidth) >= 2 &&
        paintContrast(mark, [look.outlineColor]) >= 3
      );
    },
    // The mark naming READOUT, for pointer or keyboard.
    mark: markFor,
    // The name of the mark that has focus.
    focusedMark: () =>
      markButtons()
        .find((mark) => mark === document.activeElement)
        ?.getAttribute("aria-label"),
    // Taps the mark naming READOUT; the chart's readout then names it.
    async tapMark(readout: string) {
      const mark = markFor(readout);
      mark.scrollIntoView({ block: "center" });
      await tapWhereShown(mark);
    },
    readoutElement,
  };
}
