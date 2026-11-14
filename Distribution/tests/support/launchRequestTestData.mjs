// @ts-check
// The request a kept launch records, as the dashboard's machine store holds it
// (`./launchTestData.mjs`), and the incoming AgentLaunchRequest a call site
// asks the dashboard to accept (`makeMe.aLaunchRequest`).

/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {import("../../../dashboard/src/launchRequest.ts").AgentLaunchRequest} AgentLaunchRequest */
/** @typedef {Extract<LaunchRecord["request"], { workflow: "ad-hoc" }>} KeptAdHocRequest */
/**
 * What a story launch's request states: the project, the story, and its
 * title as the card shows it.
 * @typedef {{ identity: string, title: string, source?: string }} StoryFacts
 */
/**
 * What an ad hoc launch's request states: the project, the instruction it
 * started with (none for a blank session), and the title kept for it.
 * @typedef {{ instruction?: string, title: string, source?: string, followUp?: import("../../../dashboard/src/followUpRequest.ts").FollowUp, maintenance?: KeptAdHocRequest["maintenance"] }} AdHocFacts
 */
/**
 * What the launch asked for: a story by its workflow, or an ad hoc session
 * with the instruction it started with (none for a blank session).
 * @typedef {{ workflow: "execution" | "refinement", identity: string, title: string, source: string } | (AdHocFacts & { workflow: "ad-hoc", source: string })} Requested
 */
/**
 * What the request also states: the session's host, the model and reporting
 * context asked for, and the workspace policy a one-shot or ad hoc start asked for.
 * @typedef {{ host: LaunchRecord["session"]["host"], model?: LaunchRecord["request"]["model"], reporting?: LaunchRecord["request"]["reporting"], policy?: { tracking?: "standard" | "one-shot", workspace: "isolated" | "default-checkout", landing: "auto-land" | "review" } | undefined }} RequestDetails
 */
/**
 * What an incoming story launch's request states: the story, its title as the
 * card shows it, the project and the host.
 * @typedef {{ identity: string, title: string, source?: string, host?: AgentLaunchRequest["host"] }} IncomingStoryFacts
 */
/**
 * What an incoming ad hoc launch's request states beside its host and project.
 * @typedef {{ source?: string, host?: AgentLaunchRequest["host"], instruction?: string, followUp?: Extract<AgentLaunchRequest, { workflow: "ad-hoc" }>["followUp"], maintenance?: Extract<AgentLaunchRequest, { workflow: "ad-hoc" }>["maintenance"] }} IncomingAdHocFacts
 */

/**
 * The record field of the request `requested`, with its details.
 * @param {Requested} requested
 * @param {RequestDetails} details
 * @returns {{ request: LaunchRecord["request"] }}
 */
export function requestFacts(requested, details) {
  return { request: keptRequest(requested, details) };
}

/**
 * @param {Requested} requested
 * @param {RequestDetails} details
 * @returns {LaunchRecord["request"]}
 */
function keptRequest(requested, { host, model, reporting, policy }) {
  const asked = {
    ...(model !== undefined && { model }),
    ...(reporting && { reporting }),
  };
  if (requested.workflow === "ad-hoc")
    return {
      source: requested.source,
      host,
      workflow: requested.workflow,
      title: requested.title,
      ...(requested.instruction !== undefined && {
        instruction: requested.instruction,
      }),
      ...(requested.followUp && { followUp: requested.followUp }),
      ...(requested.maintenance && {
        maintenance: { ...requested.maintenance },
      }),
      ...asked,
      ...(policy && { policy }),
    };
  return {
    source: requested.source,
    identity: requested.identity,
    title: requested.title,
    workflow: requested.workflow,
    host,
    ...asked,
    ...(policy?.tracking !== undefined && {
      policy: { ...policy, tracking: policy.tracking },
    }),
  };
}

/**
 * An accepted attempt holds the same ad hoc request before the record adds
 * its derived title and reporting context.
 * @param {KeptAdHocRequest} kept
 * @returns {Extract<AgentLaunchRequest, { workflow: "ad-hoc" }>}
 */
