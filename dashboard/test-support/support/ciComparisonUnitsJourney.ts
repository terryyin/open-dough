// MakeMe arrangement for mixed-unit comparison journeys: canonical entry,
// folder and file results. Browser observations live in the Summary and file
// Proof page owners.

import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";

export const entry = "dashboard/tests";
export const folder = `${entry}/folder`;
export const aSpec = `${folder}/a.spec.ts`;
const rootSpec = `${entry}/root.spec.ts`;

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
