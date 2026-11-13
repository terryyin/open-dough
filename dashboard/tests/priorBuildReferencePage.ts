// The prior-build reference as a reader meets it: the compact readout every
// timing history shares (../src/IntentCiPriorBuildReference.tsx), a Done CI
// comparison's wall-time history around it
// (../src/IntentCiDoneWallTimeReference.tsx), and membership in
// PriorBuildReferenceEvidenceList, kept by build, scope and follow-up
// readings. Expected dates, values, reasons and provenance stay with callers.
import type { Locator, Page } from "@playwright/test";
import { historyChart } from "./ciHistoryChartPage.ts";
import { expect } from "./dashboardTest.ts";
import { colourOf, tokenColour } from "./pageColours.ts";

export function priorBuildReferenceReading(scope: Locator) {
  const evidence = scope.getByRole("group", {
    name: "Prior-build reference evidence",
  });
  return {
    evidence,
    included: evidence.getByText(/✓ Included/),
    excluded: evidence.getByText(/× Excluded/),
    selected: evidence.getByText(/◆ Selected/),
  };
}

// The compact readout's lines in reading order: the selected timing or its
// status, the prior-build average with its count, and the signed change
// with its figure, shown only when both timings are usable.
export function compactReadout(scope: Locator) {
  const readout = scope.locator(".intent-ci-prior-reference");
  const change = readout.locator(".intent-ci-prior-change");
  return {
    readout,
    selected: readout.locator("p").nth(0),
    average: readout.locator("p").nth(1),
    change,
    changeFigure: change.locator("strong"),
  };
}

// The change figure is painted in the cue colour of its direction.
export async function expectChangeCue(
  page: Page,
  scope: Locator,
  direction: "faster" | "slower",
) {
  const figure = compactReadout(scope).changeFigure;
  await expect(figure).toBeVisible();
  expect(await colourOf(figure)).toBe(
    await tokenColour(page, `--ci-cue-${direction}`),
  );
}

// The next answer to a Done CI wall time history read.
export const doneHistoryRead = (page: Page) =>
  page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === "/__authenticated-read" &&
      url.searchParams.get("intent") === "ci-history" &&
      url.searchParams.has("revision") &&
      !url.searchParams.has("scope")
    );
  });

// A Done CI comparison's wall-time history within `panel`.
export function doneWallTimeHistory(panel: Locator) {
  const region = panel.getByRole("region", {
    name: "CI wall time history",
    exact: true,
  });
  return {
    region,
    status: region.locator(".intent-ci-history-status"),
    note: region.locator(".intent-ci-history-note"),
    refresh: region.getByRole("button", {
      name: "Refresh history",
      exact: true,
    }),
    retry: region.getByRole("button", { name: "Retry history", exact: true }),
    alert: region.getByRole("alert"),
    chart: historyChart(
      region,
      "CI wall time by build date; selected landing marked",
    ),
    ...compactReadout(region),
  };
}
