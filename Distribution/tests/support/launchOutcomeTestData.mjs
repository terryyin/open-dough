// @ts-check
// What a kept launch records after it started, as the dashboard's machine
// store holds it: its final report, whether the developer read it, its
// landing and its Done mark, each with fixed receipts and references
// (`./launchTestData.mjs`). A final report can also be arranged on its own
// (`./completionReportTestData.mjs`), as can the submission a session reports
// it with (`./completionSubmissionTestData.mjs`). The landing is the evidence
// `./launchLandingEvidenceTestData.mjs` describes.

import { finalReport } from "./completionReportTestData.mjs";
import { LaunchLandingBuilder } from "./launchLandingEvidenceTestData.mjs";
import { landingDelivery } from "./launchLandingTestData.mjs";

export { CompletionReportBuilder } from "./completionReportTestData.mjs";
export { CompletionSubmissionBuilder } from "./completionSubmissionTestData.mjs";

/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {import("./completionReportTestData.mjs").ReportFacts} ReportFacts */

/**
 * The facts a launch states after it started: the final report, whether the
 * developer read it, the revision the work landed at, when the developer
 * marked the session Done, and what that mark could not finish natively.
 * A landing is received under a fixed receipt unless it states its own, and
 * names the story it landed for only when the case states it. Retained
 * landing-reporting authority rides beside the captured landing when the case
 * keeps it.
 * @typedef {{
 *   completion?: ReportFacts,
 *   reportRead?: boolean,
 *   landedRevision?: string,
 *   landingReceipt?: string,
 *   landingIdentity?: string,
 *   capturedLanding?: import("../../../dashboard/src/launchLanding.ts").LaunchLanding,
 *   landingReporting?: import("../../../dashboard/src/launchLanding.ts").LandingReporting,
 *   doneAt?: string,
 *   doneProblem?: string,
 * }} LaunchOutcome
 */

// The landing under the receipt the case states, if it states one, naming
// the story the case states it landed for, if it states one.
/**
 * @param {LaunchLandingBuilder} landing
 * @param {string | undefined} receipt
 * @param {string | undefined} identity
 */
function received(landing, receipt, identity) {
  const delivered =
    receipt === undefined
      ? landing
      : landing.deliveredAs({ delivery: landingDelivery, receipt });
  return identity === undefined
    ? delivered
    : delivered.capturedFrom({ repository: "open-dough", identity });
}

// What a launch's builder states about the launch after it started
// (`LaunchRecordBuilder`): its final report, whether the developer read it,
// its landing and its Done mark.
export class LaunchOutcomeBuilder {
  /** @type {LaunchOutcome} */
  #outcome = {};

  /**
   * The session reported its completion, with this final report message
   * (empty for a quiet completion), received at the launch time under a
   * fixed receipt unless the case states its receipt or receipt time.
   * @param {Omit<ReportFacts, "outcome"> & Partial<Pick<ReportFacts, "outcome">>} report
   */
  completedWith({ outcome = "completed", ...report }) {
    this.#outcome = { ...this.#outcome, completion: { ...report, outcome } };
    return this;
  }

  /** The developer read the session's final report. */
  withReportRead() {
    this.#outcome = { ...this.#outcome, reportRead: true };
    return this;
  }

  /**
   * The session's work landed on `main` at this revision, received under a
   * fixed receipt unless the case states the receipt the dashboard gave it,
   * naming the story it landed for when the case states one.
   * @param {string} revision a 40-character commit id
   * @param {{ receipt?: string, identity?: string }} [received]
   */
  landedAt(revision, { receipt, identity } = {}) {
    this.#outcome = {
      ...this.#outcome,
      landedRevision: revision,
      ...(receipt !== undefined && { landingReceipt: receipt }),
      ...(identity !== undefined && { landingIdentity: identity }),
    };
    return this;
  }

  /**
   * The captured landing, including the receipt, represented comparison and
   * collection date that drive this case.
   * @param {import("../../../dashboard/src/launchLanding.ts").LaunchLanding} landing
   */
  withCapturedLanding(landing) {
    this.#outcome = { ...this.#outcome, capturedLanding: landing };
    return this;
  }

  /**
   * The retained landing-reporting authority the store keeps beside the
   * launch, as the case states it.
   * @param {import("../../../dashboard/src/launchLanding.ts").LandingReporting} landingReporting
   */
  withLandingReporting(landingReporting) {
    this.#outcome = {
      ...this.#outcome,
      landingReporting: structuredClone(landingReporting),
    };
    return this;
  }

  // A fresh Done mark remains inside the machine store's retention window.
  // Cases about time use markedDoneAt instead, including later overrides.
  markedDone() {
    return this.markedDoneAt(new Date().toISOString());
  }

  /**
   * The developer marked the session Done at this time; `problem` is what a
   * native operation of that mark could not finish, kept beside it.
   * @param {string} at an ISO date-time
   * @param {{ problem?: string }} [native]
   */
  markedDoneAt(at, { problem } = {}) {
    this.#outcome = {
      ...this.#outcome,
      doneAt: at,
      ...(problem !== undefined && { doneProblem: problem }),
    };
    return this;
  }

  /**
   * The record fields of the stated outcome, received at `at`.
   * @param {string} at an ISO date-time
   */
  outcomeFacts(at) {
    const {
      completion,
      reportRead,
      landedRevision,
      landingReceipt,
      landingIdentity,
      capturedLanding,
      landingReporting,
      doneAt,
      doneProblem,
    } = this.#outcome;
    const report = completion && finalReport(completion, at);
    const landing =
      capturedLanding ??
      (landedRevision === undefined
        ? undefined
        : received(
            new LaunchLandingBuilder()
              .comparing({ base: "c3".repeat(20), revision: landedRevision })
              .receivedAt(at),
            landingReceipt,
            landingIdentity,
          ).please());
    if (reportRead && !report)
      throw new Error("only a launch that reported can have its report read");
    return {
      ...(report && { completion: report }),
      ...(reportRead && report && { reportRead: report.receipt }),
      ...(landing === undefined ? {} : { landing }),
      ...(landingReporting && {
        landingReporting: structuredClone(landingReporting),
      }),
      ...(doneAt !== undefined && { doneAt }),
      ...(doneProblem !== undefined && { doneProblem }),
    };
  }
}
