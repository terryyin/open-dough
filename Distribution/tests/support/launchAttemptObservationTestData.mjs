// @ts-check
// A server's live answer about an attempt the machine keeps
// (`./launchAttemptTestData.mjs`). Ownership, running and told changes are
// never stored: a kept `LaunchAttemptRecord` never carries them.

/** @typedef {import("../../../dashboard/src/launchOutcome.ts").LaunchAttemptRecord} LaunchAttemptRecord */
/** @typedef {import("../../../dashboard/src/launchOutcome.ts").AttemptObservation} AttemptObservation */

// A kept attempt as a server answers it: whether that server owns it and
// whether it runs, both stated, and the changes it had told when it did.
export class AttemptObservationBuilder {
  /** @type {LaunchAttemptRecord | undefined} */
  #attempt;
  /** @type {boolean | undefined} */
  #owned;
  /** @type {boolean | undefined} */
  #running;
  /** @type {number | undefined} */
  #changes;

  /**
   * The kept attempt observed.
   * @param {LaunchAttemptRecord} attempt
   */
  of(attempt) {
    this.#attempt = attempt;
    return this;
  }

  /**
   * Whether the answering server owns the attempt.
   * @param {boolean} owned
   */
  owned(owned) {
    this.#owned = owned;
    return this;
  }

  /**
   * Whether a server still runs the attempt.
   * @param {boolean} running
   */
  running(running) {
    this.#running = running;
    return this;
  }

  /**
   * How many changes of its attempt the owning server had told.
   * @param {number} changes
   */
  afterChanges(changes) {
    this.#changes = changes;
    return this;
  }

  /** @returns {AttemptObservation} */
  please() {
    if (!this.#attempt) throw new Error("choose .of(attempt) first");
    if (this.#owned === undefined) throw new Error("choose .owned(...) first");
    if (this.#running === undefined)
      throw new Error("choose .running(...) first");
    return {
      ...structuredClone(this.#attempt),
      owned: this.#owned,
      running: this.#running,
      ...(this.#changes !== undefined && { changes: this.#changes }),
    };
  }
}
