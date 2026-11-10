// @ts-check
// Prepared canonical answers for the production Intent providers.
export class StoryCiComparisonBuilder {
  /** @template {import("../../dashboard/src/storyCiComparison.ts").StoryCiComparisonAnswer} Facts @param {Facts} facts */
  with(facts) {
    return { please: () => ({ ...facts }) };
  }
}
