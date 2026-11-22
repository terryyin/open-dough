// One story's CI timing comparison as the reader sees it
// (../../src/IntentCiComparisonContent.tsx), mounted from a typed compared
// story with each endpoint's proof made by the production comparison owner.
import { createElement } from "react";
import { expect } from "vitest";
import { page, type Locator } from "vitest/browser";
import { IntentCiComparisonContent } from "../../src/IntentCiComparisonContent.tsx";
import { useCiProofSorting } from "../../src/CiProofTable.tsx";
import { comparisonProofOf } from "../../src/storyCiComparisonEntries.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import type { ComparedStory } from "../../../Distribution/tests/support/comparedStoryTestData.mjs";

// The comparison with the production in-memory sort choice
// (../../src/IntentCiComparison.tsx), unsorted until a header is activated.
function SortableComparison(
  props: Omit<Parameters<typeof IntentCiComparisonContent>[0], "sorting">,
) {
  return createElement(IntentCiComparisonContent, {
    ...props,
    sorting: useCiProofSorting(),
  });
}

function comparisonOf(story: ComparedStory) {
  const { answer, proofs } = story;
  const endpointProofs =
    proofs === undefined
      ? undefined
      : {
          baseline: comparisonProofOf(answer.baseline, proofs[0], false),
          branch: comparisonProofOf(
            answer.provisional ?? answer.branch,
            proofs[1],
            false,
          ),
          landed: comparisonProofOf(answer.landed, proofs[2], false),
        };
  return createElement(SortableComparison, {
    answer,
    proofs: endpointProofs,
    preference: { showPercent: false, onShowPercent() {} },
    checkAgainButton: null,
  });
}

export const visibleText = (node: Element) =>
  node.textContent
    .replace(/[\u200b\u00ad]/g, "")
    .trim()
    .replace(/\s+/g, " ");

// The count and duration cues NODE carries.
export const cueOf = (node: Element) => ({
  count: node.getAttribute("data-ci-count-cue"),
  countReason: node.getAttribute("data-ci-count-cue-reason"),
  duration: node.getAttribute("data-ci-duration-cue"),
  durationReason: node.getAttribute("data-ci-duration-cue-reason"),
});

// The body rows of TABLE.
export const bodyRowsOf = (table: Locator) => [
  ...table.element().querySelectorAll("tbody tr"),
];

// Each body row of TABLE: its header, then its cells.
export const rowTextsOf = (table: Locator) =>
  bodyRowsOf(table).map((row) => [...row.children].map(visibleText));

// The visible words of each element SELECTOR finds in REGION.
export const textsIn = (region: Locator) => (selector: string) =>
  [...region.element().querySelectorAll(selector)].map(visibleText);

// FIGURE's words, its relative mark's measured layout (null when it draws
// none) and any shown percentage: the bar's direction, its reach as a fraction
// of one side, and how far its zero tick and the bar's zero edge sit from the
// mark's centre, with the mark's and bar's widths, in pixels.
export function relativeOf(figure: Element) {
  const mark = figure.querySelector(".intent-ci-time-mark");
  const zero = mark?.querySelector(".intent-ci-time-zero");
  const bar = mark?.querySelector(".intent-ci-time-bar");
  const percentages = [
    ...figure.querySelectorAll(".intent-ci-time-percent"),
  ].map(visibleText);
  if (mark === null || !zero || !bar)
    return { words: visibleText(figure), mark: null, percentages };
  const box = mark.getBoundingClientRect();
  const centre = box.left + box.width / 2;
  const zeroBox = zero.getBoundingClientRect();
  const barBox = bar.getBoundingClientRect();
  const direction = mark.getAttribute("data-direction");
  return {
    words: visibleText(figure),
    percentages,
    mark: {
      direction,
      reach: barBox.width / (box.width / 2),
      zeroOffset: zeroBox.left + zeroBox.width / 2 - centre,
      barStartOffset:
        direction === "faster" ? barBox.right - centre : barBox.left - centre,
      markWidth: box.width,
      barWidth: barBox.width,
    },
  };
}

// Which endpoints a shown comparison compares, and why it fell back.
export function activeComparisonIn(region: Locator) {
  const texts = textsIn(region);
  return {
    activeComparison: () => texts(".intent-ci-comparison-active"),
    fallbackReason: () => texts(".intent-ci-comparison-active-reason"),
  };
}

export async function mountComparison(story: ComparedStory) {
  const mounted = await mountComponent(comparisonOf(story));
  const comparison = await shownComparison();
  return {
    ...comparison,
    showsStory(next: ComparedStory) {
      mounted.rerender(comparisonOf(next));
    },
  };
}

// The visible comparison region's readings, however it was mounted.
export async function shownComparison() {
  const region = page.getByRole("region", {
    name: "CI timing comparison",
    exact: true,
  });
  await expect.element(region).toBeVisible();
  const all = (selector: string) => [
    ...region.element().querySelectorAll(selector),
  ];
  const texts = textsIn(region);
  const entryTable = region.getByRole("table", {
    name: "CI entry timing comparison",
  });
  const cues = (selector: string) => all(selector).map(cueOf);

  const comparison = {
    region,
    entryTable,
    // Each endpoint's Build cell: its words and any source icon's selection
    // and hover title.
    identities: () =>
      all(".intent-ci-comparison-identity").map((identity) => ({
        text: visibleText(identity),
        sources: [
          ...identity.querySelectorAll(".intent-ci-comparison-source"),
        ].map((source) => ({
          selection: source.getAttribute("data-selection"),
          title: source.getAttribute("title"),
          visible: source.checkVisibility(),
        })),
      })),
    wallTimes: () => texts(".intent-ci-comparison-wall"),
    timesWithoutWaits: () => texts(".intent-ci-comparison-without-waits"),
    // Each endpoint's time without runner waits, read relatively.
    timesWithoutWaitsRelative: () =>
      all(".intent-ci-comparison-without-waits").map(relativeOf),
    ...activeComparisonIn(region),
    overallCounts: () => texts(".intent-ci-comparison-overall-counts"),
    overallCountsCues: () => cues(".intent-ci-comparison-overall-counts"),
    overallTiming: () => texts(".intent-ci-comparison-overall-timing"),
    overallTimingCues: () => cues(".intent-ci-comparison-overall-timing"),
    overallWallTime: () => texts(".intent-ci-comparison-overall-wall"),
    metricNames: () => texts(".intent-ci-comparison-metrics dt"),
    entryEvidence: () => texts(".intent-ci-comparison-entries").join(" "),
    // Each entry row's header and cells, in column order.
    entryRows: () => rowTextsOf(entryTable),
    // ROW's figure in COLUMN (1 Counts … 4 Landed), read relatively.
    relative: (row: string, column: number) => {
      const shown = bodyRowsOf(entryTable).find(
        (tr) => visibleText(tr.children[0] as Element) === row,
      );
      if (shown === undefined) throw new Error(`No entry row ${row}.`);
      return relativeOf(shown.children[column] as Element);
    },
    overallRelative: () =>
      relativeOf(all(".intent-ci-comparison-overall-wall")[0] as Element),
    percentages: () => texts(".intent-ci-time-percent"),
    showPercent: region.getByRole("checkbox", { name: "Show %", exact: true }),
    // Each entry row's count and duration cues.
    entryRowCues: () => bodyRowsOf(entryTable).map(cueOf),
    headings: () =>
      region
        .getByRole("heading")
        .elements()
        .map((heading) => visibleText(heading)),
    text: () => visibleText(region.element()),
  };
  return comparison;
}
