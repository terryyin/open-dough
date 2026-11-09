// @ts-check
// Retained landing observations and the validated attempt proof they retain.
/** @typedef {import("../../dashboard/server/landedCiHistoryStore.ts").ProjectHistory} ProjectHistory */
/** @typedef {import("../../dashboard/src/ciProof.ts").CiProof} CiProof */

export class CiProofBuilder {
  /** @type {{repository:string,revision:string,runId:number,runAttempt:number}|{repository:string,revision:string,attemptId:string}} */
  #run = {
    repository: "terryyin/open-dough",
    revision: "a".repeat(40),
    runId: 1,
    runAttempt: 1,
  };
  /** @type {import("../../dashboard/src/ciProof.ts").CiProofEntry[]} */
  #entries = [];
  /** @param {Partial<{repository:string, revision:string, runId:number, runAttempt:number}>} run */
  forRun(run) {
    this.#run = { ...this.#run, ...run };
    return this;
  }
  /** @param {{repository?:string,revision:string,attemptId:string}} attempt */
  forAdapter(attempt) {
    this.#run = { repository: "terryyin/open-dough", ...attempt };
    return this;
  }
  /** @param {import("../../dashboard/src/ciProof.ts").CiProofEntry[]} entries */
  entries(entries) {
    this.#entries = entries;
    return this;
  }
  /** @returns {CiProof} */
  please() {
    return {
      kind: "summary",
      summary: { schemaVersion: 2, ...this.#run, entries: this.#entries },
    };
  }
}

export class LandedCiResolutionBuilder {
  /** @type {import("../../dashboard/server/landedCiHistoryStore.ts").LandedResolution} */
  #resolution = {
    kind: "build",
    state: "pass",
    revision: "a".repeat(40),
    subject: "CI build",
    selection: "exact",
    laterWithoutResult: 0,
  };
  /** @param {ProjectHistory["builds"][string]} build @param {"exact"|"equivalent"|"later"} [selection] */
  measuring(build, selection = "exact") {
    const measured = Object.fromEntries(
      Object.entries(build).filter(
        ([key, value]) => key !== "proof" && value !== undefined,
      ),
    );
    this.#resolution = {
      kind: "build",
      subject: "CI build",
      laterWithoutResult: 0,
      ...measured,
      revision: build.revision,
      state: build.state,
      selection,
    };
    return this;
  }
  /** @returns {import("../../dashboard/server/landedCiHistoryStore.ts").LandedResolution} */
  please() {
    return structuredClone(this.#resolution);
  }
}
