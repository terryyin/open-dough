// MakeMe proofs, arrangement and expectations for the units comparison
// journeys (../intent/intent-ci-comparison-units.spec.ts): the dashboard/tests
// entry's test cases (or legacy results) and test file outcome per build, the
// published done story serving them, a Summary table's rows of one child, a
// scope's own figures for one unit, and a changed file's Proof rows.

import type { Locator, Page } from "@playwright/test";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect } from "./preparationPage.ts";
import { fileReadingTab, proofRegion } from "../intentPerspectivePage.ts";
import { scopeTable } from "../intentScopeProofPage.ts";
import {
  publishSummaryComparisonStory,
  summaryComparisonChanges,
} from "./intentSummaryStoryComparisonFixture.ts";
import { intentFile } from "./intentStoryPage.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { entryProofs } from "./storyCiComparisonEntrySummaries.ts";

export const entry = "dashboard/tests";
export const folder = `${entry}/folder`;
export const aSpec = `${folder}/a.spec.ts`;
const rootSpec = `${entry}/root.spec.ts`;

// The done Summary comparison story, its Baseline, Branch and Landed builds
// serving BUILDS' entries.
export async function publishUnitsComparison(
  page: Page,
  origin: StartOrigin,
  builds: Parameters<typeof entryProofs>[1],
) {
  const setup = await publishSummaryComparisonStory(page, origin);
  setup.serveProofs(entryProofs(setup, builds));
}

// dashboard/tests: a.spec.ts's test cases (or legacy results) and root.spec.ts's
// two, each broken down by file and timed, beside a.spec.ts's own test file
// outcome when FILE_MS is given.
export function dashboardTests(
  unit: { readonly cases: true } | { readonly legacy: string },
  aCount: number,
  aMs: number,
  fileMs?: number,
) {
  const results =
    "legacy" in unit
      ? makeMe.aCiProofEvidence.legacy(unit.legacy)
      : makeMe.aCiProofEvidence.inUnit("case");
  return makeMe.aCiProofEntry
    .at(entry)
    .holding(
      results
        .brokenDown(
          { path: aSpec, passed: aCount, durationMs: aMs },
          { path: rootSpec, passed: 2, durationMs: 10_000 },
        )
        .please(),
      ...(fileMs === undefined
        ? []
        : [
            makeMe.aCiProofEvidence
              .inUnit("file")
              .brokenDown({ path: aSpec, passed: 1, durationMs: fileMs })
              .please(),
          ]),
    )
    .please();
}

// The Summary rows of PATH's table named NAME read ROWS: Change then cells.
export async function expectNamedRows(
  summary: Locator,
  path: string,
  name: string,
  rows: readonly (readonly string[])[],
) {
  const named = scopeTable(summary, path)
    .locator("tbody tr")
    .filter({
      has: summary.page().getByRole("rowheader", { name, exact: true }),
    });
  await expect(named).toHaveCount(rows.length);
  for (const [at, cells] of rows.entries()) {
    await expect(named.nth(at).getByRole("cell")).toHaveText([...cells]);
  }
}

// The own figures group NAME (`CI proof of <path>: <unit>`) reads FIGURES,
// Parts last.
export async function expectOwnFigures(
  summary: Locator,
  name: string,
  figures: readonly string[],
) {
  await expect(
    summary.getByRole("group", { name, exact: true }).getByRole("definition"),
  ).toHaveText([...figures]);
}

// The story-modified FILE's Proof reads ROWS, each after its path and change.
export async function expectFileProofRows(
  intent: Locator,
  file: string,
  rows: readonly (readonly string[])[],
) {
  await intentFile(intent, summaryComparisonChanges.modified).click();
  await fileReadingTab(intent, "Proof").click();
  const body = proofRegion(intent)
    .getByRole("table", { name: `CI proof of ${file}`, exact: true })
    .locator("tbody")
    .getByRole("row");
  await expect(body).toHaveCount(rows.length);
  for (const [at, cells] of rows.entries()) {
    await expect(body.nth(at).getByRole("rowheader")).toHaveText(
      `${file} modified`,
    );
    await expect(body.nth(at).getByRole("cell")).toHaveText([...cells]);
  }
}
