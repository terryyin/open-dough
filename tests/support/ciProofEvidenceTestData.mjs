// @ts-check
// Domain data for one unit's results at a CI proof summary entry (the
// collector's "Units", ../../src/skills/dough-test-optimization/scripts/
// ci-proof-evidence.mjs): test cases, test files, or legacy results. Its
// first present part carries its figures, or, broken down, its files' and
// unplaced results'; other parts may be present without a breakdown,
// missing or ambiguous, and the figures sum the present parts, as the
// collector writes them. Its entry is ./ciProofEntryTestData.mjs's.
/** @typedef {import("../../dashboard/src/ciProof.ts").CiProofEvidence} CiProofEvidence */
/** @typedef {import("../../dashboard/src/ciProof.ts").CiProofFigures} CiProofFigures */
/** @typedef {import("../../dashboard/src/ciProof.ts").CiProofFile} CiProofFile */
/** @typedef {import("../../dashboard/src/ciProof.ts").CiProofPart} CiProofPart */
/** @typedef {{ unit: "case" } | { unit: "file" } | { unit: "legacy", label: string | null }} CiProofUnitFacts */
/** @typedef {{ passed: number, failed: number, other: number }} Counts */

/**
 * What a file or block of results counted, and their summed time when they
 * recorded one: one passed result unless stated. `untimed` defaults to every
 * result without a duration, and to none with one.
 * @typedef {{
 *   passed?: number, failed?: number, other?: number,
 *   durationMs?: number, untimed?: number,
 * }} ResultFacts
 */

/**
 * @param {ResultFacts} facts
 * @returns {CiProofFigures}
 */
function figuresOf({ passed = 1, failed = 0, other = 0, durationMs, untimed }) {
  const notTimed =
    untimed ?? (durationMs === undefined ? passed + failed + other : 0);
  return {
    passed,
    failed,
    other,
    ...(durationMs === undefined ? {} : { durationMs }),
    ...(notTimed > 0 ? { untimed: notTimed } : {}),
  };
}

/** @param {readonly number[]} values */
const sum = (values) => values.reduce((total, value) => total + value, 0);

/**
 * FIGURES summed, with untimed always stated, as a part reported by file
 * carries them.
 * @param {readonly CiProofFigures[]} figures
 * @returns {CiProofFigures & { untimed: number }}
 */
function summed(figures) {
  const durations = figures.flatMap(({ durationMs }) =>
    durationMs === undefined ? [] : [durationMs],
  );
  return {
    passed: sum(figures.map(({ passed }) => passed)),
    failed: sum(figures.map(({ failed }) => failed)),
    other: sum(figures.map(({ other }) => other)),
    ...(durations.length === 0 ? {} : { durationMs: sum(durations) }),
    untimed: sum(figures.map(({ untimed = 0 }) => untimed)),
  };
}

// One unit's results at an entry.
export class CiProofEvidenceBuilder {
  /** @type {CiProofUnitFacts} */
  #unit = { unit: "case" };
  /** @type {Counts} */
  #counts = { passed: 1, failed: 0, other: 0 };
  /** @type {number | undefined} */
  #durationMs;
  #of = 1;
  /** @type {number[]} */
  #missing = [];
  /** @type {number[]} */
  #ambiguous = [];
  /** @type {CiProofFile[]} */
  #files = [];
  /** @type {CiProofFigures | undefined} */
  #unassigned;
  /** @type {CiProofFigures[]} */
  #unbroken = [];

  /**
   * Counted as test cases or test files.
   * @param {"case" | "file"} unit
   */
  inUnit(unit) {
    this.#unit = { unit };
    return this;
  }

  /**
   * Legacy results, their unit spelled LABEL (null: nothing said), such as
   * Playwright `tests` or shell `checks`.
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
   * Its first present part's summed test execution time; a measured zero
   * included.
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
   * A test file of its breakdown, at PATH inside the entry.
   * @param {string} path
   * @param {ResultFacts} [facts]
   */
  withFile(path, facts = {}) {
    this.#files.push({ path, ...figuresOf(facts) });
    return this;
  }

  /**
   * Results its reports could not place in a file.
   * @param {ResultFacts} facts
   */
  withUnassigned(facts) {
    this.#unassigned = figuresOf(facts);
    return this;
  }

  /**
   * One more present part, after the others, reported without a breakdown.
   * @param {ResultFacts} facts
   */
  withUnbrokenPart(facts) {
    this.#unbroken.push(figuresOf(facts));
    return this;
  }

  /**
   * OF declared parts, besides any reported without a breakdown: those
   * numbered in MISSING were never reported, and those in AMBIGUOUS more
   * than once.
   * @param {number} of
   * @param {{ missing?: readonly number[], ambiguous?: readonly number[] }} [statuses]
   */
  inParts(of, { missing = [], ambiguous = [] } = {}) {
    this.#of = of;
    this.#missing = [...missing];
    this.#ambiguous = [...ambiguous];
    return this;
  }

  /**
   * Declared in a further part, PART, never reported.
   * @param {number} part
   */
  missingPart(part) {
    this.#of = Math.max(this.#of, part);
    this.#missing.push(part);
    return this;
  }

  /** @returns {CiProofEvidence} */
  please() {
    const unassigned = this.#unassigned;
    const brokenDown = this.#files.length > 0 || unassigned !== undefined;
    const timing =
      this.#durationMs === undefined ? {} : { durationMs: this.#durationMs };
    /** @type {CiProofFigures} */
    const first = brokenDown
      ? summed([...this.#files, ...(unassigned ? [unassigned] : [])])
      : { ...this.#counts, ...timing };
    /** @type {CiProofFigures} */
    const empty = {
      passed: 0,
      failed: 0,
      other: 0,
      ...(first.durationMs === undefined ? {} : { durationMs: 0 }),
      ...(brokenDown ? { untimed: 0 } : {}),
    };
    /** @type {CiProofPart[]} */
    const parts = [];
    /** @type {CiProofFigures[]} */
    const present = [];
    for (let part = 1; part <= this.#of; part += 1) {
      if (this.#missing.includes(part)) parts.push({ part, status: "missing" });
      else if (this.#ambiguous.includes(part))
        parts.push({ part, status: "ambiguous" });
      else {
        const figures = present.length === 0 ? first : empty;
        present.push(figures);
        parts.push({
          part,
          status: "present",
          ...figures,
          ...(brokenDown ? { breakdown: /** @type {const} */ (true) } : {}),
        });
      }
    }
    for (const figures of this.#unbroken) {
      present.push(figures);
      parts.push({ part: parts.length + 1, status: "present", ...figures });
    }
    const { untimed, ...totals } = summed(present);
    const anyUntimed = present.some((figures) => figures.untimed !== undefined);
    return {
      ...this.#unit,
      ...totals,
      ...(anyUntimed ? { untimed } : {}),
      parts,
      ...(brokenDown
        ? {
            files: [...this.#files].sort((one, other) =>
              one.path < other.path ? -1 : 1,
            ),
          }
        : {}),
      ...(unassigned ? { unassigned } : {}),
    };
  }
}
