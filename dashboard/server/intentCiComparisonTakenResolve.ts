// Resolves a Taken story's CI comparison answer for Intent's comparison read
// (`./intentCiComparisonRead.ts`): live claim tip and provisional trunk tip.
import {
  suppressedBesideJudgmentFragments,
  type StoryCiComparisonAnswer,
} from "../src/storyCiComparison.ts";
import {
  lookupBaselineBuild,
  lookupResultBuild,
} from "./baseCiRevisionLookup.ts";
import {
  asComparisonSlot,
  gapFromUnread,
  trunkBranchNotApplicable,
  notLandedYet,
} from "./intentCiComparisonSlots.ts";
import type { StoryCiComparisonSource } from "./storyCiComparisonSource.ts";

const [noPublishedCompletionRecord] = suppressedBesideJudgmentFragments;

export async function performTakenComparison(
  source: StoryCiComparisonSource,
  identity: string,
  checkedAt: string,
): Promise<StoryCiComparisonAnswer> {
  const endpoints = await source.takenEndpoints(identity);
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
  const context = await source.buildsFor(facts.branch);
  if ("unavailable" in context) {
    return {
      kind: "unavailable",
      identity,
      explanation: context.unavailable,
      checkedAt,
    };
  }
  if ("judgment" in context) {
    const gap = gapFromUnread(context.judgment);
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
  const { builds } = context;
  const { lookup } = builds;
  const baselineBuild = await lookupBaselineBuild(facts.storyStart, builds);
  const liveBuild = await lookupResultBuild(
    facts.liveTip,
    facts.storyStart,
    builds,
    facts.mode === "trunk"
      ? "No completed CI build was found at the current trunk tip or a later trunk ancestor within the story's start bound."
      : "No completed CI build was found at the current branch tip or a later story-side ancestor within the story's start bound.",
    undefined,
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
