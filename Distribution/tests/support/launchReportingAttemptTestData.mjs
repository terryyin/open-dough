// @ts-check
// Named accepted attempts that landing and completion cases share. All are
// steps on the attempt builder (`./launchAttemptTestData.mjs`) that
// `makeMe.anAcceptedAttempt` returns; this layer keeps that file within the
// 250-line check.
import { AcceptedAttemptBuilder } from "./launchAttemptTestData.mjs";

/** @typedef {import("../../../dashboard/src/launchOutcome.ts").LaunchAttemptRecord} LaunchAttemptRecord */
/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */

export class ReportingAttemptBuilder extends AcceptedAttemptBuilder {
  /** @type {LaunchAttemptRecord["reporting"]} */
  #reporting;

  /**
   * Stereotype: the ad hoc attempt accepted when `record` launched, whose
   * launched session reports through the record's reporting context.
   * @param {LaunchRecord} record
   */
  reportingFor(record) {
    const { reporting } = record.request;
    if (reporting?.reference === undefined)
      throw new Error("state the record's reporting context first");
    this.#reporting = reporting;
    return this.withId(reporting.reference)
      .adHoc()
      .acceptedAt(record.launchedAt)
      .reportingTo(reporting.origin)
      .capturingLanding({ reporting })
      .launched(record.session);
  }

  /**
   * The attempt also keeps this landing repository authority.
   * @param {NonNullable<LaunchAttemptRecord["landingRepository"]>} authority
   */
  landingIn(authority) {
    return this.capturingLanding({
      reporting: this.#reporting,
      landingRepository: authority,
    });
  }
}
