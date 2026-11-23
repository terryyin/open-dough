// MakeMe arrangement for mixed-unit comparison journeys: canonical entry,
// folder and file results. Browser observations live in the Summary and file
// Proof page owners.

import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";

export const entry = "dashboard/tests";
export const folder = `${entry}/folder`;
export const aSpec = `${folder}/a.spec.ts`;
const rootSpec = `${entry}/root.spec.ts`;

// dashboard/tests: a.spec.ts's results and root.spec.ts's, each broken down
// by file and timed, beside a.spec.ts's own test file
// outcome when FILE_MS is given.
export function dashboardTests(
  unit: "case" | "file",
  aCount: number,
  aMs: number,
  fileMs?: number,
) {
  return makeMe.aCiProofEntry
    .at(entry)
    .holding(
      makeMe.aCiProofEvidence
        .inUnit(unit)
        .brokenDown(
          { path: aSpec, passed: aCount, durationMs: aMs },
          {
            path: rootSpec,
            passed: unit === "case" ? 2 : 1,
            durationMs: 10_000,
          },
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
