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
import {
  asComparisonSlot,
  gapFromUnread,
  isUnreadJudgment,
  lookupContext,
  trunkBranchNotApplicable,
} from "./intentCiComparisonSlots.ts";
import { publishedStoryEndpoints } from "./storyPublishedEndpoints.ts";
import { notLandedYet, takenStoryEndpoints } from "./takenStoryEndpoints.ts";

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
  const baseline = asComparisonSlot(
    await lookupBaselineBuild(facts.storyStart, lookup, call),
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
              "No completed CI build was found at the final branch revision or a later story-side ancestor within the story's start bound.",
            ),
          );
  // Story Branch Mode: exact revision at the landing only — merge for a
  // trunk-first landing, tip for a fast-forward; no measured-ancestor
  // fallback across a merge (trunk-side lacks the story; story-side is B).
  // Trunk Mode keeps the completion ancestor walk.
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
              fastForward
                ? "No completed CI build was found at the landed story revision."
                : "No completed CI build was found at the landing merge.",
              {
                exactOnly: true,
                cancelledExplanation: fastForward
                  ? "The CI build at the landed story revision was cancelled."
                  : "The CI build at the landing merge was cancelled.",
                timedOutExplanation: fastForward
                  ? "The CI build at the landed story revision timed out."
                  : "The CI build at the landing merge timed out.",
              },
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
  const baseline = asComparisonSlot(
    await lookupBaselineBuild(facts.storyStart, lookup, call),
  );
  const live = asComparisonSlot(
    await lookupResultBuild(
      facts.liveTip,
      facts.storyStart,
      lookup,
      call,
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
