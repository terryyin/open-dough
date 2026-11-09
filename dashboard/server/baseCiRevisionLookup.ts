// CI build lookup by revision for a story's comparison endpoints: walks
// first-parent ancestors through local Git and answers baseline / branch /
// landed slots. The live branch judgment (`./baseCiJudgment.ts`) keeps its
// branch listing rule unchanged. Each endpoint names the requested
// revision's own status beside the selected build. Story Branch Landed at a
// landed revision whose own CI gives no verdict may use a confirmed skip's
// equivalent build or, when cancelled, a later trunk build
// (`./landedWithoutVerdict.ts`); Baseline / Branch (and Trunk Mode Landed /
// provisional tip) walk past builds without usable proof here.
// The lookup itself comes from `./baseCiRevisionLookupSource.ts`.
import {
  nearestRevisionBuild,
  proofRunOf,
  type RevisionProofUsable,
} from "./baseCiRevisionNearest.ts";
import {
  baselineAncestorLimit,
  type ExactResultLookup,
} from "./exactSkippedEquivalent.ts";
import type { ComparisonBuildSource } from "./comparisonBuildSource.ts";
import { landedWithoutVerdictSlot } from "./landedWithoutVerdict.ts";
import type { RevisionProofAbsence } from "./laterTrunkBuild.ts";
import {
  asSlot,
  statusWhenNotExact,
  type RevisionBuildSlot,
} from "./revisionBuildSlot.ts";

export type { RevisionBuildSlot } from "./revisionBuildSlot.ts";
export type { ExactResultLookup } from "./exactSkippedEquivalent.ts";

// Why a walking endpoint's build has no usable proof (undefined when its
// summary is usable): a valid summary is remembered by repository, run and
// attempt so the page's later proof read asks GitHub nothing again.
function walkingProofAbsence(
  source: ComparisonBuildSource,
): RevisionProofAbsence {
  return async (build) => {
    const run = proofRunOf(build);
    if (run === undefined) return { kind: "unavailable", reason: "none" };
    const proof = await source.proofOf(run);
    return proof.kind === "summary" ? undefined : proof;
  };
}

// Usable-proof gate for walking endpoints.
function walkingProofUsable(
  source: ComparisonBuildSource,
): RevisionProofUsable {
  const absence = walkingProofAbsence(source);
  return async (build) => (await absence(build)) === undefined;
}

// Baseline: newest completed attempt at or before `storyStart`, walking
// first-parent ancestors up to the baseline limit past builds without
// usable proof.
export async function lookupBaselineBuild(
  storyStart: string,
  source: ComparisonBuildSource,
): Promise<RevisionBuildSlot> {
  try {
    const revisions = await source.history.firstParents(
      storyStart,
      baselineAncestorLimit,
    );
    const build = await nearestRevisionBuild(
      revisions,
      source.lookup,
      undefined,
      {
        proofUsable: walkingProofUsable(source),
      },
    );
    if (build?.state === "running")
      return {
        kind: "none",
        explanation:
          "No completed CI build was found at or before the story's start; the nearest attempt is still running.",
      };
    const timed =
      build?.state === "pass" || build?.state === "failed" ? build : undefined;
    const status = await statusWhenNotExact(
      storyStart,
      timed,
      source,
      baselineAncestorLimit,
    );
    return asSlot(
      timed,
      status?.explanation ??
        "No completed CI build was found at or before the story's start within the readable history.",
      status,
    );
  } catch (error) {
    return {
      kind: "unavailable",
      explanation:
        error instanceof Error
          ? error.message
          : "The baseline CI build could not be read",
    };
  }
}

export type ResultLookupOptions = {
  readonly provisional?: true;
};

// Result endpoint (branch or landed): newest completed or running attempt at
// `target`, else a measured ancestor not older than `storyStart`. With
// `exactOnly`, the walk is limited to `target` itself; when its own CI gives
// no verdict, a confirmed skip may use that landing's equivalent build proof
// only, and a cancelled attempt the nearest later trunk build's proof up to
// `exact.laterTrunkHead` (`landedWithoutVerdictSlot`). Without `exactOnly`,
// the walk continues past builds without usable proof.
export async function lookupResultBuild(
  target: string,
  storyStart: string,
  source: ComparisonBuildSource,
  missingExplanation: string,
  exact?: ExactResultLookup,
  options?: ResultLookupOptions,
): Promise<RevisionBuildSlot> {
  try {
    const provisional = options?.provisional === true;
    const revisions =
      exact?.exactOnly === true
        ? await source.history.firstParents(target, 1)
        : await source.history.firstParents(target, baselineAncestorLimit + 1);
    const proofUsable =
      exact?.exactOnly === true ? undefined : walkingProofUsable(source);
    const build = await nearestRevisionBuild(
      revisions,
      source.lookup,
      exact?.exactOnly === true ? undefined : storyStart,
      {
        preferCompletedAncestor:
          provisional && source.lookup.preferCompletedAncestor === true,
        ...(proofUsable === undefined ? {} : { proofUsable }),
      },
    );
    if (build !== undefined) {
      const status = await statusWhenNotExact(
        target,
        build,
        source,
        baselineAncestorLimit,
      );
      return asSlot(build, missingExplanation, status);
    }
    if (exact?.exactOnly === true)
      return await landedWithoutVerdictSlot(
        target,
        source,
        exact,
        walkingProofAbsence(source),
      );
    const status = await statusWhenNotExact(
      target,
      undefined,
      source,
      baselineAncestorLimit,
    );
    return asSlot(undefined, status?.explanation ?? missingExplanation, status);
  } catch (error) {
    return {
      kind: "unavailable",
      explanation:
        error instanceof Error
          ? error.message
          : "The CI build could not be read",
    };
  }
}
