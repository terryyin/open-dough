// MakeMe arrangement for mixed-unit comparison journeys: canonical entry,
// folder and file results, plus the published Done story serving each build.
// Browser observations live in the Summary and file Proof page owners.

import type { Page } from "@playwright/test";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { publishSummaryComparisonStory } from "./intentSummaryStoryComparisonFixture.ts";
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
