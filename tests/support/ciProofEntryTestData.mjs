// @ts-check
// Domain data for one entry of a CI proof summary: its path, what it counts,
// and its one present part's figures, measured or without a duration.
/** @typedef {import("../../dashboard/src/ciProof.ts").CiProofEntry} CiProofEntry */

export class CiProofEntryBuilder {
  #path = "tests";
  #unit = "tests";
  #passed = 1;
  /** @type {number | undefined} */
  #durationMs;

  /** @param {string} path */
  at(path) {
    this.#path = path;
    return this;
  }

  /**
   * @param {number} passed
   * @param {string} [unit]
   */
  counting(passed, unit = "tests") {
    this.#passed = passed;
    this.#unit = unit;
    return this;
  }

  /**
   * Its one part's summed test execution time; a measured zero included.
   * @param {number} durationMs
   */
  timed(durationMs) {
    this.#durationMs = durationMs;
    return this;
  }

  /** @returns {CiProofEntry} */
  please() {
    const figures = { passed: this.#passed, failed: 0, other: 0 };
    const timing =
      this.#durationMs === undefined ? {} : { durationMs: this.#durationMs };
    return {
      path: this.#path,
      unit: this.#unit,
      ...figures,
      ...timing,
      parts: [{ part: 1, status: "present", ...figures, ...timing }],
    };
  }
}
