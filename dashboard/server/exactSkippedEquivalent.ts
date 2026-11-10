// Story Branch Landed confirmed-skip path: use only the nearest first-parent
// ancestor build (the equivalent build). When that build publishes a usable
// proof summary, Landed reuses it; when it passed with valid start and
// completion but published no proof summary (as a CI adapter's attempt never
// does), Landed still reuses its wall time while proof stays a separate gap.
// Never walk past that one equivalent to a farther ancestor. Baseline /
// Branch proof walks stay in `./baseCiRevisionLookup.ts`.
import { equivalentBuildUnavailableLine } from "../src/ciProofAbsenceWording.ts";
import type { CiProof } from "../src/ciProof.ts";
import { historyWallTimeMs } from "../src/landedCiHistory.ts";
import type { RequestedRevisionCiStatus } from "../src/storyCiComparison.ts";
import { proofRunOf, type RevisionCiLookup } from "./baseCiRevisionNearest.ts";
import { isUnansweredProof, readCiProofArtifact } from "./ciProofArtifact.ts";
import type { GitCall } from "./gitRunner.ts";
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
  // Repository and signal for reading the equivalent build's proof when a
  // confirmed skip lets Landed use that one ancestor build only.
  readonly repository: string;
  readonly signal: AbortSignal;
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
  repository: string,
  signal: AbortSignal,
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
    repository,
    signal,
  };
}

// When Landed confirms a skip at `target`, use only the nearest first-parent
// ancestor build (the equivalent build). A usable proof summary stands for
// the landing; a timed successful attempt with no proof summary still
// supplies wall time. Other proof absences, and unanswered GitHub proof
// reads, keep naming that build and why (`unusableProofOf`). Never walk
// past that one equivalent.
export async function exactSkippedEquivalentSlot(
  target: string,
  lookup: RevisionCiLookup,
  call: GitCall,
  exact: ExactResultLookup,
  status: RequestedRevisionCiStatus,
): Promise<RevisionBuildSlot> {
  const equivalent = await nearestAncestorBuild(
    target,
    lookup,
    call,
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
      : await readCiProofArtifact(exact.repository, run, exact.signal);
  const measured = {
    ...equivalent,
    selection: "equivalent" as const,
    laterWithoutResult: 1,
  };
  if (proof.kind === "summary") {
    return asSlot(measured, status.explanation, status);
  }
  // Settled "no proof summary" on a timed pass: reuse wall time. Unanswered
  // reads stay pending; expired / unreadable / other absences stay gaps.
  if (
    equivalent.state === "pass" &&
    historyWallTimeMs(equivalent.startedAt, equivalent.completedAt) !==
      undefined &&
    proof.reason === "none" &&
    !isUnansweredProof(proof)
  ) {
    return asSlot(measured, status.explanation, status);
  }
  return {
    kind: "none",
    explanation: unavailableWords(equivalent.revision, proof),
    requestedStatus: status,
    ...unusableProofOf(equivalent, "equivalent", proof),
  };
}
