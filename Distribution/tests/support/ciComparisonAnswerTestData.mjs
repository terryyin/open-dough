// @ts-check
// Retained builds, comparison slots, proof subjects, and authenticated CI
// proof endpoint answers for Intent comparison and landed-history setup.
// Call sites name revision, run or adapter attempt, and proof; incidental
// defaults stay absent. Keep collector fragment values and deliberately
// invalid wire inputs literal at the call site.
import { copyFacts } from "./factBuilder.mjs";

/**
 * @template {object} Facts
 * @typedef {import("./factBuilder.mjs").FactBuilder<Facts>} FactBuilder
 */

/** @typedef {import("../../../dashboard/server/landedCiHistoryStore.ts").ProjectHistory} ProjectHistory */
/** @typedef {ProjectHistory["builds"][string]} KeptBuild */
/** @typedef {import("../../../dashboard/src/storyCiComparison.ts").StoryCiComparisonSlot} StoryCiComparisonSlot */
/** @typedef {import("../../../dashboard/server/intentCiProofRead.ts").IntentCiProofAnswer} IntentCiProofAnswer */
/** @typedef {import("../../../dashboard/src/ciProof.ts").CiProofRun} CiProofRun */
/** @typedef {import("../../../dashboard/src/ciProof.ts").CiAdapterProofAttempt} CiAdapterProofAttempt */
/** @typedef {import("../../../dashboard/server/unusableBuild.ts").UnusableBuild} UnusableBuild */

// Incidental attempt-start timing for a retained build when the case does
// not state timingBasis (including an explicit undefined). Shared with
// LandedCiHistoryBuilder.recording / #built.
/** @type {NonNullable<KeptBuild["timingBasis"]>} */
export const attemptTimingBasis = "attempt-start";

/**
 * Collector / artifact proof run identity (`ProofRun`): repository, run id,
 * attempt number, and revision. Distinct from `CiProofRun`'s `runAttempt`.
 * @typedef {{
 *   repository: string,
 *   runId: number,
 *   attempt: number,
 *   revision: string,
 * }} CiProofCollectorRun
 */

/**
 * Collector / artifact adapter attempt identity (`AdapterProofAttempt`).
 * @typedef {{
 *   repository: string,
 *   attemptId: string,
 *   revision: string,
 * }} AdapterProofCollectorAttempt
 */

/**
 * CI time without runner waits equal to the attempt's wall interval, when
 * start and completion are present. Specs that assert an absent measure must
 * name `timeWithoutRunnerWaits` explicitly (including `undefined` to omit it).
 * @param {Pick<KeptBuild, "startedAt" | "completedAt">} build
 * @returns {KeptBuild["timeWithoutRunnerWaits"] | undefined}
 */
export function wallIntervalMeasureOf(build) {
  const { startedAt, completedAt } = build;
  if (startedAt === undefined || completedAt === undefined) return undefined;
  const milliseconds = Date.parse(completedAt) - Date.parse(startedAt);
  return Number.isFinite(milliseconds) && milliseconds >= 0
    ? { milliseconds }
    : undefined;
}

/**
 * When `stated` does not name `timeWithoutRunnerWaits`, a passed build keeps
 * the wall interval as that measure so history specs that only rename the
 * measure stay numeric. Naming the field (including `undefined`) wins.
 * @template {KeptBuild} Build
 * @param {object} stated
 * @param {Build} build
 * @returns {Build}
 */
export function withDefaultWallIntervalMeasure(stated, build) {
  if (
    "timeWithoutRunnerWaits" in stated ||
    build.state !== "pass" ||
    build.timeWithoutRunnerWaits !== undefined
  )
    return build;
  const measure = wallIntervalMeasureOf(build);
  return measure === undefined
    ? build
    : /** @type {Build} */ ({ ...build, timeWithoutRunnerWaits: measure });
}

export class KeptBuildBuilder {
  /**
   * Stated retained-build facts; attempt-start timing is incidental unless
   * the case overrides or clears `timingBasis`. A passed build whose case
   * does not name `timeWithoutRunnerWaits` keeps the wall interval as that
   * measure so history specs that only rename the measure stay numeric.
   * @template {KeptBuild} Facts @param {Facts} facts
   */
  with(facts) {
    return {
      please: () =>
        withDefaultWallIntervalMeasure(
          facts,
          /** @type {Facts} */ ({
            timingBasis: attemptTimingBasis,
            ...facts,
          }),
        ),
    };
  }
}

// Generic builders (not FactBuilder<Union>) so call-site Facts stay narrowed
// through please() for discriminated slot and proof-answer unions.
export class StoryCiComparisonSlotBuilder {
  /** @template {StoryCiComparisonSlot} Facts @param {Facts} facts */
  with(facts) {
    return copyFacts(facts);
  }
}

export class IntentCiProofAnswerBuilder {
  /** @template {IntentCiProofAnswer} Facts @param {Facts} facts */
  with(facts) {
    return copyFacts(facts);
  }
}

/**
 * @typedef {object} CiComparisonAnswerMakeMe
 * @property {KeptBuildBuilder} aKeptBuild
 * @property {StoryCiComparisonSlotBuilder} aStoryCiComparisonSlot
 * @property {IntentCiProofAnswerBuilder} anIntentCiProofAnswer
 * @property {FactBuilder<CiProofRun>} aCiProofRun
 * @property {FactBuilder<CiAdapterProofAttempt>} aCiAdapterProofAttempt
 * @property {FactBuilder<CiProofCollectorRun>} aCiProofCollectorRun
 * @property {FactBuilder<AdapterProofCollectorAttempt>} anAdapterProofCollectorAttempt
 * @property {FactBuilder<UnusableBuild>} anUnusableBuild
 */

/** @returns {PropertyDescriptorMap} */
export function ciComparisonAnswerMakeMeProperties() {
  return {
    aKeptBuild: {
      enumerable: true,
      get() {
        return new KeptBuildBuilder();
      },
    },
    aStoryCiComparisonSlot: {
      enumerable: true,
      get() {
        return new StoryCiComparisonSlotBuilder();
      },
    },
    anIntentCiProofAnswer: {
      enumerable: true,
      get() {
        return new IntentCiProofAnswerBuilder();
      },
    },
    aCiProofRun: {
      enumerable: true,
      /** @returns {FactBuilder<CiProofRun>} */
      get() {
        return { with: copyFacts };
      },
    },
    aCiAdapterProofAttempt: {
      enumerable: true,
      /** @returns {FactBuilder<CiAdapterProofAttempt>} */
      get() {
        return { with: copyFacts };
      },
    },
    aCiProofCollectorRun: {
      enumerable: true,
      /** @returns {FactBuilder<CiProofCollectorRun>} */
      get() {
        return { with: copyFacts };
      },
    },
    anAdapterProofCollectorAttempt: {
      enumerable: true,
      /** @returns {FactBuilder<AdapterProofCollectorAttempt>} */
      get() {
        return { with: copyFacts };
      },
    },
    anUnusableBuild: {
      enumerable: true,
      /** @returns {FactBuilder<UnusableBuild>} */
      get() {
        return { with: copyFacts };
      },
    },
  };
}
