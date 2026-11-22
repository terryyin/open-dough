// @ts-check
// The published work a compared story (./comparedStoryTestData.mjs) is read
// from: the Done catalogue, the Taken listing and the queued backlog.
import { checkedAt, revisions } from "./comparedStoryAnswerTestData.mjs";

/** @typedef {import("../../../dashboard/src/publishedWork.ts").PublishedWork} PublishedWork */
/** @typedef {import("../../../dashboard/src/publishedSource.ts").PublishedSource} PublishedSource */

/**
 * The published work at the completion revision, listing no story.
 * @param {PublishedSource} source @returns {PublishedWork}
 */
export function publishedWork(source) {
  return {
    source,
    revision: revisions[2],
    retrievedAt: new Date(checkedAt),
    direction: "",
    taken: [],
    backlog: [],
  };
}

/**
 * The Done catalogue holding the one story `identity`, completed at check time.
 * @param {string} identity @param {string} blob
 * @returns {NonNullable<PublishedWork["done"]>}
 */
export function catalogued(identity, blob) {
  return {
    status: "catalogued",
    revision: revisions[2],
    records: [
      {
        identity,
        completedAt: checkedAt,
        fileName: `${identity.replace("#", "_")}.json`,
        blob,
      },
    ],
    unreadable: [],
  };
}

/** @param {string} identity @param {string} title @param {string} url */
function listed(identity, title, url) {
  return {
    identity,
    title,
    canonical: { kind: /** @type {const} */ ("external"), recorded: url, url },
  };
}

/** @typedef {import("../../../dashboard/src/publishedWork.ts").WorkEntry} WorkEntry */
/** @typedef {import("../../../dashboard/src/agentAssignments.ts").AgentHost} AgentHost */

/**
 * `identity`, titled `title`, Taken by `agent` (default `engineer`) in `mode`
 * on `branch`, in `host` when the profile names one.
 * @param {{ readonly identity: string; readonly title: string; readonly mode: "trunk" | "story-branch"; readonly branch: string; readonly agent?: string; readonly host?: AgentHost }} taken
 * @returns {WorkEntry}
 */
export function takenEntry({
  identity,
  title,
  mode,
  branch,
  agent = "engineer",
  host,
}) {
  return {
    ...listed(identity, title, "https://example.test/story"),
    owner: {
      status: "recorded",
      assignments: [
        {
          profilePath: `.planning/agents/${agent}.json`,
          name: agent,
          agent,
          mode,
          branch,
          host,
          model: undefined,
          human: { status: "no-addition" },
        },
      ],
    },
  };
}

/**
 * `identity` Taken by the engineer in `mode` on `branch`.
 * @param {string} identity
 * @param {"trunk" | "story-branch"} mode
 * @param {string} branch
 * @returns {PublishedWork["taken"]}
 */
export function takenListing(identity, mode, branch) {
  return [takenEntry({ identity, title: "Story A", mode, branch })];
}

/**
 * `identity` queued in the backlog.
 * @param {string} identity @returns {PublishedWork["backlog"]}
 */
export function queuedBacklog(identity) {
  return [listed(identity, "Story B", "https://example.test/b")];
}
