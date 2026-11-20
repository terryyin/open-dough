// @ts-check
// Work performed in a checkout after its repository history is materialized.

/** @typedef {{ at: string, message: string, files: Readonly<Record<string, string>> }} DatedCommit */
/** @typedef {{ at: string }} DatedStep */
/** @typedef {Omit<DatedCommit, "message">} DatedAmendment */
/** @typedef {"fast-forward" | "merge" | "rebase" | "rebase-onto"} TrunkWork */
/** @typedef {{ kind: "commit" } & DatedCommit | { kind: TrunkWork } & DatedCommit | { kind: "amend" } & DatedAmendment | { kind: "push" } & DatedStep} WorkStep */
/** @template {string} Name @typedef {WorkStep & { name: Name }} NamedStep */
/** @template {string} [Name=string] @typedef {readonly NamedStep<Name>[]} CheckoutWork */

/** @template {string} [Name=never] */
export class CheckoutWorkBuilder {
  /** @type {CheckoutWork<Name>} */
  #steps;

  /** @param {CheckoutWork<Name>} [steps] */
  constructor(steps = []) {
    this.#steps = steps;
  }

  /**
   * @template {string} NewName
   * @param {NewName} name
   * @param {WorkStep} step
   * @returns {CheckoutWorkBuilder<Name | NewName>}
   */
  #with(name, step) {
    /** @type {string} */
    const stepName = name;
    if (this.#steps.some((item) => item.name === stepName))
      throw new Error(`Checkout work already has a step named ${name}.`);
    /** @type {CheckoutWork<Name | NewName>} */
    const steps = [...this.#steps, { ...step, name }];
    return new CheckoutWorkBuilder(steps);
  }

  /**
   * @template {string} NewName
   * @param {NewName} name
   * @param {DatedCommit} commit
   */
  committing(name, commit) {
    return this.#with(name, { ...commit, kind: "commit" });
  }

  /**
   * @template {string} NewName
   * @param {NewName} name
   * @param {DatedAmendment} amendment
   */
  amending(name, amendment) {
    return this.#with(name, { ...amendment, kind: "amend" });
  }

  /**
   * @template {string} NewName
   * @param {NewName} name
   * @param {DatedStep} push
   */
  pushingToTrunk(name, push) {
    return this.#with(name, { ...push, kind: "push" });
  }

  /**
   * Another checkout publishes the change and this checkout pulls it.
   * @template {string} NewName
   * @param {NewName} name
   * @param {DatedCommit} commit
   */
  fastForwardingToTrunkWork(name, commit) {
    return this.#with(name, { ...commit, kind: "fast-forward" });
  }

  /**
   * Answers the merge commit the checkout creates when it pulls trunk.
   * @template {string} NewName
   * @param {NewName} name
   * @param {DatedCommit} commit
   */
  mergingTrunkWork(name, commit) {
    return this.#with(name, { ...commit, kind: "merge" });
  }

  /**
   * Answers the trunk commit the checkout rebases onto while pulling it.
   * @template {string} NewName
   * @param {NewName} name
   * @param {DatedCommit} commit
   */
  rebasingOntoTrunkWork(name, commit) {
    return this.#with(name, { ...commit, kind: "rebase" });
  }

  /**
   * Answers the fetched trunk commit onto which the checkout rebases its tip.
   * @template {string} NewName
   * @param {NewName} name
   * @param {DatedCommit} commit
   */
  rebasingTipOntoFetchedTrunkWork(name, commit) {
    return this.#with(name, { ...commit, kind: "rebase-onto" });
  }

  /** @returns {CheckoutWork<Name>} */
  please() {
    return structuredClone(this.#steps);
  }
}
