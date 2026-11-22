// @ts-check
// Builders of a published revision as Intent reads it: its source, work,
// published files, Intent locations and their answer, and CI scope history
// glance. Node-free, so makeMe.mjs and pageMakeMe.mjs expose them from these
// definitions.
import { PublishedWorkBuilder } from "./comparisonViewTestData.mjs";
import { copyFacts } from "./factBuilder.mjs";
import {
  IntentLocationBuilder,
  IntentLocationsAnswerBuilder,
} from "./intentLocationTestData.mjs";
import { PublishedFilesBuilder } from "./publishedFilesTestData.mjs";
import { PublishedSourceBuilder } from "./publishedSourceTestData.mjs";

/**
 * @typedef {object} PublishedReadingMakeMe
 * @property {PublishedSourceBuilder} aPublishedSource
 * @property {PublishedWorkBuilder} aPublishedWork
 * @property {PublishedFilesBuilder} somePublishedFiles
 * @property {IntentLocationBuilder} anIntentLocation
 * @property {IntentLocationsAnswerBuilder} anIntentLocationsAnswer
 * @property {import("./factBuilder.mjs").FactBuilder<import("../../../dashboard/src/ciScopeHistory.ts").ScopeHistoryGlance>} aScopeHistoryGlance
 */

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
  };
}
