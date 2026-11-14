// @ts-check
// What a host reports about a kept launch's session, and the live record that
// joins that report to the kept record it observes (`./launchTestData.mjs`).
// None of this evidence is stored: a persisted `LaunchRecord` never carries
// it, while a `LaunchWithState` always carries a session state.

/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchWithState} LaunchWithState */
/** @typedef {import("../../../dashboard/src/launchRecord.ts").SessionState} SessionState */
/** @typedef {import("../../../dashboard/src/launchRecord.ts").WorkspaceState} WorkspaceState */
/** @typedef {Extract<SessionState, { kind: "available" }>} AvailableSession */

// One session's current observation. Choose exactly one of loaded, retained,
// unknown or unavailable; there is no default observation.
export class SessionStateBuilder {
  /** @type {SessionState | undefined} */
  #state;

  /**
   * The host has the conversation loaded, with this activity.
   * @param {AvailableSession["activity"]} activity
   */
  loaded(activity) {
    this.#state = { kind: "available", availability: "loaded", activity };
    return this;
  }

  /**
   * The host retains the conversation, unloaded but continuable, with this
   * activity.
   * @param {AvailableSession["activity"]} activity
   */
  retained(activity) {
    this.#state = { kind: "available", availability: "retained", activity };
    return this;
  }

  /**
   * The available session waits for this, as the host words it.
   * @param {string} waitingFor
   */
  waitingFor(waitingFor) {
    const state = this.#state;
    if (state?.kind !== "available")
      throw new Error("choose .loaded(...) or .retained(...) first");
    this.#state = { ...state, waitingFor };
    return this;
  }

  /**
   * The host's own words for an activity it could not recognize.
   * @param {string} description
   */
  describedAs(description) {
    const state = this.#state;
    if (state?.kind !== "available")
      throw new Error("choose .loaded(...) or .retained(...) first");
    this.#state = { ...state, description };
    return this;
  }

  /**
   * Nothing confirmed the session's state; `label` is the words this
   * observation shows as written, otherwise the host's unknown wording.
   * @param {string} [label]
   */
  unknown(label) {
    this.#state = {
      kind: "unknown",
      ...(label === undefined ? {} : { label }),
    };
    return this;
  }

  // The host confirmed that this conversation is unavailable.
  unavailable() {
    this.#state = { kind: "unavailable" };
    return this;
  }

  /** @returns {SessionState} */
  please() {
    if (!this.#state)
      throw new Error(
        "choose .loaded(...), .retained(...) or .unknown(...) first",
      );
    return { ...this.#state };
  }
}

// A kept launch as the machine answers it: the kept record joined with its
// session's observation and, when the case arranges it, its workspace's.
export class ObservedLaunchBuilder {
  /** @type {LaunchRecord | undefined} */
  #record;
  /** @type {SessionState | undefined} */
  #sessionState;
  /** @type {WorkspaceState | undefined} */
  #workspaceState;

  /**
   * The kept record this observation is about.
   * @param {LaunchRecord} record
   */
  of(record) {
    this.#record = record;
    return this;
  }

  /** @param {SessionState} sessionState */
  withSessionState(sessionState) {
    this.#sessionState = sessionState;
    return this;
  }

  /**
   * What the machine observed of the workspace the record keeps.
   * @param {WorkspaceState["kind"]} kind
   */
  withWorkspace(kind) {
    this.#workspaceState = { kind };
    return this;
  }

  /** @returns {LaunchWithState} */
  please() {
    if (!this.#record) throw new Error("choose .of(record) first");
    if (!this.#sessionState)
      throw new Error("choose .withSessionState(...) first");
    return {
      ...structuredClone(this.#record),
      ...(this.#workspaceState && { workspaceState: this.#workspaceState }),
      sessionState: { ...this.#sessionState },
    };
  }
}
