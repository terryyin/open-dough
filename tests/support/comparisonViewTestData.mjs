// @ts-check
// Prepared canonical answers for the production Intent providers.
export class PublishedWorkBuilder {
  /** @param {import("../../dashboard/src/publishedWork.ts").PublishedWork} facts */
  with(facts) {
    return { please: () => ({ ...facts }) };
  }
}

export class StoryCiComparisonBuilder {
  /** @template {import("../../dashboard/src/storyCiComparison.ts").StoryCiComparisonAnswer} Facts @param {Facts} facts */
  with(facts) {
    return { please: () => ({ ...facts }) };
  }
}
