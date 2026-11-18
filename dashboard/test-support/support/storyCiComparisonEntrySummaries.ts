// Proof summaries of MakeMe-built entries (`makeMe.aCiProofEntry`) for
// Intent's story CI comparison journeys (./storyCiComparisonEntryProofs.ts):
// the summary the collector writes from each entry's results in each unit,
// each unit declared and its parts and file breakdown kept, served for
// Baseline, Branch and Landed.

import type { CiProofEntry } from "../../src/ciProof.ts";
import { proofSummaryForEntries } from "./ciProofArtifacts.ts";
import {
  proofRun,
  type ComparisonProofServe,
} from "./storyCiComparisonEntryProofs.ts";

// Baseline, branch and landed summaries (runs 101–103) of the given entries.
export function entryProofs(
  revisions: {
    readonly baseline: string;
    readonly branchSide: string;
    readonly completion: string;
  },
  entries: {
    readonly baseline: readonly CiProofEntry[];
    readonly branch: readonly CiProofEntry[];
    readonly landed: readonly CiProofEntry[];
  },
): Record<number, ComparisonProofServe> {
  const served = (
    runId: number,
    revision: string,
    at: readonly CiProofEntry[],
  ) =>
    ({
      kind: "summary",
      artifactId: runId + 900,
      summary: proofSummaryForEntries(proofRun(runId, revision), at),
    }) as const;
  return {
    101: served(101, revisions.baseline, entries.baseline),
    102: served(102, revisions.branchSide, entries.branch),
    103: served(103, revisions.completion, entries.landed),
  };
}
