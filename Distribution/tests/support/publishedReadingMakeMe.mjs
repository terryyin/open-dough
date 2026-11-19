// @ts-check
// Builders of a published revision as Intent reads it: its source, work,
// Intent locations and CI scope history glance. Node-free, so makeMe.mjs and
// pageMakeMe.mjs expose them from these definitions.
import { PublishedWorkBuilder } from "./comparisonViewTestData.mjs";
import { copyFacts } from "./factBuilder.mjs";
import { IntentLocationBuilder } from "./intentLocationTestData.mjs";
import { PublishedSourceBuilder } from "./publishedSourceTestData.mjs";

/**
 * @typedef {object} PublishedReadingMakeMe
 * @property {PublishedSourceBuilder} aPublishedSource
 * @property {PublishedWorkBuilder} aPublishedWork
 * @property {IntentLocationBuilder} anIntentLocation
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
    anIntentLocation: {
      enumerable: true,
      get() {
        return new IntentLocationBuilder();
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
