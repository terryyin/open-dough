// @ts-check
// A session's final report as the store keeps it (`CompletionReportBuilder`).
// A launch records that report among its post-start facts in
// `./launchOutcomeTestData.mjs`; a session submits one with
// `./completionSubmissionTestData.mjs`.

import {
  fixedReceivedAt,
  reportingReference,
} from "./launchLandingTestData.mjs";

/** @typedef {import("../../dashboard/src/completionReport.ts").CompletionReport} CompletionReport */

/**
 * The facts a final report states: its outcome and message, and, when they
 * drive the case, the receipt it was received under, when, and the reporting
 * reference and delivery it names.
 * @typedef {Pick<CompletionReport, "outcome" | "message"> & Partial<Pick<CompletionReport, "receipt" | "receivedAt" | "reference" | "delivery">>} ReportFacts
 */

/**
 * A final report received at `receivedAt` unless it states its own time,
 * under a fixed receipt unless it states its own, for the launch's fixed
 * reporting reference unless stated.
 * @param {ReportFacts} report
 * @param {string} at an ISO date-time
 * @returns {CompletionReport}
 */
export function finalReport(
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

// A session's final report as the store keeps it: `completed` with no
// message (a quiet completion), under a fixed receipt for the launch's fixed
// reporting reference, received at a fixed instant, unless the case states
// otherwise. Cases that read more than one report state distinct receipts.
export class CompletionReportBuilder {
  /** @type {ReportFacts} */
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
