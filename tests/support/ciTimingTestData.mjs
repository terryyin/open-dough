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

/**
 * An attempt whose start and completion discovery names neither of: when the
 * adapter listed it (`time`) instead.
 * @typedef {Omit<CiAdapterAttemptFacts, "startedAt" | "completedAt"> & { time: string }} UntimedAttemptFacts
 */

// One attempt as a CI adapter's discover answers it, linked under ci.invalid
// by its run: passed with its start and completion; or, with only the time
// it was listed, passed, still pending (queued or running), or incomplete
// (stopped without a verdict, as a cancelled build).
export class CiAdapterAttemptBuilder {
  /** @type {CiAdapterAttemptFacts | undefined} */
  #attempt;

  /** @param {CiAdapterAttemptFacts} facts */
  passed(facts) {
    this.#attempt = facts;
    return this;
  }

  /** @param {UntimedAttemptFacts} facts passed, naming no start or completion */
  passedWithoutTimes(facts) {
    return new UntimedCiAdapterAttemptBuilder(facts, "success");
  }

  /** @param {UntimedAttemptFacts} facts queued or running, with no verdict yet */
  pending(facts) {
    return new UntimedCiAdapterAttemptBuilder(facts, "pending");
  }

  /** @param {UntimedAttemptFacts} facts stopped without a verdict */
  incomplete(facts) {
    return new UntimedCiAdapterAttemptBuilder(facts, "incomplete");
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

// An attempt discovery lists with no start or completion.
class UntimedCiAdapterAttemptBuilder {
  /** @type {UntimedAttemptFacts} */
  #attempt;
  /** @type {"success" | "pending" | "incomplete"} */
  #outcome;

  /**
   * @param {UntimedAttemptFacts} attempt
   * @param {"success" | "pending" | "incomplete"} outcome
   */
  constructor(attempt, outcome) {
    this.#attempt = attempt;
    this.#outcome = outcome;
  }

  please() {
    return {
      ...this.#attempt,
      outcome: this.#outcome,
      url: `https://ci.invalid/builds/${String(this.#attempt.runId)}`,
    };
  }
}
