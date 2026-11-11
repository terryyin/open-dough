// @ts-check
// An unresolved conversation creation the dashboard's machine store keeps,
// as `../../dashboard/src/launchCreation.ts` holds it: the recorded request
// (`./launchRequestTestData.mjs`), the native workspace and endpoint awaiting
// reconciliation, and when it launched. Recovery, inspection arguments, and
// shell-quoting stay with the case, outside this builder.

import { requestFacts } from "./launchRequestTestData.mjs";

/** @typedef {import("../../dashboard/src/launchCreation.ts").CreationRecord} CreationRecord */
/** @typedef {import("./launchRequestTestData.mjs").Requested} Requested */
/** @typedef {import("./launchRequestTestData.mjs").RequestDetails} RequestDetails */
/** @typedef {import("./launchRequestTestData.mjs").StoryFacts} StoryFacts */
/** @typedef {import("./launchRequestTestData.mjs").AdHocFacts} AdHocFacts */

/**
 * What an unresolved creation states for its request: the workflow facts plus
 * the host that attempted native conversation creation.
 * @typedef {AdHocFacts & { host?: RequestDetails["host"] }} AdHocCreationFacts
 */
/**
 * @typedef {StoryFacts & { host?: RequestDetails["host"] }} StoryCreationFacts
 */

// One unresolved creation. Choose its request and the native workspace and
// endpoint; it is otherwise launched at a fixed instant. Nothing invents
// recovery or inspection arguments here.
export class CreationRecordBuilder {
  /** @type {Requested | undefined} */
  #requested;
  /** @type {RequestDetails["host"] | undefined} */
  #host;
  /** @type {RequestDetails["model"]} */
  #model;
  /** @type {RequestDetails["reporting"]} */
  #reporting;
  /** @type {RequestDetails["policy"]} */
  #policy;
  /** @type {{ workspace: string, endpoint: string } | undefined} */
  #creation;
  #launchedAt = "2026-01-01T00:00:00.000Z";

  /**
   * An ad hoc creation attempt, in the `open-dough` project with `codex`
   * unless stated.
   * @param {AdHocCreationFacts} facts
   */
  adHoc({
    instruction,
    title,
    source = "open-dough",
    host = "codex",
    followUp,
    maintenance,
  }) {
    this.#requested = {
      ...(instruction !== undefined && { instruction }),
      title,
      source,
      ...(followUp && { followUp }),
      ...(maintenance && { maintenance: { ...maintenance } }),
      workflow: "ad-hoc",
    };
    this.#host = host;
    return this;
  }

  /**
   * An execution creation attempt of the story, in the `open-dough` project
   * with `codex` unless stated.
   * @param {StoryCreationFacts} facts
   */
  executing({ identity, title, source = "open-dough", host = "codex" }) {
    this.#requested = { identity, title, source, workflow: "execution" };
    this.#host = host;
    return this;
  }

  /**
   * A refinement creation attempt of the story, in the `open-dough` project
   * with `codex` unless stated.
   * @param {StoryCreationFacts} facts
   */
  refining({ identity, title, source = "open-dough", host = "codex" }) {
    this.#requested = { identity, title, source, workflow: "refinement" };
    this.#host = host;
    return this;
  }

  /**
   * The unresolved native creation facts awaiting reconciliation.
   * @param {{ workspace: string, endpoint: string }} creation
   */
  unresolved(creation) {
    this.#creation = { ...creation };
    return this;
  }

  /**
   * The launch asked its host for this model.
   * @param {NonNullable<RequestDetails["model"]>} model
   */
  requestingModel(model) {
    this.#model = model;
    return this;
  }

  /**
   * The creation reports through this reporting context.
   * @param {NonNullable<RequestDetails["reporting"]>} reporting
   */
  reportingThrough(reporting) {
    this.#reporting = reporting;
    return this;
  }

  /**
   * The session policy a one-shot or ad hoc start asked for.
   * @param {NonNullable<RequestDetails["policy"]>} policy
   */
  withPolicy(policy) {
    this.#policy = policy;
    return this;
  }

  /** @param {string} at an ISO date-time */
  launchedAt(at) {
    this.#launchedAt = at;
    return this;
  }

  /** @returns {CreationRecord} */
  please() {
    const requested = this.#requested;
    const creation = this.#creation;
    const host = this.#host;
    if (!requested)
      throw new Error(
        "choose .adHoc(...), .executing(...) or .refining(...) first",
      );
    if (!creation)
      throw new Error("choose .unresolved({ workspace, endpoint }) first");
    if (!host) throw new Error("choose a host on the request first");
    return {
      ...requestFacts(requested, {
        host,
        model: this.#model,
        reporting: this.#reporting,
        policy: this.#policy,
      }),
      creation: { ...creation },
      launchedAt: this.#launchedAt,
    };
  }
}
