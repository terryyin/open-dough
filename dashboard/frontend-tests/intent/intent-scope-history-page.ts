// A selected scope's test execution time history
// (../../src/IntentScopeTimingHistory.tsx) as a reader meets it in a Summary
// or a file's Proof: the compact readout's lines and change cue, the Test
// cases / Test file choice, the chosen unit's chart, and where the history
// stands against the part after it; and the drill from a location's Summary
// through its folders into a file's Proof that reaches each scope.
import { expect } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { paintContrast } from "../configuration/system-settings-reading.ts";
import { tapWhereShown } from "../navigation/board-touch-page.ts";
import { visibleText } from "./intent-ci-comparison-page.ts";
import { priorReferenceIn } from "./intent-ci-prior-reference-page.ts";

const textsOf = (nodes: Iterable<Element>) => [...nodes].map(visibleText);

// The chart for UNIT ("test cases", "test files") through ENDPOINT. Its
// drawing is laid out only once its plot is measured, after the history's
// readout settles; it is drawn when its marks and readout are shown.
function chartIn(
  history: Locator,
  unit: string,
  endpoint: "selected landing" | "observed trunk endpoint",
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
    const { top, height } = node.getBoundingClientRect();
    return top + height / 2;
  };
  const markNamed = (readout: string) =>
    [...(box()?.querySelectorAll("button") ?? [])].find(
      (mark) => mark.getAttribute("aria-label") === readout,
    );
  const readoutElement = () =>
    box()?.querySelector(".history-chart-readout") ?? null;
  return {
    drawn: () => readoutElement() !== null,
    marks: () => box()?.querySelectorAll("button").length ?? 0,
    readout: () => {
      const node = readoutElement();
      return node === null ? "" : visibleText(node);
    },
    axisLabels: () => textsOf(within("g:has(> .history-chart-grid) > text")),
    averageLabel: () =>
      within(".history-chart-reference title").map((n) => n.textContent),
    averageY: () => yOf(within(".history-chart-reference line")[0]),
    markY: (readout: string) => yOf(markNamed(readout)),
    // The failed build's × lies under the mark naming it.
    failedUnder: (readout: string) => {
      const [failed] = within(".history-chart-failed");
      const mark = markNamed(readout);
      if (failed === undefined || mark === undefined) return false;
      const a = failed.getBoundingClientRect();
      const b = mark.getBoundingClientRect();
      return Math.abs(a.left + a.width / 2 - (b.left + b.width / 2)) < 1.5;
    },
    // Taps the mark naming READOUT; the chart's readout then names it.
    async tapMark(readout: string) {
      const mark = markNamed(readout);
      if (mark === undefined) throw new Error(`No mark ${readout}`);
      mark.scrollIntoView({ block: "center" });
      await tapWhereShown(mark);
    },
    readoutElement,
  };
}

