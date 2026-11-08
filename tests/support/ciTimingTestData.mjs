// @ts-check
// Domain data for custom CI adapter attempts and their job timing.
/** @typedef {import("../../dashboard/server/ciTimeWithoutRunnerWaits.ts").CiTimingJob} CiTimingJob */

export class CiTimingJobBuilder {
  /** @type {CiTimingJob | undefined} */
  #job;

  /** @param {Omit<CiTimingJob, "needs"> & Partial<Pick<CiTimingJob, "needs">>} facts */
  withTiming({ id, durationMs, needs = [] }) {
    this.#job = { id, durationMs, needs: [...needs] };
    return this;
  }

  please() {
    if (!this.#job) throw new Error("choose .withTiming(...) first");
    return this.#job;
  }
}

/**
 * @typedef {{
 *   sha: string, runId: string | number, attemptId: string | number,
 *   branch: string, startedAt: string, completedAt: string
 * }} CiAdapterAttemptFacts
 */

export class CiAdapterAttemptBuilder {
  /** @type {CiAdapterAttemptFacts | undefined} */
  #attempt;

  /** @param {CiAdapterAttemptFacts} facts */
  passed(facts) {
    this.#attempt = facts;
    return this;
  }

  please() {
    const attempt = this.#attempt;
    if (!attempt) throw new Error("choose .passed(...) first");
    return {
      ...attempt,
      outcome: "success",
      url: `https://ci.invalid/builds/${String(attempt.runId)}`,
      time: attempt.completedAt,
    };
  }
}
