// @ts-check
// Public MakeMe accessors for reporter-hook run, result, and step builders.
import { ReporterRunBuilder } from "./reporterRunTestData.mjs";
import { reporterResultMakeMeProperties } from "./reporterResultTestData.mjs";

/**
 * @typedef {object} ReporterRunMakeMe
 * @property {ReporterRunBuilder} aReporterRun
 * @property {import("./reporterResultTestData.mjs").ReporterResultBuilder} aReporterResult
 * @property {import("./reporterResultTestData.mjs").ReporterStepBuilder} aReporterStep
 */

/** @returns {PropertyDescriptorMap} */
export function reporterRunMakeMeProperties() {
  return {
    aReporterRun: {
      enumerable: true,
      get() {
        return new ReporterRunBuilder();
      },
    },
    ...reporterResultMakeMeProperties(),
  };
}
