// @ts-check
// A kept launch’s committed delivery candidate and legacy ref owners.

/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {import("../../../dashboard/src/sessionBranchResult.ts").SessionBranchResult} SessionBranchResult */
/** @typedef {{ repository: string, runs: { base: string, revision: string }[], shared?: true, readAt?: string }} KeptSessionCommits */
/**
 * A candidate belongs to the record’s Done mark unless stated otherwise.
 * @typedef {Omit<SessionBranchResult, "doneAt"> & Partial<Pick<SessionBranchResult, "doneAt">>} StatedBranchResult
 */

/**
 * @typedef {{
 *   sessionCommits?: KeptSessionCommits,
 *   branchResult?: StatedBranchResult,
 *   branchResultFailedAt?: string,
 * }} DoneCapture
 */

// What a launch's builder states its Done captured (`LaunchOutcomeBuilder`).
export class LaunchDoneCaptureBuilder {
  /** @type {DoneCapture} */
  #capture = {};

  /**
   * Legacy data from records that pinned execution checkout commits.
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

  /**
   * The session branch’s last commit at Done, in its recorded repository.
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
    const { sessionCommits, branchResult, branchResultFailedAt } =
      this.#capture;
    return {
      ...(sessionCommits && {
        sessionCommits: {
          ...structuredClone(sessionCommits),
        },
      }),
      ...(branchResult && {
        branchResult: {
          ...branchResult,
          doneAt: branchResult.doneAt ?? doneAt,
        },
      }),
      ...(branchResultFailedAt !== undefined && { branchResultFailedAt }),
    };
  }
}
