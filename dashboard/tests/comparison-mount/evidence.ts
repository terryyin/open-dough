// Prepared service answers at the actual target and scope interpretation boundary.
import type { CiEvidence } from "../../src/IntentCiEvidence.tsx";
import { ciTargetOf } from "../../src/intentCiTarget.ts";
import { comparisonProofOf } from "../../src/storyCiComparisonEntries.ts";
import type { ComparedStory } from "../../../Distribution/tests/support/comparedStoryTestData.mjs";

// The endpoint proofs the real comparison owner makes of each slot's
// published proof.
export function endpointProofsOf(story: ComparedStory) {
  const { answer, proofs } = story;
  if (proofs === undefined)
    throw new Error(
      "Arrange the comparison's proof entries or published proofs",
    );
  return {
    baseline: comparisonProofOf(answer.baseline, proofs[0], false),
    branch: comparisonProofOf(
      answer.provisional ?? answer.branch,
      proofs[1],
      false,
    ),
    landed: comparisonProofOf(answer.landed, proofs[2], false),
  };
}

export function preparedComparisonEvidence(facts: ComparedStory): CiEvidence {
  const target = ciTargetOf(facts.source, facts.work, facts.identity);
  if (target.kind === "gap") return target;
  return {
    kind: "comparison",
    phase: facts.answer.phase,
    source: facts.source,
    story: target.story ?? facts.identity,
    identity: facts.identity,
    comparison: {
      shown: facts.answer,
      failed: undefined,
      reading: false,
      checkedAgain: 0,
      checkAgain() {},
    },
    endpointProofs: endpointProofsOf(facts),
  };
}
