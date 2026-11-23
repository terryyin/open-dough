// @ts-check
// Prepared canonical answers for the production Intent providers.
import { takenEntry } from "./comparedStoryWorkTestData.mjs";
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
      at: (revision) => new PublishedWorkAtBuilder(source, revision),
    };
  }

  // The named example: Pygardon's work.
  get ofPygardon() {
    return this.of(new PublishedSourceBuilder().pygardon.please());
  }
}

/** @typedef {import("../../../dashboard/src/publishedWork.ts").WorkEntry} WorkEntry */

// A project's work read at a revision, with the stories it has Taken.
class PublishedWorkAtBuilder {
  /** @type {WorkEntry[]} */
  #taken = [];
  #retrievedAt = new Date("2026-11-05T08:00:00.000Z");

  /**
   * @param {import("../../../dashboard/src/publishedSource.ts").PublishedSource} source
   * @param {string} revision
   */
  constructor(source, revision) {
    this.source = source;
    this.revision = revision;
  }

  /** @param {Date} when the read's time */
  retrievedAt(when) {
    this.#retrievedAt = when;
    return this;
  }

  /**
   * A Taken story assigned to `agent` (default `engineer`) on its story
   * branch in Claude, with `facts` the entry adds.
   * @param {{ readonly identity: string; readonly title: string; readonly branch: string; readonly agent?: string }} story
   * @param {Partial<WorkEntry>} [facts]
   */
  taking({ identity, title, branch, agent = "engineer" }, facts = {}) {
    this.#taken.push({
      ...takenEntry({
        identity,
        title,
        mode: "story-branch",
        branch,
        agent,
        host: "claude",
      }),
      ...facts,
    });
    return this;
  }

  /** @returns {import("../../../dashboard/src/publishedWork.ts").PublishedWork} */
  please() {
    return {
      source: this.source,
      revision: this.revision,
      retrievedAt: this.#retrievedAt,
      direction: "",
      taken: this.#taken.map((entry) => structuredClone(entry)),
      backlog: [],
    };
  }
}

export class StoryCiComparisonBuilder {
  /** @template {import("../../../dashboard/src/storyCiComparison.ts").StoryCiComparisonAnswer} Facts @param {Facts} facts */
  with(facts) {
    return copyFacts(facts);
  }
}
