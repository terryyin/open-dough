// @ts-check
// The Running Cursor sessions answer the browser reads
// (`../../dashboard/src/cursorRunnerSessions.ts`): whether the Cursor runner
// is accepting, and each held client's screen label beside its kept launch
// record. Harness route timing and demand tracking stay outside MakeMe.

/** @typedef {import("../../dashboard/src/cursorRunnerSessions.ts").RunningCursorSessions} RunningCursorSessions */
/** @typedef {import("../../dashboard/src/cursorRunnerSessions.ts").CursorRunnerStatus} CursorRunnerStatus */
/** @typedef {RunningCursorSessions["sessions"][number]} HeldCursorSession */

/**
 * A Running Cursor sessions list. Unless stated, the runner is running and
 * holds no sessions.
 */
export class RunningCursorSessionsBuilder {
  /** @type {CursorRunnerStatus} */
  #runner = "running";
  /** @type {HeldCursorSession[]} */
  #sessions = [];

  /**
   * Held Cursor sessions, each with its kept record and current screen label.
   * @param {...HeldCursorSession} sessions
   */
  holding(...sessions) {
    this.#sessions.push(
      ...sessions.map((session) => ({
        record: structuredClone(session.record),
        label: session.label,
      })),
    );
    return this;
  }

  /** The runner cannot be reached; answers no sessions. */
  unreachable() {
    this.#runner = "unreachable";
    this.#sessions = [];
    return this;
  }

  /** @returns {RunningCursorSessions} */
  please() {
    return {
      runner: this.#runner,
      sessions: this.#sessions.map((session) => ({
        record: structuredClone(session.record),
        label: session.label,
      })),
    };
  }
}
