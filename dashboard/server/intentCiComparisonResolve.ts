// Resolves a story's CI comparison answer for Intent's comparison read
// (`./intentCiComparisonRead.ts`): done stories from published completion
// history, Taken stories from the live claim and tip.
import {
  suppressedBesideJudgmentFragments,
  type StoryCiComparisonAnswer,
  type StoryCiComparisonSlot,
} from "../src/storyCiComparison.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  lookupBaselineBuild,
  lookupResultBuild,
} from "./baseCiRevisionLookup.ts";
import { ciConfiguration } from "./baseCiJudgment.ts";
import { storyBranchLandedExactLookup } from "./exactSkippedEquivalent.ts";
import { runGit, type GitCall } from "./gitRunner.ts";
import {
  asComparisonSlot,
  gapFromUnread,
  isUnreadJudgment,
  lookupContext,
  trunkBranchNotApplicable,
} from "./intentCiComparisonSlots.ts";
import { publishedStoryEndpoints } from "./storyPublishedEndpoints.ts";
import { notLandedYet, takenStoryEndpoints } from "./takenStoryEndpoints.ts";

function workflowOf(call: GitCall): string {
  return ciConfiguration(call.cwd ?? "").workflow;
}

const [noPublishedCompletionRecord] = suppressedBesideJudgmentFragments;

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
  const context = lookupContext(source, signal);
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
  const baseline = asComparisonSlot(
    await lookupBaselineBuild(facts.storyStart, lookup, call, workflow),
  );
  const branch: StoryCiComparisonSlot =
    facts.mode === "trunk"
      ? trunkBranchNotApplicable
      : facts.landing === undefined
        ? {
            kind: "none",
            explanation:
              "Published history does not name a landing for this story's branch result.",
          }
        : asComparisonSlot(
            await lookupResultBuild(
              facts.landing.branchSide,
              facts.storyStart,
              lookup,
              call,
              workflow,
              "No completed CI build was found at the final branch revision or a later story-side ancestor within the story's start bound.",
            ),
          );
  // Story Branch Mode: exact landing (merge or fast-forward tip), except a
  // confirmed skip may use that landing's equivalent build proof only. Trunk
  // Mode keeps the completion ancestor walk.
  const fastForward =
    facts.landing !== undefined &&
    facts.landing.merge === facts.landing.branchSide;
  const landed: StoryCiComparisonSlot =
    facts.mode === "trunk"
      ? asComparisonSlot(
          await lookupResultBuild(
            facts.completion,
            facts.storyStart,
            lookup,
            call,
            workflow,
            "No completed CI build was found at the completion revision or a later trunk ancestor within the story's start bound.",
          ),
        )
      : facts.landing === undefined
        ? {
            kind: "none",
            explanation:
              "Published history does not name a landing for this story's landed result.",
          }
        : asComparisonSlot(
            await lookupResultBuild(
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
            ),
          );
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

export async function performTakenComparison(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
  checkedAt: string,
): Promise<StoryCiComparisonAnswer> {
  const endpoints = await takenStoryEndpoints(source, identity, signal);
  if (endpoints.kind === "absent") {
    return {
      kind: "unavailable",
      identity,
      explanation: `${identity} ${noPublishedCompletionRecord}.`,
      checkedAt,
    };
  }
  if (endpoints.kind === "unavailable") {
    return {
      kind: "unavailable",
      identity,
      explanation: endpoints.explanation,
      checkedAt,
    };
  }
  const { facts } = endpoints;
  const context = lookupContext(source, signal);
  if ("unavailable" in context) {
    return {
      kind: "unavailable",
      identity,
      explanation: context.unavailable,
      checkedAt,
    };
  }
  const { call, lookupOrGap } = context;
  if (isUnreadJudgment(lookupOrGap)) {
    const gap = gapFromUnread(lookupOrGap);
    return {
      kind: "comparison",
      phase: "taken",
      identity: facts.identity,
      mode: facts.mode,
      storyStart: facts.storyStart,
      checkedAt,
      baseline: gap,
      branch: facts.mode === "trunk" ? trunkBranchNotApplicable : gap,
      landed: notLandedYet,
      ...(facts.mode === "trunk" ? { provisional: gap } : {}),
    };
  }
  const lookup = lookupOrGap;
  const workflow = workflowOf(call);
  const baseline = asComparisonSlot(
    await lookupBaselineBuild(facts.storyStart, lookup, call, workflow),
  );
  const live = asComparisonSlot(
    await lookupResultBuild(
      facts.liveTip,
      facts.storyStart,
      lookup,
      call,
      workflow,
      facts.mode === "trunk"
        ? "No completed CI build was found at the current trunk tip or a later trunk ancestor within the story's start bound."
        : "No completed CI build was found at the current branch tip or a later story-side ancestor within the story's start bound.",
    ),
  );
  if (facts.mode === "trunk") {
    return {
      kind: "comparison",
      phase: "taken",
      identity: facts.identity,
      mode: facts.mode,
      storyStart: facts.storyStart,
      checkedAt,
      baseline,
      branch: trunkBranchNotApplicable,
      landed: notLandedYet,
      provisional: live,
    };
  }
  return {
    kind: "comparison",
    phase: "taken",
    identity: facts.identity,
    mode: facts.mode,
    storyStart: facts.storyStart,
    checkedAt,
    baseline,
    branch: live,
    landed: notLandedYet,
  };
}
