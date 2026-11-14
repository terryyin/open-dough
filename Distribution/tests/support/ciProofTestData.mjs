// @ts-check
// Canonical validated CI proof, shared by comparison and retained landing facts.
import { CiProofSummaryBuilder } from "./ciProofSummaryTestData.mjs";

/** @typedef {import("../../../dashboard/src/ciProof.ts").CiProof} CiProof */
/** @typedef {import("../../../dashboard/src/ciProof.ts").CiProofEntry} CiProofEntry */
/** @typedef {{repository:string,revision:string,runId:number,runAttempt:number}|{repository:string,revision:string,attemptId:string}} ProofAttempt */

/** @param {ProofAttempt} run @param {readonly CiProofEntry[]} entries */
function summaryProofOf(run, entries) {
  const summary = new CiProofSummaryBuilder()
    .inRepository(run.repository)
    .withEntries(...entries);
  if ("attemptId" in run) summary.ofAdapterAttempt(run);
  else summary.ofRun(run);
  return { kind: /** @type {const} */ ("summary"), summary: summary.please() };
}

export class CiProofBuilder {
  /** @type {ProofAttempt} */
  #run = {
    repository: "terryyin/open-dough",
    revision: "a".repeat(40),
    runId: 1,
    runAttempt: 1,
  };
  /** @type {CiProofEntry[]} */
  #entries = [];
  /** @type {Extract<CiProof, {kind: "unavailable"}> | undefined} */
  #unavailable;

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

  /** @param {CiProofEntry[]} entries */
  entries(entries) {
    this.#entries = entries;
    return this;
  }

  /** @param {Extract<CiProof, {kind: "unavailable"}>["reason"]} reason @param {string} [detail] */
  unavailableBecause(reason, detail) {
    this.#unavailable = {
      kind: "unavailable",
      reason,
      ...(detail === undefined ? {} : { detail }),
    };
    return this;
  }

  /** @returns {CiProof} */
  please() {
    return this.#unavailable === undefined
      ? summaryProofOf(this.#run, this.#entries)
      : { ...this.#unavailable };
  }

  /** @param {import("../../../dashboard/src/ciProof.ts").CiProofRun} run @param {readonly CiProofEntry[]} [entries] @param {string} [repository] */
  summaryFor(run, entries = [], repository = "example/project") {
    return {
      please: () =>
        summaryProofOf(
          {
            repository,
            runId: run.runId,
            runAttempt: run.runAttempt,
            revision: run.revision,
          },
          entries,
        ),
    };
  }

  /** @param {Pick<import("../../../dashboard/src/ciProof.ts").CiAdapterProofAttempt, "attemptId" | "revision">} attempt @param {readonly CiProofEntry[]} [entries] @param {string} [repository] */
  summaryForAdapter(attempt, entries = [], repository = "example/project") {
    return {
      please: () =>
        summaryProofOf(
          {
            repository,
            attemptId: attempt.attemptId,
            revision: attempt.revision,
          },
          entries,
        ),
    };
  }

  /** @param {import("../../../dashboard/src/ciProof.ts").CiProofUnavailableReason} reason @param {string} [detail] */
  unavailable(reason, detail) {
    return {
      please: () => ({
        kind: /** @type {const} */ ("unavailable"),
        reason,
        ...(detail === undefined ? {} : { detail }),
      }),
    };
  }

  /** @param {number} limitBytes @param {number} [sizeBytes] */
  tooLarge(limitBytes, sizeBytes) {
    return {
      please: () => ({
        kind: /** @type {const} */ ("unavailable"),
        reason: /** @type {const} */ ("too-large"),
        limitBytes,
        ...(sizeBytes === undefined ? {} : { sizeBytes }),
      }),
    };
  }
}
