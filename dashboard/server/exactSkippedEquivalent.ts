// Story Branch Landed confirmed-skip path: use only the nearest first-parent
// ancestor build's proof (the equivalent build), read through
// `./ciProofArtifact.ts`. Never walk past a build without usable proof.
// Baseline / Branch proof walks stay in `./baseCiRevisionLookup.ts`.
import { equivalentBuildUnavailableLine } from "../src/ciProofAbsenceWording.ts";
import type { CiProof } from "../src/ciProof.ts";
import type { RequestedRevisionCiStatus } from "../src/storyCiComparison.ts";
import { proofRunOf } from "./baseCiRevisionNearest.ts";
import type { ComparisonBuildSource } from "./comparisonBuildSource.ts";
import {
  asSlot,
  nearestAncestorBuild,
  type RevisionBuildSlot,
} from "./revisionBuildSlot.ts";
import { unusableProofOf } from "./unusableBuild.ts";

// How far a baseline walk may go beyond the story start when looking for a
// completed trunk build (claim commits are almost never built). Shared with
// `./baseCiRevisionLookup.ts` so Landed's equivalent search uses the same
// first-parent bound.
export const baselineAncestorLimit = 30;

export type ExactResultLookup = {
  readonly exactOnly: true;
  // Caller-owned wording when the only attempt at `target` is cancelled or
  // timed out (for example Story Branch Landed at the landing merge).
  readonly cancelledExplanation: string;
  readonly timedOutExplanation: string;
  // Trunk head the comparison read (for example `origin/main`): a cancelled
  // landing may use the nearest later trunk build's proof up to it.
  readonly laterTrunkHead: string;
};

function unavailableWords(
  revision: string,
  proof: Extract<CiProof, { kind: "unavailable" }>,
): string {
  return equivalentBuildUnavailableLine(revision, proof);
}

// Story Branch Mode Landed: exact-only options at the merge or fast-forward tip.
export function storyBranchLandedExactLookup(
  fastForward: boolean,
  laterTrunkHead: string,
): ExactResultLookup {
  return {
    laterTrunkHead,
    exactOnly: true,
    cancelledExplanation: fastForward
      ? "The CI build at the landed story revision was cancelled."
      : "The CI build at the landing merge was cancelled.",
    timedOutExplanation: fastForward
      ? "The CI build at the landed story revision timed out."
      : "The CI build at the landing merge timed out.",
  };
}

// When Landed confirms a skip at `target`, use only the nearest first-parent
// ancestor build's proof (the equivalent build), which a build without a
// GitHub Actions run, such as a CI adapter's, never published. Never walk
// past a build without usable proof; a gap for one names that build and why
// its proof is unusable (`unusableProofOf`).
export async function exactSkippedEquivalentSlot(
  target: string,
  source: ComparisonBuildSource,
  status: RequestedRevisionCiStatus,
): Promise<RevisionBuildSlot> {
  const equivalent = await nearestAncestorBuild(
    target,
    source,
    baselineAncestorLimit,
  );
  if (
    equivalent === undefined ||
    (equivalent.state !== "pass" && equivalent.state !== "failed")
  ) {
    return asSlot(undefined, status.explanation, status);
  }
  const run = proofRunOf(equivalent);
  const proof: CiProof =
    run === undefined
      ? { kind: "unavailable", reason: "none" }
      : await source.proofOf(run);
  if (proof.kind === "summary") {
    return asSlot(
      {
        ...equivalent,
        selection: "equivalent",
        laterWithoutResult: 1,
      },
      status.explanation,
      status,
    );
  }
  return {
    kind: "none",
    explanation: unavailableWords(equivalent.revision, proof),
    requestedStatus: status,
    ...unusableProofOf(equivalent, "equivalent", proof),
  };
}
