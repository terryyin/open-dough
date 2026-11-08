// CI build lookup by revision for a story's comparison endpoints: walks
// first-parent ancestors through local Git and answers baseline / branch /
// landed slots. The live branch judgment (`./baseCiJudgment.ts`) keeps its
// branch listing rule unchanged. Each endpoint names the requested
// revision's own status beside the selected build. Story Branch Landed may use a confirmed skip's equivalent build
// proof (`./exactSkippedEquivalent.ts`) or, when cancelled, a later trunk
// build's proof (`./laterTrunkBuild.ts`); Baseline / Branch (and Trunk Mode
// Landed / provisional tip) walk past builds without usable proof here.
// The lookup itself comes from `./baseCiRevisionLookupSource.ts`.
import { newestRunFor } from "./baseCiNearest.ts";
import { firstParentChain } from "./baseCiRevisionGit.ts";
import {
  nearestRevisionBuild,
  proofRunOf,
  type RevisionCiLookup,
  type RevisionProofUsable,
} from "./baseCiRevisionNearest.ts";
import { readCiProofArtifact } from "./ciProofArtifact.ts";
import {
  baselineAncestorLimit,
  exactSkippedEquivalentSlot,
  type ExactResultLookup,
} from "./exactSkippedEquivalent.ts";
import type { GitCall } from "./gitRunner.ts";
import {
  laterTrunkCancelledSlot,
  type RevisionProofAbsence,
} from "./laterTrunkBuild.ts";
import { requestedRevisionCiStatus } from "./requestedRevisionCiStatus.ts";
import {
  asSlot,
  nearestAncestorBasisSha,
  statusWhenNotExact,
  type RevisionBuildSlot,
} from "./revisionBuildSlot.ts";

export type { RevisionBuildSlot } from "./revisionBuildSlot.ts";
export type { ExactResultLookup } from "./exactSkippedEquivalent.ts";

export type ComparisonProofSource = {
  readonly repository: string;
  readonly signal: AbortSignal;
};

// Why a walking endpoint's build has no usable proof (undefined when its
// summary is usable): a valid summary is remembered by repository, run and
// attempt so the page's later proof read asks GitHub nothing again.
function walkingProofAbsence(
  source: ComparisonProofSource,
): RevisionProofAbsence {
  return async (build) => {
    const run = proofRunOf(build);
    if (run === undefined) return { kind: "unavailable", reason: "none" };
    const proof = await readCiProofArtifact(
      source.repository,
      run,
      source.signal,
    );
    return proof.kind === "summary" ? undefined : proof;
  };
}

// Usable-proof gate for walking endpoints.
function walkingProofUsable(
  source: ComparisonProofSource,
): RevisionProofUsable {
  const absence = walkingProofAbsence(source);
  return async (build) => (await absence(build)) === undefined;
}

// Baseline: newest completed attempt at or before `storyStart`, walking
// first-parent ancestors up to the baseline limit past builds without
// usable proof.
export async function lookupBaselineBuild(
  storyStart: string,
  lookup: RevisionCiLookup,
  call: GitCall,
  workflow: string,
  proofSource: ComparisonProofSource,
): Promise<RevisionBuildSlot> {
  try {
    const revisions = await firstParentChain(
      storyStart,
      call,
      baselineAncestorLimit,
    );
    const build = await nearestRevisionBuild(revisions, lookup, undefined, {
      proofUsable: walkingProofUsable(proofSource),
    });
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
      lookup,
      call,
      workflow,
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
// `exactOnly`, the walk is limited to `target` itself except a confirmed
// skip, which may use that landing's equivalent build proof only, and a
// cancelled attempt, which may use the nearest later trunk build's proof up
// to `exact.laterTrunkHead`. Otherwise a cancelled or timed-out attempt at
// that revision uses the caller-supplied explanations. Without
// `exactOnly`, the walk continues past builds without usable proof.
export async function lookupResultBuild(
  target: string,
  storyStart: string,
  lookup: RevisionCiLookup,
  call: GitCall,
  workflow: string,
  missingExplanation: string,
  exact?: ExactResultLookup,
  proofSource?: ComparisonProofSource,
  options?: ResultLookupOptions,
): Promise<RevisionBuildSlot> {
  try {
    const provisional = options?.provisional === true;
    const revisions =
      exact?.exactOnly === true
        ? await firstParentChain(target, call, 1)
        : await firstParentChain(target, call, baselineAncestorLimit + 1);
    const proofUsable =
      exact?.exactOnly === true || proofSource === undefined
        ? undefined
        : walkingProofUsable(proofSource);
    const build = await nearestRevisionBuild(
      revisions,
      lookup,
      exact?.exactOnly === true ? undefined : storyStart,
      {
        preferCompletedAncestor:
          provisional && lookup.preferCompletedAncestor === true,
        ...(proofUsable === undefined ? {} : { proofUsable }),
      },
    );
    if (build !== undefined) {
      const status = await statusWhenNotExact(
        target,
        build,
        lookup,
        call,
        workflow,
        baselineAncestorLimit,
      );
      return asSlot(build, missingExplanation, status);
    }
    if (exact?.exactOnly === true) {
      const listed = await lookup.listRunsAt(target);
      const newest = newestRunFor(listed, target);
      if (
        newest?.status === "completed" &&
        newest.adapterAttempt === undefined &&
        (newest.conclusion === "cancelled" || newest.conclusion === "timed_out")
      ) {
        if (newest.conclusion === "cancelled")
          return await laterTrunkCancelledSlot(
            target,
            listed,
            lookup,
            call,
            workflow,
            exact,
            walkingProofAbsence(exact),
          );
        return { kind: "none", explanation: exact.timedOutExplanation };
      }
      const status = await requestedRevisionCiStatus(
        target,
        listed,
        await nearestAncestorBasisSha(
          target,
          lookup,
          call,
          baselineAncestorLimit,
        ),
        call,
        workflow,
      );
      if (status.kind === "skipped") {
        return await exactSkippedEquivalentSlot(
          target,
          lookup,
          call,
          exact,
          status,
        );
      }
      return asSlot(undefined, status.explanation, status);
    }
    const status = await statusWhenNotExact(
      target,
      undefined,
      lookup,
      call,
      workflow,
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
