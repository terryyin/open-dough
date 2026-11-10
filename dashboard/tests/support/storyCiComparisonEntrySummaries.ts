// Proof summaries of MakeMe-built entries (`makeMe.aCiProofEntry`) for
// Intent's story CI comparison journeys (./storyCiComparisonEntryProofs.ts):
// the summary the collector writes from each entry's results in each unit,
// each unit declared and its parts and file breakdown kept, served for
// Baseline, Branch and Landed.

import type { CiProofEntry } from "../../src/ciProof.ts";
import {
  counts,
  proofSummary,
  type ProofDeclaration,
  type ProofPart,
  type ProofRun,
  type ProofUnit,
} from "./ciProofArtifacts.ts";
import {
  proofRun,
  type ComparisonProofServe,
} from "./storyCiComparisonEntryProofs.ts";

// The summary the collector writes for RUN from the parts of ENTRIES'
// results in each unit, each declared in its unit.
function entriesProofSummary(
  run: ProofRun,
  entries: readonly CiProofEntry[],
): unknown {
  const results = entries.flatMap((entry) =>
    entry.evidence.map((evidence) => ({ path: entry.path, evidence })),
  );
  return proofSummary(
    run,
    results.map(({ path, evidence }): ProofDeclaration =>
      evidence.unit === "legacy"
        ? [path, evidence.parts.length]
        : [path, evidence.parts.length, evidence.unit],
    ),
    results.flatMap(({ path, evidence }) => {
      // MakeMe's first broken-down present part owns its files/unassigned
      // figures; later broken-down parts are present empty observations.
      const firstBrokenDown = evidence.parts.find(
        (part) => part.status === "present" && part.breakdown === true,
      );
      return evidence.parts.flatMap((part): ProofPart[] => {
        if (part.status === "missing") return [];
        const figures = counts(
          part.passed ?? 0,
          part.failed ?? 0,
          part.other ?? 0,
        );
        const unit: ProofUnit =
          evidence.unit === "legacy"
            ? { legacy: evidence.label ?? "results" }
            : evidence.unit;
        const of = evidence.parts.length;
        if (part.status === "ambiguous") {
          // Two candidates cause the real producer to retain an ambiguous
          // part, whose figures are deliberately not counted.
          const candidate: ProofPart = [path, part.part, of, unit, figures];
          return [candidate, candidate];
        }
        if (part.breakdown === true && evidence.files !== undefined) {
          const breakdown = {
            files: part === firstBrokenDown ? evidence.files : [],
            untimed: part.untimed ?? 0,
            ...(part === firstBrokenDown && evidence.unassigned !== undefined
              ? { unassigned: evidence.unassigned }
              : {}),
          };
          return [
            [path, part.part, of, unit, figures, part.durationMs, breakdown],
          ];
        }
        return [
          part.durationMs === undefined
            ? [path, part.part, of, unit, figures]
            : [path, part.part, of, unit, figures, part.durationMs],
        ];
      });
    }),
  );
}

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
      summary: entriesProofSummary(proofRun(runId, revision), at),
    }) as const;
  return {
    101: served(101, revisions.baseline, entries.baseline),
    102: served(102, revisions.branchSide, entries.branch),
    103: served(103, revisions.completion, entries.landed),
  };
}
