// Resolves a done story's CI comparison answer for Intent's comparison read
// (`./intentCiComparisonRead.ts`): published completion history. Taken stories
// resolve in `./intentCiComparisonTakenResolve.ts`.
import type { StoryCiComparisonAnswer } from "../src/storyCiComparison.ts";
import {
  lookupBaselineBuild,
  lookupResultBuild,
  type RevisionBuildSlot,
} from "./baseCiRevisionLookup.ts";
import { storyBranchLandedExactLookup } from "./exactSkippedEquivalent.ts";
import {
  asComparisonSlot,
  gapFromUnread,
  trunkBranchNotApplicable,
} from "./intentCiComparisonSlots.ts";
import type { StoryCiComparisonSource } from "./storyCiComparisonSource.ts";
import { landedSlotResolution } from "./landedCiResolution.ts";
import { landedReceiptTime } from "./landedCiReceipt.ts";

export { performTakenComparison } from "./intentCiComparisonTakenResolve.ts";

type DoneComparisonResult = {
  readonly answer: StoryCiComparisonAnswer;
  readonly landedPending: boolean;
};

export async function performDoneComparison(
  source: StoryCiComparisonSource,
  identity: string,
  checkedAt: string,
): Promise<DoneComparisonResult | undefined> {
  const endpoints = await source.publishedEndpoints(identity);
  if (endpoints.kind === "absent") return undefined;
  if (endpoints.kind === "unavailable") {
    return {
      landedPending: true,
      answer: {
        kind: "unavailable",
        identity,
        explanation: endpoints.explanation,
        checkedAt,
      },
    };
  }
  const { facts } = endpoints;
  const context = await source.buildsFor(facts.branch);
  if ("unavailable" in context) {
    return {
      landedPending: true,
      answer: {
        kind: "unavailable",
        identity,
        explanation: context.unavailable,
        checkedAt,
      },
    };
  }
  await source.verifyRevision(facts.completion);
  if ("judgment" in context) {
    const gap = gapFromUnread(context.judgment);
    return {
      landedPending: true,
      answer: {
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
      },
    };
  }
  const { builds } = context;
  const { lookup } = builds;
  const baselineBuild = await lookupBaselineBuild(facts.storyStart, builds);
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
            builds,
            "No completed CI build was found at the final branch revision or a later story-side ancestor within the story's start bound.",
          );
  // Story Branch Mode: exact landing (merge or fast-forward tip), except a
  // confirmed skip may use that landing's equivalent build proof only and a
  // cancelled landing the nearest later trunk build's proof. Trunk
  // Mode keeps the completion ancestor walk (usable-proof gate).
  const fastForward =
    facts.landing !== undefined &&
    facts.landing.merge === facts.landing.branchSide;
  const landedBuild: RevisionBuildSlot =
    facts.mode === "trunk"
      ? await lookupResultBuild(
          facts.completion,
          facts.storyStart,
          builds,
          "No completed CI build was found at the completion revision or a later trunk ancestor within the story's start bound.",
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
            builds,
            fastForward
              ? "No completed CI build was found at the landed story revision."
              : "No completed CI build was found at the landing merge.",
            storyBranchLandedExactLookup(fastForward, source.trunkHead),
          );
  const landedRevision =
    facts.mode === "trunk" ? facts.completion : facts.landing?.merge;
  const receivedAt =
    landedRevision === undefined
      ? undefined
      : landedReceiptTime(
          source.project,
          facts.identity,
          landedRevision,
          await source.landingReceipts(),
        );
  const landedPending =
    landedRevision !== undefined &&
    (
      await landedSlotResolution(
        landedBuild,
        {
          revision: landedRevision,
          ...(receivedAt === undefined ? {} : { receivedAt }),
        },
        source.trunkHead,
        builds,
        source.observationNow,
      )
    ).kind === "pending";
  const [baseline, branch, landed] = await Promise.all([
    asComparisonSlot(baselineBuild, lookup),
    asComparisonSlot(branchBuild, lookup),
    asComparisonSlot(landedBuild, lookup),
  ]);
  return {
    landedPending,
    answer: {
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
    },
  };
}
