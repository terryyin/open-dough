// @ts-check
// Builders of a published revision as Intent reads it: its source, work,
// published files, Intent locations and their answer, CI scope history
// glance, and a Done story's collected CI wall-time history. Node-free, so
// makeMe.mjs and pageMakeMe.mjs expose them from these definitions.
import { PublishedWorkBuilder } from "./comparisonViewTestData.mjs";
import { DoneWallTimeHistoryBuilder } from "./doneWallTimeHistoryTestData.mjs";
import { copyFacts } from "./factBuilder.mjs";
import {
  IntentLocationBuilder,
  IntentLocationsAnswerBuilder,
} from "./intentLocationTestData.mjs";
import { PublishedFilesBuilder } from "./publishedFilesTestData.mjs";
import { PublishedSourceBuilder } from "./publishedSourceTestData.mjs";

/** @typedef {import("../../../dashboard/src/publishedWork.ts").WorkEntry} WorkEntry */

/**
 * @typedef {object} PublishedReadingMakeMe
 * @property {PublishedSourceBuilder} aPublishedSource
 * @property {PublishedWorkBuilder} aPublishedWork
 * @property {WorkEntryBuilder} aWorkEntry
 * @property {PublishedFilesBuilder} somePublishedFiles
 * @property {IntentLocationBuilder} anIntentLocation
 * @property {IntentLocationsAnswerBuilder} anIntentLocationsAnswer
 * @property {import("./factBuilder.mjs").FactBuilder<import("../../../dashboard/src/ciScopeHistory.ts").ScopeHistoryGlance>} aScopeHistoryGlance
 * @property {DoneWallTimeHistoryBuilder} aDoneWallTimeHistory
 */

class WorkEntryBuilder {
  /** @param {Omit<WorkEntry, "canonical"> & { canonical?: WorkEntry["canonical"] }} facts */
  with(facts) {
    return copyFacts({
      ...facts,
      canonical:
        facts.canonical ??
        /** @type {const} */ ({
          kind: "snapshot",
          recorded: "seeds/SEED-1.md",
          url: "https://example.test/seeds/SEED-1.md",
          revision: "a".repeat(40),
        }),
    });
  }
}

/** @returns {PropertyDescriptorMap} */
export function publishedReadingMakeMeProperties() {
  return {
    aPublishedSource: {
      enumerable: true,
      get() {
        return new PublishedSourceBuilder();
      },
    },
    aPublishedWork: {
      enumerable: true,
      get() {
        return new PublishedWorkBuilder();
      },
    },
    aWorkEntry: {
      enumerable: true,
      get() {
        return new WorkEntryBuilder();
      },
    },
    somePublishedFiles: {
      enumerable: true,
      get() {
        return new PublishedFilesBuilder();
      },
    },
    anIntentLocation: {
      enumerable: true,
      get() {
        return new IntentLocationBuilder();
      },
    },
    anIntentLocationsAnswer: {
      enumerable: true,
      get() {
        return new IntentLocationsAnswerBuilder();
      },
    },
    aScopeHistoryGlance: {
      enumerable: true,
      get() {
        return { with: copyFacts };
      },
    },
    aDoneWallTimeHistory: {
      enumerable: true,
      get() {
        return new DoneWallTimeHistoryBuilder();
      },
    },
  };
}
