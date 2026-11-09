// @ts-check
// Domain data for CI proof summaries (the collector's "Units" in
// ../../src/skills/dough-test-optimization/scripts/ci-proof-evidence.mjs):
// one declared entry of a summary with its results in each unit — test
// cases, test files, or legacy results whose unit was only spelled — each
// unit's with one present part's figures, measured or without a duration,
// an optional file breakdown, and any further declared parts missing. A
// job's fragments are ./ciProofFragmentTestData.mjs's.

/** @typedef {import("../../dashboard/src/ciProof.ts").CiProofEntry} CiProofEntry */
/** @typedef {import("../../dashboard/src/ciProof.ts").CiProofEvidence} CiProofEvidence */
/** @typedef {import("../../dashboard/src/ciProof.ts").CiProofFile} CiProofFile */
/** @typedef {{ unit: "case" } | { unit: "file" } | { unit: "legacy", label: string | null }} CiProofUnitFacts */
/** @typedef {{ passed: number, failed: number, other: number }} Counts */

// One unit's results at an entry.
export class CiProofEvidenceBuilder {
  /** @type {CiProofUnitFacts} */
  #unit = { unit: "case" };
  /** @type {Counts} */
  #counts = { passed: 1, failed: 0, other: 0 };
  /** @type {number | undefined} */
  #durationMs;
  /** @type {CiProofFile[] | undefined} */
  #files;
  /** @type {number[]} */
  #missingParts = [];
  #untimed = 0;

  /**
   * Counted as test cases or test files.
   * @param {"case" | "file"} unit
   */
  inUnit(unit) {
    this.#unit = { unit };
    return this;
  }

  /**
   * Legacy results, their unit spelled LABEL (null: nothing said).
   * @param {string | null} label
   */
  legacy(label) {
    this.#unit = { unit: "legacy", label };
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
   * Its one part's summed test execution time; a measured zero included.
   * @param {number} durationMs
   */
  timed(durationMs) {
    this.#durationMs = durationMs;
    return this;
  }

  /**
   * Broken down by file into FILES, each counting nothing it does not
   * state, whose figures are then its counts and time.
   * @param {...(Pick<CiProofFile, "path"> & Partial<CiProofFile>)} files
   */
  brokenDown(...files) {
    this.#files = files.map((file) => ({
      passed: 0,
      failed: 0,
      other: 0,
      ...file,
    }));
    return this;
  }

  /**
   * Declared in further parts after its present one, PART missing.
   * @param {number} part
   */
  missingPart(part) {
    this.#missingParts.push(part);
    return this;
  }

  /** @param {number} count */
  withUntimed(count) {
    this.#untimed = count;
    return this;
  }

  /** @returns {CiProofEvidence} */
  please() {
    /** @type {CiProofEvidence["parts"]} */
    const missing = this.#missingParts.map((part) => ({
      part,
      status: "missing",
    }));
    const files = this.#files;
    if (files === undefined) {
      const timing =
        this.#durationMs === undefined ? {} : { durationMs: this.#durationMs };
      return {
        ...this.#unit,
        ...this.#counts,
        ...(this.#untimed === 0 ? {} : { untimed: this.#untimed }),
        ...timing,
        parts: [
          {
            part: 1,
            status: "present",
            ...this.#counts,
            ...(this.#untimed === 0 ? {} : { untimed: this.#untimed }),
            ...timing,
          },
          ...missing,
        ],
      };
    }
    const sum = (/** @type {(file: CiProofFile) => number} */ of) =>
      files.reduce((total, file) => total + of(file), 0);
    const counts = {
      passed: sum((file) => file.passed),
      failed: sum((file) => file.failed),
      other: sum((file) => file.other),
    };
    const timed = files.filter((file) => file.durationMs !== undefined);
    const figures = {
      ...counts,
      ...(timed.length === 0
        ? {}
        : { durationMs: sum((file) => file.durationMs ?? 0) }),
      untimed: this.#untimed + sum((file) => file.untimed ?? 0),
    };
    return {
      ...this.#unit,
      ...figures,
      parts: [
        { part: 1, status: "present", ...figures, breakdown: true },
        ...missing,
      ],
      files,
    };
  }
}

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
   * Its one unit's results: PASSED test cases, or of UNIT.
   * @param {number} passed
   * @param {"case" | "file"} [unit]
   */
  counting(passed, unit = "case") {
    this.#single.counting(passed).inUnit(unit);
    return this;
  }

  /**
   * Its one unit's part's summed test execution time.
   * @param {number} durationMs
   */
  timed(durationMs) {
    this.#single.timed(durationMs);
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

  /** @returns {CiProofEntry} */
  please() {
    return {
      path: this.#path,
      evidence: this.#evidence ?? [this.#single.please()],
    };
  }
}
