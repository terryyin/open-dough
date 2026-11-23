import { expect } from "vitest";
import { page, type Locator } from "vitest/browser";
import { cueOf } from "./intent-ci-comparison-page.ts";
import { comparisonIn } from "./intent-ci-scope-page.tsx";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  evidenceLabels,
  labelsHeardAs,
} from "./intent-summary-evidence-page.ts";
import {
  expectOwnScopeFigures,
  expectProofTableRows,
  showsSummaryPath,
  scopeFigures,
  scopeTable,
} from "./intent-summary-proof-page.ts";

type ComparisonRow = readonly [
  name: string,
  change: string,
  counts: string,
  baseline: string,
  branch: string,
  landed: string,
];

type ComparisonRows = readonly [
  own: readonly [...ComparisonRow, parts: string],
  ...children: ComparisonRow[],
];

const figureLabels = ["Counts", "Baseline", "Branch", "Landed", "Parts"];
const tableHeadings = [
  "Scope",
  "Change",
  "Counts",
  "Baseline",
  "Branch vs baseline",
  "Landed vs baseline",
];

export async function expectComparisonRows(
  summary: Locator,
  [[path, , ...figures], ...rows]: ComparisonRows,
) {
  await expectOwnScopeFigures(summary, path, figures, figureLabels);
  await expectProofTableRows(scopeTable(summary, path), tableHeadings, rows);
}

export type ExpectedCues = Partial<
  Record<keyof ReturnType<typeof cueOf>, string>
>;

export async function expectComparisonCues(
  summary: Locator,
  path: string,
  [own, ...rows]: readonly [ExpectedCues, ...ExpectedCues[]],
) {
  const table = scopeTable(summary, path);
  await expect
    .poll(() => {
      const group = scopeFigures(summary, path).query();
      if (group === null) return [];
      return [
        cueOf(group),
        ...[...(table.query()?.querySelectorAll("tbody tr") ?? [])].map(cueOf),
      ];
    })
    .toMatchObject([own, ...rows]);
}

export const comparisonLabels = (region: Locator, story: string) =>
  evidenceLabels(region, `CI timing comparison of ${story}`);

export async function expectObservedBuildFraming(region: Locator) {
  const comparison = comparisonIn(region);
  await expect
    .poll(() => comparison.framing()[0])
    .toBe("Observed builds; differences are not attributed to the story");
}

export async function expectNoComparisonFraming(region: Locator) {
  const comparison = comparisonIn(region);
  await expect.poll(comparison.frames).toEqual([]);
  await expect
    .poll(() => labelsHeardAs(region, "Observed, not attributed"))
    .toEqual([]);
}

export async function expectFallback(
  region: Locator,
  endpoint: "Branch" | "Provisional",
  reason: string,
  { partial = false } = {},
) {
  await expect
    .element(
      region.getByRole("heading", {
        name: `Baseline compared with ${endpoint}`,
        exact: true,
      }),
    )
    .toBeVisible();
  const comparison = comparisonIn(region);
  const readReason = expect.poll(() => comparison.fallbackReason()[0]);
  if (partial) await readReason.toContain(reason);
  else await readReason.toBe(reason);
}

export async function openComparedFolder(summary: Locator, path: string) {
  await comparisonIn(summary).open(`${path.split("/").at(-1)}/`);
  await showsSummaryPath(summary, path);
}

export async function openComparedFileProof(summary: Locator, name: string) {
  await comparisonIn(summary).open(name);
  await intentStoryCompare().chooseProof();
  return page.getByRole("region", { name: "Proof", exact: true });
}

export const fileProofTable = (proof: Locator, path: string) =>
  proof.getByRole("table", { name: `CI proof of ${path}`, exact: true });

export function expectNoFileTimingMarks(proof: Locator) {
  expect(proof.element().querySelectorAll(".intent-ci-time-mark")).toHaveLength(
    0,
  );
}

export type FileComparisonRow = readonly [
  pathAndChange: string,
  counts: string,
  baseline: string,
  branch: string,
  landed: string,
];

export function expectFileComparisonRow(
  proof: Locator,
  path: string,
  row: FileComparisonRow,
) {
  return expectProofTableRows(
    fileProofTable(proof, path),
    ["Scope", ...tableHeadings.slice(2)],
    [row],
  );
}
