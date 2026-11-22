// @ts-check
// One entry Startup recovery lists: a kept attempt that needs reconciliation
// (`./launchAttemptObservationTestData.mjs`), or a start whose acceptance
// answer was lost. It is neither continuing nor offering a worktree update.

import { LaunchRequestBuilder } from "./launchRequestTestData.mjs";

/** @typedef {import("../../../dashboard/src/startupRecoveries.ts").StartupRecoveryItem} StartupRecoveryItem */
/** @typedef {import("../../../dashboard/src/launchOutcome.ts").AttemptObservation} AttemptObservation */
/** @typedef {import("./launchRequestTestData.mjs").IncomingStoryFacts} IncomingStoryFacts */

export class StartupRecoveryItemBuilder {
  /** @type {Pick<StartupRecoveryItem, "request" | "cause" | "attempt" | "problem"> | undefined} */
  #entry;

  /**
   * The observed attempt kept for recovery: uncertain once it has an
   * outcome, interrupted while it never settled.
   * @param {AttemptObservation} attempt
   */
  keeping(attempt) {
    this.#entry = {
      request: attempt.request,
      cause: attempt.outcome === undefined ? "interrupted" : "uncertain",
      attempt,
    };
    return this;
  }

  /**
   * The story's execution start whose acceptance answer was lost, with the
   * problem that lost it.
   * @param {IncomingStoryFacts} facts
   * @param {string} problem
   */
  executionStartLost(facts, problem) {
    this.#entry = {
      request: new LaunchRequestBuilder().executing(facts).please(),
      cause: "unacknowledged",
      problem,
    };
    return this;
  }

  /** @returns {StartupRecoveryItem} */
  please() {
    if (!this.#entry)
      throw new Error("choose .keeping(...) or .executionStartLost(...) first");
    const { request } = this.#entry;
    return {
      ...structuredClone(this.#entry),
      key: request.workflow === "ad-hoc" ? "ad-hoc" : request.identity,
      continuing: false,
      offersWorktreeUpdate: false,
    };
  }
}
