// @ts-check
// What a kept launch records after it started, as the dashboard's machine
// store holds it: its final report, whether the developer read it, its
// landing and its Done mark, each with fixed receipts and references
// (`./launchTestData.mjs`). A final report can also be arranged on its own
// (`CompletionReportBuilder`), as can the submission a session reports it
// with (`CompletionSubmissionBuilder`). The landing is the evidence
// `./launchLandingEvidenceTestData.mjs` describes.

import { LaunchLandingBuilder } from "./launchLandingEvidenceTestData.mjs";
import {
  fixedReceivedAt,
  reportingReference,
} from "./launchLandingTestData.mjs";

/** @typedef {import("../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {import("../../dashboard/src/completionReport.ts").CompletionReport} CompletionReport */
/** @typedef {import("../../dashboard/server/completionAdmission.ts").CompletionSubmission} CompletionSubmission */

/**
 * The facts a final report states: its outcome and message, and, when they
 * drive the case, the receipt it was received under and when.
 * @typedef {Pick<CompletionReport, "outcome" | "message"> & Partial<Pick<CompletionReport, "receipt" | "receivedAt">>} ReportFacts
 */

/**
 * The facts a launch states after it started: the final report, whether the developer read
 * it, the revision the work landed at, and when the developer marked the
 * session Done.
 * @typedef {{
 *   completion?: ReportFacts,
 *   reportRead?: boolean,
 *   landedRevision?: string,
 *   doneAt?: string,
 * }} LaunchOutcome
 */

/**
 * A final report received at `receivedAt` unless it states its own time,
 * under a fixed receipt unless it states its own, for the launch's fixed
 * reporting reference unless stated.
 * @param {ReportFacts & Partial<Pick<CompletionReport, "reference" | "delivery">>} report
 * @param {string} at an ISO date-time
 * @returns {CompletionReport}
 */
function finalReport(
  {
    delivery,
    receipt = "11111111-1111-4111-8111-111111111111",
    reference = reportingReference,
    outcome,
    message,
    receivedAt,
  },
  at,
) {
  return {
    ...(delivery && { delivery }),
    receipt,
    reference,
    outcome,
    message,
    receivedAt: receivedAt ?? at,
  };
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
   * The session's work landed on `main` at this revision.
   * @param {string} revision a 40-character commit id
   */
  landedAt(revision) {
    this.#outcome = { ...this.#outcome, landedRevision: revision };
    return this;
  }

  /**
   * The developer marked the session Done at this time.
   * @param {string} at an ISO date-time
   */
  markedDoneAt(at) {
    this.#outcome = { ...this.#outcome, doneAt: at };
    return this;
  }

  /**
   * The record fields of the stated outcome, received at `at`.
   * @param {string} at an ISO date-time
   */
  outcomeFacts(at) {
    const { completion, reportRead, landedRevision, doneAt } = this.#outcome;
    const report = completion && finalReport(completion, at);
    if (reportRead && !report)
      throw new Error("only a launch that reported can have its report read");
    return {
      ...(report && { completion: report }),
      ...(reportRead && report && { reportRead: report.receipt }),
      ...(landedRevision && {
        landing: new LaunchLandingBuilder()
          .comparing({ base: "c3".repeat(20), revision: landedRevision })
          .receivedAt(at)
          .please(),
      }),
      ...(doneAt !== undefined && { doneAt }),
    };
  }
}

// A session's final report as the store keeps it: `completed` with no
// message (a quiet completion), under a fixed receipt for the launch's fixed
// reporting reference, received at a fixed instant, unless the case states
// otherwise. Cases that read more than one report state distinct receipts.
export class CompletionReportBuilder {
  /** @type {ReportFacts & Partial<Pick<CompletionReport, "reference" | "delivery">>} */
  #report = { outcome: "completed", message: "" };

  /** @param {string} message the final report message */
  saying(message) {
    this.#report = { ...this.#report, message };
    return this;
  }

  /** @param {CompletionReport["outcome"]} outcome */
  withOutcome(outcome) {
    this.#report = { ...this.#report, outcome };
    return this;
  }

  /** @param {string} receipt the receipt the dashboard gave this report */
  withReceipt(receipt) {
    this.#report = { ...this.#report, receipt };
    return this;
  }

  /**
   * The launch's reporting reference, and the delivery that carried the
   * report when the case keeps it.
   * @param {{ reference: string, delivery?: string }} reporting
   */
  reportedFor({ reference, delivery }) {
    this.#report = {
      ...this.#report,
      reference,
      ...(delivery && { delivery }),
    };
    return this;
  }

  /** @param {string} at an ISO date-time */
  receivedAt(at) {
    this.#report = { ...this.#report, receivedAt: at };
    return this;
  }

  /** @returns {CompletionReport} */
  please() {
    return finalReport(this.#report, fixedReceivedAt);
  }
}

// What a session submits to report its completion: a quiet completion
// (`completed` with no message) for the launch's fixed reporting reference
// from `open-dough` on Codex, claiming no native session and starting a new
// delivery, unless the case states otherwise. The dashboard answers it with a
// delivery receipt; it is not the report the store keeps.
export class CompletionSubmissionBuilder {
  /** @type {CompletionSubmission} */
  #submission = {
    source: "open-dough",
    host: "codex",
    reference: reportingReference,
    outcome: "completed",
    message: "",
  };

  /**
   * The accepted launch it reports for: its host and reporting reference.
   * @param {Pick<CompletionSubmission, "host" | "reference">} launch
   */
  reportingFor(launch) {
    this.#submission = { ...this.#submission, ...launch };
    return this;
  }

  /** @param {string} session the native session the submitter claims to be */
  fromSession(session) {
    this.#submission = { ...this.#submission, session };
    return this;
  }

  /** @param {string} delivery the earlier delivery this submission retries */
  retrying(delivery) {
    this.#submission = { ...this.#submission, delivery };
    return this;
  }

  /** @param {CompletionSubmission["outcome"]} outcome */
  withOutcome(outcome) {
    this.#submission = { ...this.#submission, outcome };
    return this;
  }

  /** @param {string} message the final report message */
  saying(message) {
    this.#submission = { ...this.#submission, message };
    return this;
  }

  /** @returns {CompletionSubmission} */
  please() {
    return { ...this.#submission };
  }
}
