// @ts-check
// The request a kept launch records, as the dashboard's machine store holds it
// (`./launchTestData.mjs`): what a story's execution or refinement, or an ad
// hoc session, asked of its session's host.

/** @typedef {import("../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {Extract<LaunchRecord["request"], { workflow: "ad-hoc" }>} KeptAdHocRequest */
/**
 * What a story launch's request states: the project, the story, and its
 * title as the card shows it.
 * @typedef {{ identity: string, title: string, source?: string }} StoryFacts
 */
/**
 * What an ad hoc launch's request states: the project, the instruction it
 * started with (none for a blank session), and the title kept for it.
 * @typedef {{ instruction?: string, title: string, source?: string, followUp?: import("../../dashboard/src/followUpRequest.ts").FollowUp, maintenance?: KeptAdHocRequest["maintenance"] }} AdHocFacts
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
 * @returns {Extract<import("../../dashboard/src/launchRequest.ts").AgentLaunchRequest, { workflow: "ad-hoc" }>}
 */
export function incomingAdHocRequest({ title, reporting, ...request }) {
  void title;
  void reporting;
  return request;
}
