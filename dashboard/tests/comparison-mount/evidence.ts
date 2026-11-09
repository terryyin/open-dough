// Prepared service answers at the actual target and scope interpretation boundary.
import type { CiEvidence } from "../../src/IntentCiEvidence.tsx";
import { ciTargetOf } from "../../src/intentCiTarget.ts";
import type { ComparisonRenderFacts } from "../support/comparisonRenderFacts.ts";

export function preparedComparisonEvidence(
  facts: ComparisonRenderFacts,
): CiEvidence {
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
    endpointProofs: facts.endpointProofs,
  };
}
