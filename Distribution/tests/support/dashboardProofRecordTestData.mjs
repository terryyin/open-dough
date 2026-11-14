// @ts-check
// Domain data for a browser test group's proof record
// (`<prefix>_PROOF_RECORD`): phase, cwd, and located tests whose
// outcomes and attempt durations the CI fragments converter reads. State the
// facts that drive each case at the call site; keep malformed exact input
// outside this builder.

/** @typedef {"expected" | "unexpected" | "flaky" | "skipped" | undefined} ProofOutcome */
/** @typedef {[file: string | undefined, outcome: ProofOutcome, durations?: readonly (number | undefined)[]]} LocatedTest */

export class DashboardProofRecordBuilder {
  #cwd = "/runner/project";
  /** @type {"running" | "listed" | "completed"} */
  #phase = "completed";
  /** @type {LocatedTest[]} */
  #tests = [];

  /** @param {string} cwd */
  from(cwd) {
    this.#cwd = cwd;
    return this;
  }

  /** @param {"running" | "listed" | "completed"} phase */
  inPhase(phase) {
    this.#phase = phase;
    return this;
  }

  completed() {
    return this.inPhase("completed");
  }

  running() {
    return this.inPhase("running");
  }

  /**
   * One located selection: FILE under the run cwd (omit for no location),
   * Playwright OUTCOME (`undefined` = unfinished/other), and optional
   * finished attempt DURATIONS in milliseconds (omit a value to leave that
   * attempt untimed; an empty list leaves the selection untimed).
   * @param {string | undefined} file
   * @param {ProofOutcome} outcome
   * @param {readonly (number | undefined)[]} [durations]
   */
  withTest(file, outcome, durations = []) {
    this.#tests.push([file, outcome, durations]);
    return this;
  }

  please() {
    const cwd = this.#cwd;
    return {
      schemaVersion: /** @type {1} */ (1),
      phase: this.#phase,
      run: { cwd, rootDir: `${cwd}/dashboard/tests` },
      selectedCount: this.#tests.length,
      tests: this.#tests.map(([file, outcome, durations = []], index) => ({
        ...(file === undefined
          ? {}
          : { location: { file, line: 1, column: 1 } }),
        titlePath: [`test ${index}`],
        executions:
          outcome === undefined
            ? [{ testId: `t${index}` }]
            : [{ testId: `t${index}`, outcome }],
        attempts: durations.map((durationMs, retry) => ({
          testId: `t${index}`,
          retry,
          ...(durationMs === undefined ? {} : { durationMs }),
        })),
      })),
    };
  }
}
