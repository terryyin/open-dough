// @ts-check
// Domain data for CI proof fragments
// (../../src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs):
// the fragment a job's report gives one entry for one part of an attempt,
// in its unit, with its counts and optional time.
import { fragment } from "../../src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs";

/** @typedef {import("./ciProofEvidenceTestData.mjs").CiProofUnitFacts} CiProofUnitFacts */
/** @typedef {import("./ciProofEvidenceTestData.mjs").Counts} Counts */

// One fragment, as the collector's own constructor writes it, of a GitHub
// Actions run attempt unless an adapter attempt is named.
export class CiProofFragmentBuilder {
  #entry = "tests";
  /** @type {CiProofUnitFacts} */
  #unit = { unit: "case" };
  #part = 1;
  #of = 1;
  /** @type {{ attempt: number } | { attemptId: string }} */
  #attempt = { attempt: 1 };
  #revision = "a".repeat(40);
  /** @type {Counts} */
  #counts = { passed: 1, failed: 0, other: 0 };
  /** @type {Record<string, unknown>} */
  #extras = {};

  /** @param {string} entry */
  at(entry) {
    this.#entry = entry;
    return this;
  }

  /**
   * Counted as test cases or test files.
   * @param {"case" | "file"} unit
   */
  inUnit(unit) {
    this.#unit = { unit };
    return this;
  }

  /**
   * Legacy results, their unit spelled LABEL.
   * @param {string} label
   */
  legacy(label) {
    this.#unit = { unit: "legacy", label };
    return this;
  }

  /**
   * Part PART of OF.
   * @param {number} part
   * @param {number} of
   */
  part(part, of) {
    this.#part = part;
    this.#of = of;
    return this;
  }

  /**
   * Of a GitHub Actions run's ATTEMPT at REVISION.
   * @param {number} attempt
   * @param {string} revision
   */
  ofAttempt(attempt, revision) {
    this.#attempt = { attempt };
    this.#revision = revision;
    return this;
  }

  /**
   * Of a CI adapter's attempt ATTEMPT_ID at REVISION.
   * @param {string} attemptId
   * @param {string} revision
   */
  ofAdapterAttempt(attemptId, revision) {
    this.#attempt = { attemptId };
    this.#revision = revision;
    return this;
  }

  /**
   * @param {number} passed
   * @param {number} [failed]
   * @param {number} [other]
   */
  counting(passed, failed = 0, other = 0) {
    this.#counts = { passed, failed, other };
    return this;
  }

  /**
   * Its summed test execution time; a measured zero included.
   * @param {number} durationMs
   */
  timed(durationMs) {
    this.#extras = { ...this.#extras, durationMs };
    return this;
  }

  please() {
    return fragment(
      {
        part: this.#part,
        of: this.#of,
        ...this.#attempt,
        revision: this.#revision,
      },
      this.#entry,
      this.#unit,
      this.#counts,
      this.#extras,
    );
  }
}
