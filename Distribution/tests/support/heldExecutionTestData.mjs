// @ts-check
/** @typedef {import("../../src/skills/dough-execute-plan/scripts/blocked-execution-store.mjs").HeldExecutionInput} HeldExecutionInput */

export class HeldExecutionBuilder {
  /** @type {HeldExecutionInput} */
  #input = {
    execution: {
      identity: "SEED-001#consumer",
      owner: "consumer-agent",
      workspace: "/workspace",
      branch: "main",
      revision: "base",
      authority: { description: "The original consumer assignment." },
      acceptedProof: [],
      unfinishedWork: [],
      outstandingProof: [],
    },
    condition: {
      kind: "supplier",
      description: "supplier outcome has checked proof",
      signalFile: "/workspace/supplier.json",
      observed: "unobserved",
      check: ["node", "check-supplier.mjs"],
    },
    continuation: {
      host: "codex",
      threadId: "consumer-thread",
      endpoint: "unix:///tmp/codex.sock",
    },
    nextObservation: {
      owner: "consumer-agent",
      recovery: "Inspect this same retained consumer.",
    },
  };

  /** @param {string} identity */
  identifiedAs(identity) {
    this.#input.execution.identity = identity;
    return this;
  }

  /** @param {string} owner */
  ownedBy(owner) {
    this.#input.execution.owner = owner;
    this.#input.nextObservation.owner = owner;
    return this;
  }

  /** @param {string} workspace @param {string} revision @param {string} [branch] */
  inCheckout(workspace, revision, branch = "main") {
    Object.assign(this.#input.execution, { workspace, revision, branch });
    return this;
  }

  /** @param {HeldExecutionInput["execution"]["authority"]} authority */
  authorizedBy(authority) {
    this.#input.execution.authority = structuredClone(authority);
    return this;
  }

  /** @param {...unknown} proof */
  withAcceptedProof(...proof) {
    this.#input.execution.acceptedProof = structuredClone(proof);
    return this;
  }

  /** @param {...unknown} work */
  withUnfinishedWork(...work) {
    this.#input.execution.unfinishedWork = structuredClone(work);
    return this;
  }

  /** @param {...unknown} proof */
  withOutstandingProof(...proof) {
    this.#input.execution.outstandingProof = structuredClone(proof);
    return this;
  }

  /** @param {Omit<HeldExecutionInput["condition"], "kind">} condition */
  waitingForSupplier(condition) {
    this.#input.condition = { kind: "supplier", ...structuredClone(condition) };
    return this;
  }

  /** @param {Omit<HeldExecutionInput["condition"], "kind">} condition */
  waitingForUsage(condition) {
    this.#input.condition = { kind: "usage", ...structuredClone(condition) };
    return this;
  }

  /** @param {number} at @param {string} reason */
  withObservationDeadline(at, reason) {
    this.#input.nextObservation.deadline = { at, reason };
    return this;
  }

  /** @param {NonNullable<HeldExecutionInput["nextObservation"]["ci"]>} ci */
  withCiObservation(ci) {
    this.#input.nextObservation.ci = structuredClone(ci);
    return this;
  }

  /** @param {string} host @param {string} threadId @param {string[]} recoveryCommand */
  continuingManuallyIn(host, threadId, recoveryCommand) {
    this.#input.continuation = { host, threadId };
    this.#input.nextObservation.recoveryCommand = [...recoveryCommand];
    return this;
  }

  /** @param {string} threadId @param {string} endpoint */
  continuingInCodex(threadId, endpoint) {
    this.#input.continuation = { host: "codex", threadId, endpoint };
    return this;
  }

  /** @param {string} owner @param {string} recovery */
  observedBy(owner, recovery) {
    Object.assign(this.#input.nextObservation, { owner, recovery });
    return this;
  }

  please() {
    return structuredClone(this.#input);
  }
}
