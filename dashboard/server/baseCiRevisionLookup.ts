// CI build lookup by revision for a story's comparison endpoints: walks
// first-parent ancestors through local Git and answers baseline / branch /
// landed slots. GitHub Actions listing lives in
// `./baseCiGithubRevisionLookup.ts`. The live branch judgment
// (`./baseCiJudgment.ts`) keeps its branch listing rule unchanged.
import { ciConfiguration } from "./baseCiJudgment.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { adapterDiscoveryUnread } from "./baseCiAdapterAttempts.ts";
import { adapterRevisionLookup } from "./baseCiAdapterRevisionLookup.ts";
import { githubAcquisitionUnread } from "./baseCiGitHubReads.ts";
import { githubRevisionLookup } from "./baseCiGithubRevisionLookup.ts";
import { newestRunFor, type BaseCiJudgment } from "./baseCiNearest.ts";
import { firstParentChain } from "./baseCiRevisionGit.ts";
import {
  nearestRevisionBuild,
  type RevisionCiBuild,
  type RevisionCiLookup,
} from "./baseCiRevisionNearest.ts";
import type { GitCall } from "./gitRunner.ts";

// How far a baseline walk may go beyond the story start when looking for a
// completed trunk build (claim commits are almost never built).
const baselineAncestorLimit = 30;

export type RevisionBuildSlot =
  | ({
      readonly kind: "build";
      readonly state: "pass" | "failed";
    } & Omit<RevisionCiBuild, "state">)
  | ({
      readonly kind: "running";
      readonly state: "running";
    } & Omit<RevisionCiBuild, "state">)
  | { readonly kind: "none"; readonly explanation: string }
  | { readonly kind: "unavailable"; readonly explanation: string };

function asSlot(
  build: RevisionCiBuild | undefined,
  noneExplanation: string,
): RevisionBuildSlot {
  if (build === undefined)
    return { kind: "none", explanation: noneExplanation };
  const { state, ...identity } = build;
  if (state === "running") return { kind: "running", state, ...identity };
  return { kind: "build", state, ...identity };
}

// Baseline: newest completed attempt at or before `storyStart`, walking
// first-parent ancestors up to the baseline limit.
export async function lookupBaselineBuild(
  storyStart: string,
  lookup: RevisionCiLookup,
  call: GitCall,
): Promise<RevisionBuildSlot> {
  try {
    const revisions = await firstParentChain(
      storyStart,
      call,
      baselineAncestorLimit,
    );
    const build = await nearestRevisionBuild(revisions, lookup);
    if (build?.state === "running")
      return {
        kind: "none",
        explanation:
          "No completed CI build was found at or before the story's start; the nearest attempt is still running.",
      };
    return asSlot(
      build?.state === "pass" || build?.state === "failed" ? build : undefined,
      "No completed CI build was found at or before the story's start within the readable history.",
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

export type ExactResultLookup = {
  readonly exactOnly: true;
  // Caller-owned wording when the only attempt at `target` is cancelled or
  // timed out (for example Story Branch Landed at the landing merge).
  readonly cancelledExplanation: string;
  readonly timedOutExplanation: string;
};

// Result endpoint (branch or landed): newest completed or running attempt at
// `target`, else a measured ancestor not older than `storyStart`. With
// `exactOnly`, the walk is limited to `target` itself (no measured-ancestor
// fallback); a cancelled or timed-out attempt at that revision uses the
// caller-supplied explanations.
export async function lookupResultBuild(
  target: string,
  storyStart: string,
  lookup: RevisionCiLookup,
  call: GitCall,
  missingExplanation: string,
  exact?: ExactResultLookup,
): Promise<RevisionBuildSlot> {
  try {
    const revisions =
      exact?.exactOnly === true
        ? await firstParentChain(target, call, 1)
        : await firstParentChain(target, call, baselineAncestorLimit + 1);
    const build = await nearestRevisionBuild(
      revisions,
      lookup,
      exact?.exactOnly === true ? undefined : storyStart,
    );
    if (build !== undefined) return asSlot(build, missingExplanation);
    if (exact?.exactOnly === true) {
      const newest = newestRunFor(await lookup.listRunsAt(target), target);
      if (
        newest?.status === "completed" &&
        (newest.conclusion === "cancelled" || newest.conclusion === "timed_out")
      ) {
        return {
          kind: "none",
          explanation:
            newest.conclusion === "cancelled"
              ? exact.cancelledExplanation
              : exact.timedOutExplanation,
        };
      }
    }
    return asSlot(undefined, missingExplanation);
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

// A CI adapter supplies a discovery snapshot for the whole comparison;
// GitHub Actions lists runs as the first-parent walk reaches each revision.
export async function revisionLookupOrGap(
  source: PublishedSource,
  folderPath: string,
  call: GitCall,
  signal: AbortSignal,
  storyBranch: string | undefined,
): Promise<RevisionCiLookup | BaseCiJudgment> {
  const { adapter, workflow } = ciConfiguration(folderPath);
  if (adapter !== undefined) {
    try {
      return await adapterRevisionLookup(
        source,
        storyBranch,
        folderPath,
        adapter,
        call,
        signal,
      );
    } catch (error) {
      return adapterDiscoveryUnread(error);
    }
  }
  try {
    return githubRevisionLookup(source, workflow, call, signal);
  } catch (error) {
    return githubAcquisitionUnread(error, "The CI workflow could not be read");
  }
}
