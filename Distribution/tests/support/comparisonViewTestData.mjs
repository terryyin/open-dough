// @ts-check
// Prepared canonical answers for the production Intent providers.
import { copyFacts } from "./factBuilder.mjs";

/** @typedef {import("../../../dashboard/src/storyCiComparisonEntries.ts").ComparisonEndpointProof} ComparisonEndpointProof */
/**
 * @template {object} Facts
 * @typedef {import("./factBuilder.mjs").FactBuilder<Facts>} FactBuilder
 */

// These exact-fact builders have no mutable state or defaults.
export const comparisonViewFacts = {
  /** @returns {FactBuilder<ComparisonEndpointProof>} */
  get aComparisonEndpointProof() {
    return { with: copyFacts };
  },
  /** @returns {FactBuilder<import("../../../dashboard/server/storyPublishedEvidence.ts").ReviewedStory>} */
  get aReviewedStory() {
    return { with: copyFacts };
  },
  /** @returns {FactBuilder<import("../../../dashboard/src/storyReviewFiles.ts").ReviewedFile>} */
  get aReviewedFile() {
    return { with: copyFacts };
  },
  /** @returns {FactBuilder<import("../../../dashboard/src/authenticatedIntentCiStatusRead.ts").IntentCiStatus>} */
  get anIntentCiStatus() {
    return { with: copyFacts };
  },
};

export class PublishedWorkBuilder {
  /** @param {import("../../../dashboard/src/publishedWork.ts").PublishedWork} facts */
  with(facts) {
    return copyFacts(facts);
  }
}

export class StoryCiComparisonBuilder {
  /** @template {import("../../../dashboard/src/storyCiComparison.ts").StoryCiComparisonAnswer} Facts @param {Facts} facts */
  with(facts) {
    return copyFacts(facts);
  }
}
