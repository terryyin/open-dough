// @ts-check
// How a kept launch (`./launchTestData.mjs`) relates to the reporting context
// its session reports through and the landing the store keeps for it
// (`./launchLandingEvidenceTestData.mjs`). A reporting context without a
// reference gets one the launch allocates as it completes; a landing stated
// through its builder names that reference unless it states its own launch. A
// stated reporting reference, including a malformed one, and a completed
// landing are kept as given. What the launch recorded after it started comes
// from `LaunchOutcomeBuilder`.

import { LaunchLandingBuilder } from "./launchLandingEvidenceTestData.mjs";
import { LaunchOutcomeBuilder } from "./launchOutcomeTestData.mjs";

/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {NonNullable<LaunchRecord["request"]["reporting"]>} Reporting */
/**
 * A reporting context as a case states it, its reference allocated when omitted.
 * @typedef {Omit<Reporting, "reference"> & Partial<Pick<Reporting, "reference">>} StatedReporting
 */

export class LaunchReportingBuilder extends LaunchOutcomeBuilder {
  /** @type {StatedReporting | undefined} */
  #reporting;
  /** @type {LaunchRecord["landing"] | LaunchLandingBuilder} */
  #landing;

  /**
   * The captured comparison, or its builder for this launch's landing.
   * @param {NonNullable<LaunchRecord["landing"]> | LaunchLandingBuilder} landing
   */
  withLanding(landing) {
    this.#landing = landing;
    return this;
  }

  /**
   * The session reports its completion through this reporting context.
   * @param {StatedReporting} reporting
   */
  reportingThrough(reporting) {
    this.#reporting = reporting;
    return this;
  }

  /**
   * The reporting context and landing of one completed launch, sharing its
   * reporting reference.
   * @returns {{ reporting: Reporting | undefined, landing: LaunchRecord["landing"] }}
   */
  reportingFacts() {
    const stated = this.#reporting;
    const reporting = stated && {
      ...stated,
      reference: stated.reference ?? globalThis.crypto.randomUUID(),
    };
    const landing = this.#landing;
    if (!(landing instanceof LaunchLandingBuilder))
      return { reporting, landing };
    return { reporting, landing: landing.pleaseFor(reporting?.reference) };
  }
}
