// @ts-check
// A project's landed CI history as the local authenticated read answers it
// (`dashboard/src/landedCiHistory.ts`): its entries in the order the case
// adds them, oldest first, each a measured build or a landing's gap. A build
// is a run's first attempt, linked under ci.invalid by its run, measuring
// its own landing (exact) at its start unless the case states otherwise, and
// carries a measure only when the case names one, as a wall-time reader's
// answer does.
import { copyFacts } from "./factBuilder.mjs";

/** @typedef {import("../../../dashboard/src/landedCiHistory.ts").LandedCiHistory} LandedCiHistory */
/** @typedef {import("../../../dashboard/src/landedCiHistory.ts").LandedCiEntry} LandedCiEntry */
/** @typedef {import("../../../dashboard/src/landedCiHistory.ts").MeasuredHistory} MeasuredHistory */
/** @typedef {import("../../../dashboard/src/landedCiHistory.ts").FinalGap} FinalGap */
/** @typedef {import("../../../dashboard/src/landedCiHistory.ts").PendingGap} PendingGap */
/** @typedef {import("../../../dashboard/src/landedCiHistory.ts").Provenance} Provenance */

/**
 * History-read answer for one GitHub run's first attempt (`answeredRun`).
 * @typedef {{
 *   runUrl: string,
 *   runId: number,
 *   runAttempt: number,
 * }} AnsweredCiRun
 */

/** @param {number} runId */
const firstAttemptOf = (runId) => ({
  runUrl: `https://ci.invalid/runs/${String(runId)}`,
  runId,
  runAttempt: 1,
});

export class CiHistoryAnswerBuilder {
  /** @type {LandedCiEntry[]} */
  #entries = [];

  /**
   * A measured build of `revision`, run `runId` from `startedAt` to
   * `completedAt`, its landing recorded at `receivedAt` (its start unless
   * named), with the history's measure `timeMs` when the case names one.
   * @param {{ revision: string, runId: number, startedAt: string, completedAt: string, receivedAt?: string, timeMs?: number }} build
   */
  measuredBuild(build) {
    this.#entries.push({
      kind: "point",
      revision: build.revision,
      ...firstAttemptOf(build.runId),
      startedAt: build.startedAt,
      completedAt: build.completedAt,
      ...(build.timeMs === undefined ? {} : { timeMs: build.timeMs }),
      landings: [
        {
          revision: build.revision,
          receivedAt: build.receivedAt ?? build.startedAt,
          provenance: "exact",
        },
      ],
    });
    return this;
  }

  /**
   * A landing that will not be measured, for `reason`, naming the build that
   * stands for it, if any.
   * @param {{ revision: string, receivedAt: string, reason: FinalGap["reason"], build?: { revision: string, provenance: Provenance, runId: number } }} landing
   */
  unmeasuredLanding({ build, ...landing }) {
    this.#entries.push({
      kind: "gap",
      ...landing,
      ...(build === undefined
        ? {}
        : {
            build: {
              revision: build.revision,
              provenance: build.provenance,
              ...firstAttemptOf(build.runId),
            },
          }),
    });
    return this;
  }

  /**
   * A landing not measured yet, waiting for `waitsFor`, on run `runId`'s
   * first attempt when it names one.
   * @param {{ revision: string, receivedAt: string, waitsFor: PendingGap["waitsFor"], runId?: number }} landing
   */
  pendingLanding({ runId, ...landing }) {
    this.#entries.push({
      kind: "gap",
      reason: "pending",
      ...landing,
      ...(runId === undefined ? {} : firstAttemptOf(runId)),
    });
    return this;
  }

  /** @returns {LandedCiHistory} */
  please() {
    return { entries: [...this.#entries] };
  }

  /**
   * The history as Project CI status's reader answers it, each build under
   * the measure the case names for it.
   * @returns {MeasuredHistory}
   */
  pleaseMeasured() {
    return {
      entries: this.#entries.map((entry) => {
        if (entry.kind === "gap") return entry;
        if (entry.timeMs === undefined) {
          throw new Error(`Name the measure of ${entry.revision}`);
        }
        return { ...entry, timeMs: entry.timeMs };
      }),
    };
  }
}

/**
 * @typedef {object} CiHistoryAnswerMakeMe
 * @property {CiHistoryAnswerBuilder} aCiHistoryAnswer
 * @property {import("./factBuilder.mjs").FactBuilder<AnsweredCiRun>} anAnsweredCiRun
 */

/** @returns {PropertyDescriptorMap} */
export function ciHistoryAnswerMakeMeProperties() {
  return {
    aCiHistoryAnswer: {
      enumerable: true,
      get() {
        return new CiHistoryAnswerBuilder();
      },
    },
    anAnsweredCiRun: {
      enumerable: true,
      get() {
        return { with: copyFacts };
      },
    },
  };
}
