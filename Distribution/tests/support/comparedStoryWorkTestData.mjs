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

/**
 * `identity` Taken by the engineer in `mode` on `branch`.
 * @param {string} identity
 * @param {"trunk" | "story-branch"} mode
 * @param {string} branch
 * @returns {PublishedWork["taken"]}
 */
export function takenListing(identity, mode, branch) {
  return [
    {
      ...listed(identity, "Story A", "https://example.test/story"),
      owner: {
        status: "recorded",
        assignments: [
          {
            profilePath: ".planning/agents/engineer.json",
            name: "engineer",
            agent: "engineer",
            mode,
            branch,
            host: undefined,
            model: undefined,
            human: { status: "no-addition" },
          },
        ],
      },
    },
  ];
}

/**
 * `identity` queued in the backlog.
 * @param {string} identity @returns {PublishedWork["backlog"]}
 */
export function queuedBacklog(identity) {
  return [listed(identity, "Story B", "https://example.test/b")];
}