export function scopeHistoryIn(scope: Locator) {
  const history = scope.getByRole("region", {
    name: "Test execution time history",
    exact: true,
  });
  const reference = priorReferenceIn(history);
  const unit = (choice: string) =>
    history
      .getByRole("group", { name: "Timing unit", exact: true })
      .getByRole("button", { name: choice, exact: true });
  const readable = (node: Element | null | undefined) =>
    node !== null &&
    node !== undefined &&
    paintContrast(node, [getComputedStyle(node).color]) >= 4.5;
  return {
    region: history,
    shown: () => expect.element(history).toBeVisible(),
    readout: () => ({
      selected: reference.selected(),
      average: reference.average(),
      change: reference.change(),
    }),
    // Which cue colour paints the change figure.
    changeCue: reference.changeCue,
    measures: () =>
      textsOf(history.element().querySelectorAll(".intent-ci-history-note")),
    lists: () => history.element().querySelectorAll("ul, ol").length,
    evidence: () =>
      history
        .element()
        .querySelectorAll('[aria-label="Prior-build reference evidence"]')
        .length,
    text: () => visibleText(history.element()),
    // When the observed endpoint the history reads through was retrieved.
    endpointTime: () =>
      history.element().querySelector("time")?.getAttribute("datetime"),
    // When this history was last answered.
    answeredAt: () =>
      [...history.element().querySelectorAll("p")]
        .find((line) => line.textContent.startsWith("History read"))
        ?.querySelector("time")
        ?.getAttribute("datetime"),
    status: () =>
      history.element().querySelector(".intent-ci-history-status")?.textContent,
    failure: history.getByRole("alert"),
    retry: history.getByRole("button", { name: "Retry history", exact: true }),
    charts: () => history.element().querySelectorAll("[role=img]").length,
    // The title of the chart point UNIT draws through the observed endpoint.
    pointTitle: (unitName: string) =>
      history
        .element()
        .querySelector(
          `[aria-label^="Test execution time for ${unitName} "] path.history-chart-point title`,
        )?.textContent,
    unit,
    // Choose a unit by touch or keyboard focus and Enter; it is then pressed.
    async choose(choice: string, by: "touch" | "keyboard") {
      const button = unit(choice);
      if (by === "touch") await tapWhereShown(button.element());
      else {
        (button.element() as HTMLElement).focus();
        await userEvent.keyboard("{Enter}");
      }
      await expect.element(button).toHaveAttribute("aria-pressed", "true");
    },
    // The chart UNIT draws through ENDPOINT, once it is drawn.
    async chart(
      unitName: string,
      endpoint: "selected landing" | "observed trunk endpoint",
    ) {
      const chart = chartIn(history, unitName, endpoint);
      await expect.poll(chart.drawn).toBe(true);
      return chart;
    },
    // The unit choices, selected timing and chart readout read in contrast.
    readable: (choices: readonly string[], chartUnit: string) =>
      [
        ...choices.map((choice) => unit(choice).element()),
        history.element().querySelector(".intent-ci-prior-reference > p"),
        chartIn(history, chartUnit, "selected landing").readoutElement(),
      ].every(readable),
    // The history's bottom lies at or above NEXT's top.
    standsAbove: (next: Locator) => {
      const after = next.query();
      return (
        after !== null &&
        history.element().getBoundingClientRect().bottom <=
          after.getBoundingClientRect().top
      );
    },
    // No part of the history scrolls sideways.
    fitsWidth: () => {
      const node = history.element();
      return node.scrollWidth <= node.clientWidth;
    },
  };
}

const intent = () => page.getByRole("main", { name: "Intent", exact: true });
const summary = () =>
  intent().getByRole("region", { name: "Summary", exact: true });
const summaryPath = () =>
  summary().element().querySelector(".intent-summary-path")?.textContent;

// The Summary of the location at PATH, opened by its name.
export async function openScopeSummary(path: string) {
  const name = () =>
    document.querySelector(
      `button.intent-location-name[data-location-path="${path}"]`,
    );
  await expect.poll(name).not.toBeNull();
  await userEvent.click(page.elementLocator(name() as Element));
  await expect.poll(summaryPath).toBe(path);
  return summary();
}

// The Summary opens its immediate child NAME, at PATH when a folder.
export async function openScopeChild(name: string, path?: string) {
  const child = summary()
    .getByRole("table")
    .getByRole("rowheader")
    .getByRole("button", { name, exact: true })
    .first();
  await expect.element(child).toBeVisible();
  await userEvent.click(child);
  if (path !== undefined) await expect.poll(summaryPath).toBe(path);
}

// The open file's Proof, chosen by its tab.
export async function openFileProof() {
  const tab = intent()
    .getByRole("tablist", { name: "Purpose and Proof", exact: true })
    .getByRole("tab", { name: "Proof", exact: true });
  await expect.element(tab).toBeVisible();
  await userEvent.click(tab);
  return intent().getByRole("region", { name: "Proof", exact: true });
}
