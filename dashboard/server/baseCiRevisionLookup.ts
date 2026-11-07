// CI build lookup by revision for a story's comparison endpoints: walks
// first-parent ancestors through local Git and answers baseline / branch /
// landed slots. GitHub Actions listing lives in
// `./baseCiGithubRevisionLookup.ts`. The live branch judgment
// (`./baseCiJudgment.ts`) keeps its branch listing rule unchanged. Each
// endpoint names the requested revision's own status beside the selected
// build. Story Branch Landed may use a confirmed skip's equivalent build
// proof (`./exactSkippedEquivalent.ts`); Baseline / Branch proof walks stay
// here.
import type { PublishedSource } from "../src/publishedSource.ts";
import { ciConfiguration } from "./baseCiJudgment.ts";
import { githubAcquisitionUnread } from "./baseCiGitHubReads.ts";
import {
  firstParentChain,
  githubRevisionLookup,
} from "./baseCiGithubRevisionLookup.ts";
import { newestRunFor, unread, type BaseCiJudgment } from "./baseCiNearest.ts";
import {
  nearestRevisionBuild,
  type RevisionCiLookup,
} from "./baseCiRevisionNearest.ts";
import {
  baselineAncestorLimit,
  exactSkippedEquivalentSlot,
  type ExactResultLookup,
} from "./exactSkippedEquivalent.ts";
import type { GitCall } from "./gitRunner.ts";
import { requestedRevisionCiStatus } from "./requestedRevisionCiStatus.ts";
import {
  asSlot,
  nearestAncestorBasisSha,
  statusWhenNotExact,
  type RevisionBuildSlot,
} from "./revisionBuildSlot.ts";

export type { RevisionBuildSlot } from "./revisionBuildSlot.ts";
export type { ExactResultLookup } from "./exactSkippedEquivalent.ts";

// Baseline: newest completed attempt at or before `storyStart`, walking
// first-parent ancestors up to the baseline limit.
export async function lookupBaselineBuild(
  storyStart: string,
  lookup: RevisionCiLookup,
  call: GitCall,
  workflow: string,
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

// Result endpoint (branch or landed): newest completed or running attempt at
// `target`, else a measured ancestor not older than `storyStart`. With
// `exactOnly`, the walk is limited to `target` itself except a confirmed
// skip, which may use that landing's equivalent build proof only; a
// cancelled or timed-out attempt at that revision uses the caller-supplied
// explanations (Landed keeps those exact-only wordings).
export async function lookupResultBuild(
  target: string,
  storyStart: string,
  lookup: RevisionCiLookup,
  call: GitCall,
  workflow: string,
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

// When a folder uses ciAdapter, revision `head_sha` lookups are not available
// through GitHub Actions; comparison explains that gap.
export function revisionLookupOrGap(
  source: PublishedSource,
  folderPath: string,
  call: GitCall,
  signal: AbortSignal,
): RevisionCiLookup | BaseCiJudgment {
  const { adapter, workflow } = ciConfiguration(folderPath);
  if (adapter !== undefined)
    return unread(
      "This project's CI adapter does not list builds by revision, so a story CI comparison cannot be read.",
    );
  try {
    return githubRevisionLookup(source, workflow, call, signal);
  } catch (error) {
    return githubAcquisitionUnread(error, "The CI workflow could not be read");
  }
}
