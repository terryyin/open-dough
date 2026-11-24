// @ts-check
// What a kept launch's Done captured (`./launchOutcomeTestData.mjs` states
// the Done mark): the commits its session made in the execution checkout,
// the result its session branch reached, or the time either read failed. A
// branch result is stated from the work's known revisions.

/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {import("../../../dashboard/src/sessionBranchResult.ts").SessionBranchResult} SessionBranchResult */
/** @typedef {{ repository: string, runs: { base: string, revision: string }[], shared?: true, readAt?: string }} KeptSessionCommits */
/**
 * A branch result as a case states it: its committed tip is its revision and
 * its Done is the record's Done mark unless the case states otherwise.
 * @typedef {Omit<SessionBranchResult, "committedTip" | "doneAt"> & Partial<Pick<SessionBranchResult, "committedTip" | "doneAt">>} StatedBranchResult
 */

/**
 * @typedef {{
 *   sessionCommits?: KeptSessionCommits,
 *   sessionCommitsFailedAt?: string,
 *   branchResult?: StatedBranchResult,
 *   branchResultFailedAt?: string,
 * }} DoneCapture
 */

// What a launch's builder states its Done captured (`LaunchOutcomeBuilder`).
export class LaunchDoneCaptureBuilder {
  /** @type {DoneCapture} */
  #capture = {};

  /**
   * The commits the session made in its execution checkout, kept at Done:
   * each run's pair in the checkout's common repository, oldest first, and
   * `shared` when another session was open in that checkout meanwhile. State
   * `readAt` when the kept run was read at a different time than the Done mark.
   * @param {KeptSessionCommits} kept
   */
  keptSessionCommits({ repository, runs, shared, readAt }) {
    const sessionCommits = {
      repository,
      runs,
      ...(shared && { shared }),
      ...(readAt !== undefined && { readAt }),
    };
    this.#capture = { ...this.#capture, sessionCommits };
    return this;
  }

  /** The Done time whose checkout read failed. @param {string} at */
  sessionCommitsFailedAt(at) {
    this.#capture = { ...this.#capture, sessionCommitsFailedAt: at };
    return this;
  }

  /**
   * The session branch reached `revision` from `base` in `repository` at
   * Done. State `doneAt` for a result kept for an earlier Done.
   * @param {StatedBranchResult} result
   */
  branchResultFrom(result) {
    this.#capture = { ...this.#capture, branchResult: { ...result } };
    return this;
  }

  /** The Done time whose branch read failed. @param {string} at */
  branchResultFailedAt(at) {
    this.#capture = { ...this.#capture, branchResultFailedAt: at };
    return this;
  }

  /**
   * The record fields of the stated capture, read at the Done mark `doneAt`.
   * @param {string} doneAt an ISO date-time
   * @returns {Partial<LaunchRecord>}
   */
  doneCaptureFacts(doneAt) {
    const {
      sessionCommits,
      sessionCommitsFailedAt,
      branchResult,
      branchResultFailedAt,
    } = this.#capture;
    return {
      ...(sessionCommitsFailedAt !== undefined && { sessionCommitsFailedAt }),
      ...(sessionCommits && {
        sessionCommits: {
          ...structuredClone(sessionCommits),
          readAt: sessionCommits.readAt ?? doneAt,
        },
      }),
      ...(branchResult && {
        branchResult: {
          ...branchResult,
          committedTip: branchResult.committedTip ?? branchResult.revision,
          doneAt: branchResult.doneAt ?? doneAt,
        },
      }),
      ...(branchResultFailedAt !== undefined && { branchResultFailedAt }),
    };
  }
}
