// Story Branch Landed when the landed revision's own CI gives no verdict
// (`lookupResultBuild` with `exactOnly`, `./baseCiRevisionLookup.ts`): a
// cancelled landing takes the nearest later trunk build with usable proof
// (`./laterTrunkBuild.ts`), and a confirmed skip its equivalent build
// (`./exactSkippedEquivalent.ts`); a timed-out landing, with the caller's
// explanation, or a CI adapter's attempt that stopped without a verdict,
// with its status's, is a gap naming that attempt as the build it could not
// use (`landedRunOf`, `./unusableBuild.ts`); otherwise the landed revision's
// own status explains the gap.
import { newestRunFor } from "./baseCiNearest.ts";
import type { ComparisonBuildSource } from "./comparisonBuildSource.ts";
import {
  baselineAncestorLimit,
  exactSkippedEquivalentSlot,
  type ExactResultLookup,
} from "./exactSkippedEquivalent.ts";
import {
  laterTrunkCancelledSlot,
  type RevisionProofAbsence,
} from "./laterTrunkBuild.ts";
import { requestedRevisionCiStatus } from "./requestedRevisionCiStatus.ts";
import {
  asSlot,
  nearestAncestorBasisSha,
  type RevisionBuildSlot,
} from "./revisionBuildSlot.ts";
import { landedRunOf } from "./unusableBuild.ts";

// Landed's slot for `target`, whose own CI gave no verdict; `proofAbsence`
// tells why a later trunk build's proof cannot be used.
export async function landedWithoutVerdictSlot(
  target: string,
  source: ComparisonBuildSource,
  exact: ExactResultLookup,
  proofAbsence: RevisionProofAbsence,
): Promise<RevisionBuildSlot> {
  const listed = await source.lookup.listRunsAt(target);
  const newest = newestRunFor(listed, target);
  if (
    newest?.status === "completed" &&
    newest.adapterAttempt === undefined &&
    (newest.conclusion === "cancelled" || newest.conclusion === "timed_out")
  ) {
    if (newest.conclusion === "cancelled")
      return laterTrunkCancelledSlot(
        target,
        listed,
        source,
        exact,
        proofAbsence,
      );
    return {
      kind: "none",
      explanation: exact.timedOutExplanation,
      cancelled: true,
      unusableBuild: landedRunOf(target, newest),
    };
  }
  const status = await requestedRevisionCiStatus(
    target,
    listed,
    await nearestAncestorBasisSha(target, source, baselineAncestorLimit),
    source.history,
    source.workflow,
  );
  if (status.kind === "skipped")
    return exactSkippedEquivalentSlot(target, source, status);
  // A CI adapter's own attempt that stopped without a verdict.
  const stopped =
    status.kind === "cancelled"
      ? newestRunFor(listed, target, true)
      : undefined;
  if (stopped !== undefined)
    return {
      kind: "none",
      explanation: status.explanation,
      requestedStatus: status,
      unusableBuild: landedRunOf(target, stopped),
    };
  return asSlot(undefined, status.explanation, status);
}
