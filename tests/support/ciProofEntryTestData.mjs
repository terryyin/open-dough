// @ts-check
// Domain data for one entry of a CI proof summary: its path, what it counts,
// and its declared parts. Without a file breakdown its one present part
// carries its figures, measured or without a duration. With one, its files,
// and any results not placed in a file, carry the first present part's
// figures, and every part reported by file says it was broken down. A part
// may also be reported without a breakdown, never reported (missing), or
// reported more than once (ambiguous); the entry's figures sum its present
// parts, as the collector writes them.
/** @typedef {import("../../dashboard/src/ciProof.ts").CiProofEntry} CiProofEntry */
/** @typedef {import("../../dashboard/src/ciProof.ts").CiProofFigures} CiProofFigures */
/** @typedef {import("../../dashboard/src/ciProof.ts").CiProofPart} CiProofPart */

/**
 * What a file or block of results counted, and their summed time when they
 * recorded one: one passed case unless stated. `untimed` defaults to every
 * case without a duration, and to none with one.
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

export class CiProofEntryBuilder {
  #path = "tests";
  #unit = "tests";
  #passed = 1;
  /** @type {number | undefined} */
  #durationMs;
  #of = 1;
  /** @type {readonly number[]} */
  #missing = [];
  /** @type {readonly number[]} */
  #ambiguous = [];
  /** @type {(CiProofFigures & { path: string })[]} */
  #files = [];
  /** @type {CiProofFigures | undefined} */
  #unassigned;
  /** @type {CiProofFigures[]} */
  #unbroken = [];

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
   * What its runner counts, such as Playwright `tests` or shell `checks`.
   * @param {string} unit
   */
  countingIn(unit) {
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

  /** @returns {CiProofEntry} */
  please() {
    const unassigned = this.#unassigned;
    const brokenDown = this.#files.length > 0 || unassigned !== undefined;
    const timing =
      this.#durationMs === undefined ? {} : { durationMs: this.#durationMs };
    /** @type {CiProofFigures} */
    const first = brokenDown
      ? summed([...this.#files, ...(unassigned ? [unassigned] : [])])
      : { passed: this.#passed, failed: 0, other: 0, ...timing };
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
    return this.#entry(parts, present, brokenDown);
  }

  /**
   * @param {CiProofPart[]} parts
   * @param {readonly CiProofFigures[]} present
   * @param {boolean} brokenDown
   * @returns {CiProofEntry}
   */
  #entry(parts, present, brokenDown) {
    const totals = summed(present);
    const anyUntimed = present.some((figures) => figures.untimed !== undefined);
    const { untimed, ...figures } = totals;
    const unassigned = this.#unassigned;
    return {
      path: this.#path,
      unit: present.length === 0 ? null : this.#unit,
      ...figures,
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
