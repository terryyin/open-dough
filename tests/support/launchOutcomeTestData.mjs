// @ts-check
// What a kept launch records after it started, as the dashboard's machine
// store holds it: its final report, whether the developer read it, its
// landing and its Done mark, each with fixed receipts and references
// (`./launchTestData.mjs`). A final report can also be arranged on its own
// (`CompletionReportBuilder`).

/** @typedef {import("../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {import("../../dashboard/src/completionReport.ts").CompletionReport} CompletionReport */

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

const reportingReference = "22222222-2222-4222-8222-222222222222";

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
        landing: {
          repository: "open-dough",
          remote: "origin",
          target: "refs/heads/main",
          reference: reportingReference,
          delivery: "33333333-3333-4333-8333-333333333333",
          receipt: "44444444-4444-4444-8444-444444444444",
          base: "c3".repeat(20),
          revision: landedRevision,
          receivedAt: at,
        },
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
    return finalReport(this.#report, "2026-10-01T10:00:00.000Z");
  }
}
