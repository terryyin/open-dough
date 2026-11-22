// @ts-check
// A scope's retained test execution time history as the glance read answers
// it (dashboard/src/ciScopeHistory.ts `ScopeHistoryGlance`): its builds on
// consecutive November days, the selected build last, each measured in test
// cases and test files, and the prior-build figures the read states for each
// unit. Node-free.

import { referenceFiguresOf } from "./priorBuildReferenceFiguresTestData.mjs";

/** @typedef {import("../../../dashboard/src/ciScopeHistory.ts").ScopeHistoryGlance} ScopeHistoryGlance */
/** @typedef {import("../../../dashboard/src/ciScopeHistory.ts").ScopeGlanceEntry} ScopeGlanceEntry */
/** @typedef {"case" | "file"} Unit */
/** @typedef {{ priors: readonly (number | "failed")[]; selectedMs: number; reference: import("./priorBuildReferenceFiguresTestData.mjs").StatedReference }} UnitTimings */

const units = /** @type {const} */ (["case", "file"]);
const dateOf = (/** @type {number} */ day) =>
  `2026-11-${String(day).padStart(2, "0")}T10:00:00Z`;
const signedMs = (/** @type {number} */ ms) =>
  `${ms < 0 ? "−" : "+"}${String(Math.round(Math.abs(ms)))} ms`;

// A retained history at "dashboard/tests" whose units the steps state; a
// unit's figures state too few prior builds to average unless `averaging`
// says otherwise. Plain facts go through `with`.
export class ScopeHistoryGlanceBuilder {
  #path = "dashboard/tests";
  /** @type {Partial<Record<Unit, UnitTimings>>} */
  #units = {};

  /** @param {ScopeHistoryGlance} facts */
  with(facts) {
    return { please: () => ({ ...facts }) };
  }

  /** @param {string} path the scope: an entry, folder or file */
  at(path) {
    this.#path = path;
    return this;
  }

  // UNIT's prior builds, oldest first, by timing or "failed", then the
  // selected build's timing. Every stated unit fails at the same builds.
  /**
   * @param {Unit} unit
   * @param {readonly (number | "failed")[]} priors
   * @param {number} selectedMs
   */
  timing(unit, priors, selectedMs) {
    this.#units[unit] = {
      priors,
      selectedMs,
      reference: { sampleCount: priors.filter((ms) => ms !== "failed").length },
    };
    return this;
  }

  // The prior-build average the read states for UNIT, over the builds used.
  /**
   * @param {Unit} unit
   * @param {number} ms
   * @param {number} used
   */
  averaging(unit, ms, used) {
    return this.#referring(unit, { sampleCount: used, averageMs: ms });
  }

  /** @param {Unit} unit @param {number} used */
  tooFewToAverage(unit, used) {
    return this.#referring(unit, { sampleCount: used });
  }

  /** @param {Unit} unit @param {UnitTimings["reference"]} reference */
  #referring(unit, reference) {
    const timings = this.#units[unit];
    if (timings === undefined) throw new Error(`State ${unit} timing first`);
    this.#units[unit] = { ...timings, reference };
    return this;
  }

  /** @param {string} selectedRevision the endpoint the history reads through */
  through(selectedRevision) {
    const stated = units.flatMap((unit) => {
      const timings = this.#units[unit];
      return timings === undefined ? [] : [{ unit, ...timings }];
    });
    const [first] = stated;
    if (first === undefined) throw new Error("State a unit's timing");
    const count = first.priors.length + 1;
    const msOf = (
      /** @type {UnitTimings} */ timings,
      /** @type {number} */ index,
    ) => (index === count - 1 ? timings.selectedMs : timings.priors[index]);
    /** @type {ScopeGlanceEntry[]} */
    const entries = Array.from({ length: count }, (...[, index]) => {
      const selected = index === count - 1;
      const build = {
        key: `run/${String(index + 1)}/1`,
        date: dateOf(index + 1),
        selected,
        landings: [{ selected, provenance: /** @type {const} */ ("exact") }],
      };
      if (msOf(first, index) === "failed") {
        const gap = {
          status: /** @type {const} */ ("failed"),
          reason: "Failed CI build",
        };
        return {
          ...build,
          kind: "gap",
          gap,
          readings: stated.map(({ unit }) => ({ kind: "gap", unit, ...gap })),
        };
      }
      return {
        ...build,
        kind: "point",
        readings: stated.map((timings) => ({
          kind: "point",
          unit: timings.unit,
          ms: Number(msOf(timings, index)),
          segment: `${timings.unit}/1`,
        })),
      };
    });
    /** @type {ScopeHistoryGlance} */
    const history = {
      path: this.#path,
      selectedRevision,
      availability: "retained",
      entries,
      references: stated.map(({ unit, selectedMs, reference }) => ({
        unit,
        reference: {
          endpoint: selectedRevision,
          selected: {
            key: `run/${String(count)}/1`,
            date: dateOf(count),
            ms: selectedMs,
          },
          ...referenceFiguresOf(reference, selectedMs, signedMs),
        },
      })),
    };
    return { please: () => history };
  }
}