export function incomingAdHocRequest({ title, reporting, ...request }) {
  void title;
  void reporting;
  return request;
}

// One incoming launch request. Choose its workflow facts; it is otherwise for
// the `open-dough` project on `claude`. Options, model, policy, and other
// launch choices the case names stay on the builder, not invented here.
export class LaunchRequestBuilder {
  /** @type {AgentLaunchRequest | undefined} */
  #request;

  /**
   * A story launch by this workflow, in the `open-dough` project with
   * `claude` unless stated.
   * @param {"execution" | "refinement"} workflow
   * @param {IncomingStoryFacts} facts
   */
  ofWorkflow(
    workflow,
    { identity, title, source = "open-dough", host = "claude" },
  ) {
    this.#request = { source, identity, title, workflow, host };
    return this;
  }

  /** @param {IncomingStoryFacts} facts an execution launch of the story */
  executing(facts) {
    return this.ofWorkflow("execution", facts);
  }

  /** @param {IncomingStoryFacts} facts a refinement launch of the story */
  refining(facts) {
    return this.ofWorkflow("refinement", facts);
  }

  /**
   * An ad hoc session start, in the `open-dough` project with `claude`
   * unless stated. A blank session omits `instruction`.
   * @param {IncomingAdHocFacts} [facts]
   */
  adHoc({
    source = "open-dough",
    host = "claude",
    instruction,
    followUp,
    maintenance,
  } = {}) {
    this.#request = {
      source,
      workflow: "ad-hoc",
      host,
      ...(instruction !== undefined && { instruction }),
      ...(followUp && { followUp: { ...followUp } }),
      ...(maintenance && { maintenance: { ...maintenance } }),
    };
    return this;
  }

  /**
   * The developer's own instruction on the request.
   * @param {string} instruction
   */
  withInstruction(instruction) {
    const request = this.#chosen();
    this.#request = { ...request, instruction };
    return this;
  }

  /**
   * The launch asked its host for this model.
   * @param {NonNullable<AgentLaunchRequest["model"]>} model
   */
  requestingModel(model) {
    const request = this.#chosen();
    this.#request = { ...request, model };
    return this;
  }

  /**
   * The launch asked its host for this reasoning effort.
   * @param {NonNullable<AgentLaunchRequest["effort"]>} effort
   */
  withEffort(effort) {
    const request = this.#chosen();
    this.#request = { ...request, effort };
    return this;
  }

  /**
   * The flags selected from the skill's options.
   * @param {NonNullable<AgentLaunchRequest["options"]>} options
   */
  withOptions(options) {
    const request = this.#chosen();
    this.#request = { ...request, options: [...options] };
    return this;
  }

  /**
   * The session policy a one-shot or ad hoc start asked for.
   * @param {NonNullable<AgentLaunchRequest["policy"]>} policy
   */
  withPolicy(policy) {
    const request = this.#chosen();
    this.#request = /** @type {AgentLaunchRequest} */ ({
      ...request,
      policy: { ...policy },
    });
    return this;
  }

  /**
   * Ordered content digests of attached images on an ad hoc request.
   * @param {NonNullable<AgentLaunchRequest["attachmentDigests"]>} digests
   */
  withAttachmentDigests(digests) {
    const request = this.#chosen();
    this.#request = { ...request, attachmentDigests: [...digests] };
    return this;
  }

  /**
   * Confirmed existing changes fingerprint for a default-checkout start.
   * @param {NonNullable<AgentLaunchRequest["existingChanges"]>} fingerprint
   */
  confirmingExistingChanges(fingerprint) {
    const request = this.#chosen();
    this.#request = { ...request, existingChanges: fingerprint };
    return this;
  }

  /** @returns {AgentLaunchRequest} */
  please() {
    return structuredClone(this.#chosen());
  }

  /** @returns {AgentLaunchRequest} */
  #chosen() {
    if (!this.#request)
      throw new Error(
        "choose .executing(...), .refining(...), .ofWorkflow(...) or .adHoc(...) first",
      );
    return this.#request;
  }
}
