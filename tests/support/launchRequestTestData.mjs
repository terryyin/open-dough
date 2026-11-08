// @ts-check
// The request a kept launch records, as the dashboard's machine store holds it
// (`./launchTestData.mjs`): what a story's execution or refinement, or an ad
// hoc session, asked of its session's host.

/** @typedef {import("../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/**
 * What the launch asked for: a story by its workflow, or an ad hoc session
 * with the instruction it started with (none for a blank session).
 * @typedef {{ workflow: "execution" | "refinement", identity: string, title: string, source: string } | { workflow: "ad-hoc", instruction?: string, title: string, source: string, followUp?: import("../../dashboard/src/followUpRequest.ts").FollowUp }} Requested
 */
/**
 * What the request also states: the session's host, the model and reporting
 * context asked for, and whether an ad hoc start isolates its workspace.
 * @typedef {{ host: LaunchRecord["session"]["host"], model?: LaunchRecord["request"]["model"], reporting?: LaunchRecord["request"]["reporting"], isolated: boolean }} RequestDetails
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
function keptRequest(requested, { host, model, reporting, isolated }) {
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
      ...asked,
      ...(isolated && {
        policy: {
          workspace: /** @type {const} */ ("isolated"),
          landing: /** @type {const} */ ("review"),
        },
      }),
    };
  return {
    source: requested.source,
    identity: requested.identity,
    title: requested.title,
    workflow: requested.workflow,
    host,
    ...asked,
  };
}
