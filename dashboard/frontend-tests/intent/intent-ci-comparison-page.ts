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
