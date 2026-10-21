// Correction starting agreements and proposed judgments; the real CLI owns writes.
import assert from "node:assert/strict";
import {
  consumer,
  dependency,
  supplier,
  updateDependency,
} from "./supplier-dependency-fixture.mjs";

const mixedCondition =
  "The selected endpoint contract is completed and integrated, and this consumer implements its consumption.";
export const correctedCondition =
  "The selected endpoint contract is completed and integrated.";
export const correctionSummary =
  "The completed endpoint proof establishes the selected contract. The removed consumption clause belongs to the consumer's existing scope and examples; its implementation is still pending.";

export function correction(evidence, overrides = {}) {
  return {
    condition: correctedCondition,
    resolution: {
      revision: evidence,
      path: ".planning/seeds/B.md#b",
      summary: correctionSummary,
    },
    ...overrides,
  };
}

export async function mixedAgreement(f, story = consumer) {
  const written = await updateDependency(
    f.project,
    story,
    dependency(supplier, { condition: mixedCondition }),
  );
  assert.equal(written.code, 0, written.stderr);
}
