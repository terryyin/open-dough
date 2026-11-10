// Canonical prepared proof answers, transformed by the real comparison owner.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { CiProof, CiProofEntry } from "../../src/ciProof.ts";
import type { StoryCiComparisonAnswer } from "../../src/storyCiComparison.ts";
import { comparisonProofOf } from "../../src/storyCiComparisonEntries.ts";
import type { ComparisonMount } from "./comparisonMountTypes.ts";

export function comparisonRenderFacts<
  Facts extends ComparisonMount & {
    readonly answer: Extract<StoryCiComparisonAnswer, { kind: "comparison" }>;
  },
>(
  facts: Facts,
  entries: readonly (readonly CiProofEntry[])[] | undefined,
  supplied?: readonly (CiProof | undefined)[],
) {
  const answer = facts.answer;
  const slots = [
    answer.baseline,
    answer.provisional ?? answer.branch,
    answer.landed,
  ];
  const raw = slots.map((slot, at) => {
    if (supplied !== undefined) return supplied[at];
    if (entries === undefined)
      throw new Error(
        "Arrange the comparison's proof entries or raw proof answers",
      );
    if (slot.kind !== "build") return undefined;
    const held = entries[at] ?? [];
    const adapter = slot.adapterAttempt;
    if (adapter !== undefined) {
      if (slot.runBranch === undefined || adapter.ambiguous === true)
        return undefined;
      return makeMe.aCiProof
        .summaryForAdapter(
          { attemptId: adapter.attemptId, revision: slot.revision },
          held,
          facts.source.repository,
        )
        .please();
    }
    if (slot.runId === undefined || slot.runAttempt === undefined)
      return undefined;
    return makeMe.aCiProof
      .summaryFor(
        {
          runId: slot.runId,
          runAttempt: slot.runAttempt,
          revision: slot.revision,
        },
        held,
        facts.source.repository,
      )
      .please();
  });
  return {
    ...facts,
    endpointProofs: {
      baseline: comparisonProofOf(answer.baseline, raw[0], false),
      branch: comparisonProofOf(
        answer.provisional ?? answer.branch,
        raw[1],
        false,
      ),
      landed: comparisonProofOf(answer.landed, raw[2], false),
    },
  };
}

export type ComparisonRenderFacts = ReturnType<typeof comparisonRenderFacts>;
