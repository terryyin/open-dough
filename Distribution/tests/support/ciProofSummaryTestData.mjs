// @ts-check
// Domain data for one attempt's CI proof summary, as the collector writes
// it in the current version: its repository, the attempt it names (a GitHub
// Actions run attempt by its run id and attempt, or a CI adapter's attempt
// by its text attemptId), the revision that attempt tested, and its entries
// (`makeMe.aCiProofEntry`).
import { SUMMARY_SCHEMA_VERSION } from "../../src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs";

/** @typedef {import("../../../dashboard/src/ciProof.ts").CiProofEntry} CiProofEntry */
/** @typedef {Extract<import("../../../dashboard/src/ciProof.ts").CiProof, { kind: "summary" }>["summary"]} CiProofSummary */

export class CiProofSummaryBuilder {
  #repository = "owner/repo";
  /** @type {{ runId: number; runAttempt: number } | { attemptId: string }} */
  #attempt = { runId: 1, runAttempt: 1 };
  #revision = "0".repeat(40);
  /** @type {CiProofEntry[]} */
  #entries = [];

  /** @param {string} repository */
  inRepository(repository) {
    this.#repository = repository;
    return this;
  }

  /**
   * A GitHub Actions run attempt's summary: the run's id, its attempt, and
   * the revision it tested.
   * @param {{ runId: number; runAttempt: number; revision: string }} run
   */
  ofRun({ runId, runAttempt, revision }) {
    this.#attempt = { runId, runAttempt };
    this.#revision = revision;
    return this;
  }

  /**
   * A CI adapter's attempt's summary: its text attemptId and the revision
   * it tested.
   * @param {{ attemptId: string; revision: string }} attempt
   */
  ofAdapterAttempt({ attemptId, revision }) {
    this.#attempt = { attemptId };
    this.#revision = revision;
    return this;
  }

  /** @param {CiProofEntry[]} entries */
  withEntries(...entries) {
    this.#entries = entries;
    return this;
  }

  /** @returns {CiProofSummary} */
  please() {
    return {
      schemaVersion: /** @type {2} */ (SUMMARY_SCHEMA_VERSION),
      repository: this.#repository,
      revision: this.#revision,
      ...this.#attempt,
      entries: [...this.#entries],
    };
  }
}
