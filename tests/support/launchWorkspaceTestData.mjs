// @ts-check
// What a kept launch records of the workspace its start established, as the
// dashboard's machine store holds it (`./launchTestData.mjs`): a story's
// worktree on its story branch, kept as an execution's claimed start or a
// refinement's preparation, or an ad hoc session's isolated workspace waiting
// for review or its place in the project's default checkout.

/** @typedef {{ workspace: string, branch: string }} EstablishedBranch */
/**
 * A story branch, and what an execution's claim may also name: its
 * publisher and published revision (fixed ones otherwise), its agent, its
 * plan and the revision it started from. A refinement's preparation names
 * only an agent and a published revision given here.
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
  if (workflow === "refinement")
    return {
      preparation: {
        ...established,
        ...(storyBranch.agent !== undefined && { agent: storyBranch.agent }),
        ...(storyBranch.publishedSha !== undefined && {
          publishedSha: storyBranch.publishedSha,
        }),
      },
    };
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
 * Where an ad hoc start established its session: an isolated workspace of the
 * project on its own branch, waiting for review, or the project's default
 * checkout on `main` at a revision, landing as the developer chose.
 * @typedef {{ role: "isolated", workspace: string, branch: string } | { role: "default-checkout", workspace: string, landing: "auto-land" | "review", revision: string }} AdHocWorkspace
 */

/**
 * The policy an ad hoc request asked for to establish `established`.
 * @param {AdHocWorkspace | undefined} established
 */
export function requestedPolicy(established) {
  if (!established) return undefined;
  return established.role === "isolated"
    ? {
        workspace: /** @type {const} */ ("isolated"),
        landing: /** @type {const} */ ("review"),
      }
    : {
        workspace: /** @type {const} */ ("default-checkout"),
        landing: established.landing,
      };
}

/**
 * The record fields of the workspace an ad hoc start established.
 * @param {AdHocWorkspace | undefined} established
 */
export function establishedSessionFacts(established) {
  if (!established) return {};
  if (established.role === "isolated")
    return {
      establishedSession: {
        workspace: established.workspace,
        role: established.role,
        branch: established.branch,
        remote: "origin",
        target: "main",
        landing: /** @type {const} */ ("review"),
      },
    };
  return {
    establishedSession: {
      workspace: established.workspace,
      role: established.role,
      branch: "main",
      remote: "origin",
      target: "main",
      landing: established.landing,
      startingRevision: established.revision,
      fetched: established.revision,
    },
  };
}
