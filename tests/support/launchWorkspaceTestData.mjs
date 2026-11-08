// @ts-check
// What a kept launch records of the workspace its start established, as the
// dashboard's machine store holds it (`./launchTestData.mjs`): a story's
// worktree on its story branch, kept as an execution's claimed start or a
// refinement's preparation, or an ad hoc session's isolated workspace waiting
// for review.

/** @typedef {{ workspace: string, branch: string }} EstablishedBranch */
/**
 * A story branch, and what an execution's claim may also name: its
 * publisher and published revision (fixed ones otherwise), its agent, its
 * plan and the revision it started from.
 * @typedef {EstablishedBranch & { publisherId?: string, publishedSha?: string, agent?: string, plan?: string, startingRevision?: string }} StoryBranch
 */

/**
 * The record fields of the story branch `storyBranch` the story's execution
 * or refinement established, with fixed published facts for an execution.
 * @param {{ workflow: "execution" | "refinement", identity: string }} story
 * @param {StoryBranch | undefined} storyBranch
 */
export function storyBranchFacts({ workflow, identity }, storyBranch) {
  if (!storyBranch) return {};
  const established = {
    identity,
    workspace: storyBranch.workspace,
    branch: storyBranch.branch,
    remote: "origin",
    target: "main",
  };
  if (workflow === "refinement") return { preparation: established };
  return {
    start: {
      ...established,
      publisherId: storyBranch.publisherId ?? "a1b2c3",
      mode: /** @type {const} */ ("story-branch"),
      publishedSha: storyBranch.publishedSha ?? "b2".repeat(20),
      ...(storyBranch.agent !== undefined && { agent: storyBranch.agent }),
      ...(storyBranch.plan !== undefined && { plan: storyBranch.plan }),
      ...(storyBranch.startingRevision !== undefined && {
        startingRevision: storyBranch.startingRevision,
      }),
    },
  };
}

/**
 * The record fields of the isolated workspace an ad hoc start established.
 * @param {EstablishedBranch | undefined} isolated
 */
export function isolatedWorkspaceFacts(isolated) {
  if (!isolated) return {};
  return {
    establishedSession: {
      workspace: isolated.workspace,
      role: /** @type {const} */ ("isolated"),
      branch: isolated.branch,
      remote: "origin",
      target: "main",
      landing: /** @type {const} */ ("review"),
    },
  };
}
