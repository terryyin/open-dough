// @ts-check
// Prepared canonical answers for the production Intent providers.
import { copyFacts } from "./factBuilder.mjs";
import { PublishedSourceBuilder } from "./publishedSourceTestData.mjs";

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

/**
 * @typedef {Pick<typeof comparisonViewFacts, "anIntentCiStatus"> & {
 *   readonly aStoryCiComparison: StoryCiComparisonBuilder;
 * }} ComparisonViewMakeMe
 */

/** @returns {PropertyDescriptorMap} */
export function comparisonViewMakeMeProperties() {
  return {
    anIntentCiStatus: {
      enumerable: true,
      get() {
        return comparisonViewFacts.anIntentCiStatus;
      },
    },
    aStoryCiComparison: {
      enumerable: true,
      get() {
        return new StoryCiComparisonBuilder();
      },
    },
  };
}

export class PublishedWorkBuilder {
  /** @param {import("../../../dashboard/src/publishedWork.ts").PublishedWork} facts */
  with(facts) {
    return copyFacts(facts);
  }

  // `source`'s work, read with no direction and no stories.
  /** @param {import("../../../dashboard/src/publishedSource.ts").PublishedSource} source */
  of(source) {
    return {
      /** @param {string} revision the published revision read */
      at: (revision) =>
        this.with({
          source,
          revision,
          retrievedAt: new Date("2026-11-05T08:00:00.000Z"),
          direction: "",
          taken: [],
          backlog: [],
        }),
    };
  }

  // The named example: Pygardon's work.
  get ofPygardon() {
    return this.of(new PublishedSourceBuilder().pygardon.please());
  }
}

export class StoryCiComparisonBuilder {
  /** @template {import("../../../dashboard/src/storyCiComparison.ts").StoryCiComparisonAnswer} Facts @param {Facts} facts */
  with(facts) {
    return copyFacts(facts);
  }
}
