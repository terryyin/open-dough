// @ts-check
// Domain data for custom CI adapter attempts and their job timing.
/** @typedef {import("../../dashboard/server/ciTimeWithoutRunnerWaits.ts").CiTimingJob} CiTimingJob */
import { copyFacts } from "./factBuilder.mjs";

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
 * One attempt as a CI adapter's discover answers it
 * (`src/skills/dough-execute-plan/scripts/ci-command-attempts.mjs`).
 * Optional fields stay absent when the case omits them.
 * @typedef {{
 *   sha: string,
 *   runId: string | number,
 *   attemptId: string | number,
 *   outcome: "pending" | "success" | "failure" | "incomplete",
 *   time?: string,
 *   startedAt?: string,
 *   completedAt?: string,
 *   url?: string,
 *   branch?: string,
 *   check?: string,
 *   context?: string,
 * }} CiAdapterDiscoveryAttempt
 */

/**
 * Timed passed construction keeps `branch` required; omit it only through
 * `.with` or the untimed outcome methods when the case leaves it unattested.
 * @typedef {{
 *   sha: string, runId: string | number, attemptId: string | number,
 *   branch: string, startedAt: string, completedAt: string,
 *   check?: string, context?: string, url?: string,
 * }} CiAdapterAttemptFacts
 */

/**
 * An attempt whose start and completion discovery names neither of: when the
 * adapter listed it (`time`) instead.
 * @typedef {{
 *   sha: string, runId: string | number, attemptId: string | number,
 *   time: string,
 *   branch?: string, check?: string, context?: string, url?: string,
 * }} UntimedAttemptFacts
 */

// One attempt as a CI adapter's discover answers it, linked under ci.invalid
// by its run: passed with its start and completion; or, with only the time
// it was listed, passed, failed, still pending (queued or running), or
// incomplete (stopped without a verdict, as a cancelled build). `.with` states
// the discovery shape whole, including absent optional fields.
export class CiAdapterAttemptBuilder {
  /** @type {CiAdapterAttemptFacts | undefined} */
  #attempt;

  /**
   * Stated discovery attempt facts exactly, preserving omitted optionals.
   * @param {CiAdapterDiscoveryAttempt} facts
   */
  with(facts) {
    return copyFacts(facts);
  }

  /** @param {CiAdapterAttemptFacts} facts */
  passed(facts) {
    this.#attempt = facts;
    return this;
  }

  /** @param {UntimedAttemptFacts} facts passed, naming no start or completion */
  passedWithoutTimes(facts) {
    return new UntimedCiAdapterAttemptBuilder(facts, "success");
  }

  /** @param {UntimedAttemptFacts} facts failed, naming no start or completion */
  failed(facts) {
    return new UntimedCiAdapterAttemptBuilder(facts, "failure");
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
    const { url, ...facts } = attempt;
    return {
      ...facts,
      outcome: "success",
      url: url ?? `https://ci.invalid/builds/${String(facts.runId)}`,
      time: attempt.completedAt,
    };
  }
}

// An attempt discovery lists with no start or completion.
class UntimedCiAdapterAttemptBuilder {
  /** @type {UntimedAttemptFacts} */
  #attempt;
  /** @type {"success" | "failure" | "pending" | "incomplete"} */
  #outcome;

  /**
   * @param {UntimedAttemptFacts} attempt
   * @param {"success" | "failure" | "pending" | "incomplete"} outcome
   */
  constructor(attempt, outcome) {
    this.#attempt = attempt;
    this.#outcome = outcome;
  }

  please() {
    const { url, ...facts } = this.#attempt;
    return {
      ...facts,
      outcome: this.#outcome,
      url: url ?? `https://ci.invalid/builds/${String(facts.runId)}`,
    };
  }
}
