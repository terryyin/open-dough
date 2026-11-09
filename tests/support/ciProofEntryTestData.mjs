// @ts-check
// Domain data for one declared entry of a CI proof summary: its path and its
// results in each unit (./ciProofEvidenceTestData.mjs). An entry with one
// unit's results states them here directly; one with several holds each
// unit's built by `makeMe.aCiProofEvidence`. A job's fragments are
// ./ciProofFragmentTestData.mjs's; a whole summary is
// ./ciProofSummaryTestData.mjs's.
import { CiProofEvidenceBuilder } from "./ciProofEvidenceTestData.mjs";

/** @typedef {import("../../dashboard/src/ciProof.ts").CiProofEntry} CiProofEntry */
/** @typedef {import("../../dashboard/src/ciProof.ts").CiProofEvidence} CiProofEvidence */
/** @typedef {import("../../dashboard/src/ciProof.ts").CiProofFile} CiProofFile */
/** @typedef {import("./ciProofEvidenceTestData.mjs").ResultFacts} ResultFacts */

// One declared entry of a summary: one unit's results, or several.
export class CiProofEntryBuilder {
  #path = "tests";
  #single = new CiProofEvidenceBuilder();
  /** @type {CiProofEvidence[] | undefined} */
  #evidence;

  /** @param {string} path */
  at(path) {
    this.#path = path;
    return this;
  }

  /**
   * Its one unit's results: PASSED test cases, or of UNIT when stated.
   * @param {number} passed
   * @param {"case" | "file"} [unit]
   */
  counting(passed, unit) {
    this.#single.counting(passed);
    if (unit !== undefined) this.#single.inUnit(unit);
    return this;
  }

  /**
   * Its one unit's results are legacy ones, their unit spelled LABEL, such
   * as Playwright `tests` or shell `checks`.
   * @param {string | null} label
   */
  countingIn(label) {
    this.#single.legacy(label);
    return this;
  }

  /**
   * Its one unit's first present part's summed test execution time.
   * @param {number} durationMs
   */
  timed(durationMs) {
    this.#single.timed(durationMs);
    return this;
  }

  /**
   * A test file of its one unit's breakdown, at PATH inside the entry.
   * @param {string} path
   * @param {ResultFacts} [facts]
   */
  withFile(path, facts) {
    this.#single.withFile(path, facts);
    return this;
  }

  /**
   * Results of its one unit its reports could not place in a file.
   * @param {ResultFacts} facts
   */
  withUnassigned(facts) {
    this.#single.withUnassigned(facts);
    return this;
  }

  /**
   * One more present part of its one unit, reported without a breakdown.
   * @param {ResultFacts} facts
   */
  withUnbrokenPart(facts) {
    this.#single.withUnbrokenPart(facts);
    return this;
  }

  /**
   * Its one unit's OF declared parts, those in MISSING never reported and
   * those in AMBIGUOUS more than once.
   * @param {number} of
   * @param {{ missing?: readonly number[], ambiguous?: readonly number[] }} [statuses]
   */
  inParts(of, statuses) {
    this.#single.inParts(of, statuses);
    return this;
  }

  /** @param {CiProofFile[]} files */
  brokenDownBy(files) {
    this.#single.brokenDown(...files);
    return this;
  }

  /** @param {...number} parts */
  missingParts(...parts) {
    for (const part of parts) this.#single.missingPart(part);
    return this;
  }

  /** @param {number} count */
  withUntimed(count) {
    this.#single.withUntimed(count);
    return this;
  }

  /**
   * Its results in each unit, in order (`makeMe.aCiProofEvidence`).
   * @param {...CiProofEvidence} evidence
   */
  holding(...evidence) {
    this.#evidence = evidence;
    return this;
  }

  /** @returns {CiProofEntry} */
  please() {
    return {
      path: this.#path,
      evidence: this.#evidence ?? [this.#single.please()],
    };
  }
}
