// @ts-check
// Work performed in a checkout after its repository history is materialized.
// A step the case does not describe further adds `<name>.txt` holding
// `<name> work`, with the message `Add <name>.txt`.

/** @typedef {{ at: string }} DatedStep */
/** @typedef {DatedStep & { files: Readonly<Record<string, string>> }} DatedFileChanges */
/** @typedef {DatedFileChanges & { message: string }} DatedCommit */
/** @typedef {DatedCommit & { readonly branch: string }} DatedSideCommit */
/** @typedef {DatedStep & { readonly message: string }} DatedReword */
/** @typedef {DatedStep & { file: string, incoming: string, resolution: string }} DatedCherryPick */
/** @typedef {DatedStep & { target: string, mode: "fixup" | "squash", file: string, content: string }} DatedAutosquash */
/** @typedef {DatedStep & { readonly tip: string }} DatedTipMerge */
/** @typedef {"fast-forward" | "merge" | "rebase" | "rebase-onto"} TrunkWork */
/** @typedef {{ kind: "commit" } & DatedCommit | { kind: TrunkWork } & DatedCommit | { kind: "amend" | "edit" } & DatedFileChanges | { kind: "branch-commit" } & DatedSideCommit | { kind: "reword" } & DatedReword | { kind: "push" } & DatedStep | { kind: "cherry-pick" } & DatedCherryPick | { kind: "autosquash" } & DatedAutosquash | { kind: "merge-tip" } & DatedTipMerge} WorkStep */
/** @template {string} Name @typedef {WorkStep & { name: Name }} NamedStep */
/** @typedef {DatedStep & Partial<Pick<DatedFileChanges, "files">>} FileChangesFacts */
/** @typedef {FileChangesFacts & Partial<Pick<DatedCommit, "message">>} CommitFacts */
/** @typedef {CommitFacts & Partial<Pick<DatedSideCommit, "branch">>} SideCommitFacts */
/** @template {string} [Name=string] @typedef {readonly NamedStep<Name>[]} CheckoutWork */

/** @param {string} name @returns {Omit<DatedCommit, "at">} */
const namedWork = (name) => ({
  message: `Add ${name}.txt`,
  files: { [`${name}.txt`]: `${name} work\n` },
});

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
   * @param {CommitFacts} commit
   */
  committing(name, commit) {
    return this.#with(name, { ...namedWork(name), ...commit, kind: "commit" });
  }

  /**
   * Edits files in the worktree and answers the unchanged HEAD.
   * @template {string} NewName
   * @param {NewName} name
   * @param {FileChangesFacts} edit
   */
  editing(name, edit) {
    return this.#with(name, {
      files: namedWork(name).files,
      ...edit,
      kind: "edit",
    });
  }

  /**
   * Answers the commit on the new branch and returns to the original branch.
   * @template {string} NewName
   * @param {NewName} name
   * @param {SideCommitFacts} commit
   */
  committingOnBranch(name, commit) {
    return this.#with(name, {
      ...namedWork(name),
      branch: name,
      ...commit,
      kind: "branch-commit",
    });
  }

  /**
   * Rewords the tip through interactive rebase and answers the rewritten tip.
   * @template {string} NewName
   * @param {NewName} name
   * @param {DatedReword} reword
   */
  rewordingTip(name, reword) {
    return this.#with(name, { ...reword, kind: "reword" });
  }

  /**
   * @template {string} NewName
   * @param {NewName} name
   * @param {FileChangesFacts} amendment
   */
  amending(name, amendment) {
    return this.#with(name, {
      files: namedWork(name).files,
      ...amendment,
      kind: "amend",
    });
  }

  /**
   * Continues a conflicted pick from another checkout after resolving its file.
   * @template {string} NewName
   * @param {NewName} name
   * @param {DatedCherryPick} pick
   */
  continuingConflictedCherryPick(name, pick) {
    return this.#with(name, { ...pick, kind: "cherry-pick" });
  }

  /**
   * Adds a fixup or squash and answers the resulting autosquashed commit.
   * @template {string} NewName
   * @param {NewName} name
   * @param {DatedAutosquash} rewrite
   */
  autosquashing(name, rewrite) {
    return this.#with(name, { ...rewrite, kind: "autosquash" });
  }

  /**
   * Merges a branch tip by hand with a merge commit and answers that merge.
   * @template {string} NewName
   * @param {NewName} name
   * @param {DatedTipMerge} merge
   */
  mergingTipByHand(name, merge) {
    return this.#with(name, { ...merge, kind: "merge-tip" });
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
   * @param {CommitFacts} commit
   */
  fastForwardingToTrunkWork(name, commit) {
    return this.#with(name, {
      ...namedWork(name),
      ...commit,
      kind: "fast-forward",
    });
  }

  /**
   * Answers the merge commit the checkout creates when it pulls trunk.
   * @template {string} NewName
   * @param {NewName} name
   * @param {CommitFacts} commit
   */
  mergingTrunkWork(name, commit) {
    return this.#with(name, { ...namedWork(name), ...commit, kind: "merge" });
  }

  /**
   * Answers the trunk commit the checkout rebases onto while pulling it.
   * @template {string} NewName
   * @param {NewName} name
   * @param {CommitFacts} commit
   */
  rebasingOntoTrunkWork(name, commit) {
    return this.#with(name, { ...namedWork(name), ...commit, kind: "rebase" });
  }

  /**
   * Answers the fetched trunk commit onto which the checkout rebases its tip.
   * @template {string} NewName
   * @param {NewName} name
   * @param {CommitFacts} commit
   */
  rebasingTipOntoFetchedTrunkWork(name, commit) {
    return this.#with(name, {
      ...namedWork(name),
      ...commit,
      kind: "rebase-onto",
    });
  }

  /** @returns {CheckoutWork<Name>} */
  please() {
    return structuredClone(this.#steps);
  }
}
