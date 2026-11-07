// Resolves a Taken story's CI comparison answer for Intent's comparison read
// (`./intentCiComparisonRead.ts`): live claim tip and provisional trunk tip.
import {
  suppressedBesideJudgmentFragments,
  type StoryCiComparisonAnswer,
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
  workflowOf,
} from "./intentCiComparisonSlots.ts";
import { notLandedYet, takenStoryEndpoints } from "./takenStoryEndpoints.ts";

const [noPublishedCompletionRecord] = suppressedBesideJudgmentFragments;

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
  const workflow = workflowOf(call);
  const proofSource = { repository: source.repository, signal };
  const baselineBuild = await lookupBaselineBuild(
    facts.storyStart,
    lookup,
    call,
    workflow,
    proofSource,
  );
  const liveBuild = await lookupResultBuild(
    facts.liveTip,
    facts.storyStart,
    lookup,
    call,
    workflow,
    facts.mode === "trunk"
      ? "No completed CI build was found at the current trunk tip or a later trunk ancestor within the story's start bound."
      : "No completed CI build was found at the current branch tip or a later story-side ancestor within the story's start bound.",
    undefined,
    proofSource,
    { provisional: true },
  );
  const [baseline, live] = await Promise.all([
    asComparisonSlot(baselineBuild, lookup),
    asComparisonSlot(liveBuild, lookup),
  ]);
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
