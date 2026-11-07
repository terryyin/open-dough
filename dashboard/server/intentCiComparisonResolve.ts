// Resolves a done story's CI comparison answer for Intent's comparison read
// (`./intentCiComparisonRead.ts`): published completion history. Taken stories
// resolve in `./intentCiComparisonTakenResolve.ts`.
import type { StoryCiComparisonAnswer } from "../src/storyCiComparison.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  lookupBaselineBuild,
  lookupResultBuild,
  type RevisionBuildSlot,
} from "./baseCiRevisionLookup.ts";
import { storyBranchLandedExactLookup } from "./exactSkippedEquivalent.ts";
import { runGit } from "./gitRunner.ts";
import {
  asComparisonSlot,
  gapFromUnread,
  isUnreadJudgment,
  lookupContext,
  trunkBranchNotApplicable,
  workflowOf,
} from "./intentCiComparisonSlots.ts";
import { publishedStoryEndpoints } from "./storyPublishedEndpoints.ts";

export { performTakenComparison } from "./intentCiComparisonTakenResolve.ts";

export async function performDoneComparison(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
  checkedAt: string,
): Promise<StoryCiComparisonAnswer | undefined> {
  const endpoints = await publishedStoryEndpoints(source, identity, signal);
  if (endpoints.kind === "absent") return undefined;
  if (endpoints.kind === "unavailable") {
    return {
      kind: "unavailable",
      identity,
      explanation: endpoints.explanation,
      checkedAt,
    };
  }
  const { facts } = endpoints;
  const context = await lookupContext(source, signal, facts.branch);
  if ("unavailable" in context) {
    return {
      kind: "unavailable",
      identity,
      explanation: context.unavailable,
      checkedAt,
    };
  }
  const { call, lookupOrGap } = context;
  await runGit(["rev-parse", "--verify", `${facts.completion}^{commit}`], call);
  if (isUnreadJudgment(lookupOrGap)) {
    const gap = gapFromUnread(lookupOrGap);
    return {
      kind: "comparison",
      phase: "done",
      identity: facts.identity,
      mode: facts.mode,
      completion: facts.completion,
      storyStart: facts.storyStart,
      checkedAt,
      baseline: gap,
      branch: facts.mode === "trunk" ? trunkBranchNotApplicable : gap,
      landed: gap,
    };
  }
  const lookup = lookupOrGap;
  const workflow = workflowOf(call);
  const proofSource = { repository: source.repository, signal };
  const baselineBuild = await lookupBaselineBuild(
    facts.storyStart,
    lookup,
    call,
    workflow,
    proofSource,
  );
  const branchBuild: RevisionBuildSlot =
    facts.mode === "trunk"
      ? trunkBranchNotApplicable
      : facts.landing === undefined
        ? {
            kind: "none",
            explanation:
              "Published history does not name a landing for this story's branch result.",
          }
        : await lookupResultBuild(
            facts.landing.branchSide,
            facts.storyStart,
            lookup,
            call,
            workflow,
            "No completed CI build was found at the final branch revision or a later story-side ancestor within the story's start bound.",
            undefined,
            proofSource,
          );
  // Story Branch Mode: exact landing (merge or fast-forward tip), except a
  // confirmed skip may use that landing's equivalent build proof only. Trunk
  // Mode keeps the completion ancestor walk (usable-proof gate).
  const fastForward =
    facts.landing !== undefined &&
    facts.landing.merge === facts.landing.branchSide;
  const landedBuild: RevisionBuildSlot =
    facts.mode === "trunk"
      ? await lookupResultBuild(
          facts.completion,
          facts.storyStart,
          lookup,
          call,
          workflow,
          "No completed CI build was found at the completion revision or a later trunk ancestor within the story's start bound.",
          undefined,
          proofSource,
        )
      : facts.landing === undefined
        ? {
            kind: "none",
            explanation:
              "Published history does not name a landing for this story's landed result.",
          }
        : await lookupResultBuild(
            facts.landing.merge,
            facts.storyStart,
            lookup,
            call,
            workflow,
            fastForward
              ? "No completed CI build was found at the landed story revision."
              : "No completed CI build was found at the landing merge.",
            storyBranchLandedExactLookup(
              fastForward,
              source.repository,
              signal,
            ),
          );
  const [baseline, branch, landed] = await Promise.all([
    asComparisonSlot(baselineBuild, lookup),
    asComparisonSlot(branchBuild, lookup),
    asComparisonSlot(landedBuild, lookup),
  ]);
  return {
    kind: "comparison",
    phase: "done",
    identity: facts.identity,
    mode: facts.mode,
    completion: facts.completion,
    storyStart: facts.storyStart,
    checkedAt,
    baseline,
    branch,
    landed,
  };
}
