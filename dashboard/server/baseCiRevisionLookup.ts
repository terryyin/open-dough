// CI build lookup by revision for a story's comparison endpoints: walks
// first-parent ancestors through local Git and answers baseline / branch /
// landed slots. GitHub Actions listing lives in
// `./baseCiGithubRevisionLookup.ts`. The live branch judgment
// (`./baseCiJudgment.ts`) keeps its branch listing rule unchanged.
import { ciConfiguration } from "./baseCiJudgment.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { githubAcquisitionUnread } from "./baseCiGitHubReads.ts";
import {
  firstParentChain,
  githubRevisionLookup,
} from "./baseCiGithubRevisionLookup.ts";
import { unread, type BaseCiJudgment } from "./baseCiNearest.ts";
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
  const {
    revision,
    subject,
    selection,
    laterWithoutResult,
    runUrl,
    runBranch,
    runId,
    runAttempt,
    startedAt,
    completedAt,
  } = build;
  const identity = {
    revision,
    subject,
    selection,
    laterWithoutResult,
    ...(runUrl === undefined ? {} : { runUrl }),
    ...(runBranch === undefined ? {} : { runBranch }),
    ...(runId === undefined ? {} : { runId }),
    ...(runAttempt === undefined ? {} : { runAttempt }),
    ...(startedAt === undefined ? {} : { startedAt }),
    ...(completedAt === undefined ? {} : { completedAt }),
  };
  if (build.state === "running")
    return { kind: "running", state: "running", ...identity };
  return { kind: "build", state: build.state, ...identity };
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

// Result endpoint (branch or landed): newest completed or running attempt at
// `target`, else a measured ancestor not older than `storyStart`.
export async function lookupResultBuild(
  target: string,
  storyStart: string,
  lookup: RevisionCiLookup,
  call: GitCall,
  missingExplanation: string,
): Promise<RevisionBuildSlot> {
  try {
    const revisions = await firstParentChain(
      target,
      call,
      baselineAncestorLimit + 1,
    );
    const build = await nearestRevisionBuild(revisions, lookup, storyStart);
    return asSlot(build, missingExplanation);
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
