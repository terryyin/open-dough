// @ts-check
// What a session submits to report its completion, as the dashboard's
// completion admission (`../../dashboard/server/completionAdmission.ts`)
// receives it. The report the store keeps is `./launchOutcomeTestData.mjs`'s.

import { reportingReference } from "./launchLandingTestData.mjs";

/** @typedef {import("../../dashboard/server/completionAdmission.ts").CompletionSubmission} CompletionSubmission */

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
