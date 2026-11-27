// Decides whether published main's pending change range warrants a production
// build, using the CI push exclusions published with the selected commit.
// Inspection happens in an owned checkout fetched from origin; the development
// checkout's edits, refs, and workflow are not inputs.
import { execFile } from "node:child_process";
import { rm } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import {
  isPathIgnored,
  readCiPathIgnorePolicy,
} from "../../Distribution/src/skills/dough-execute-plan/scripts/ci-workflow-path-policy.mjs";
import {
  fetchIntoOwnedDirectory,
  ownedCommitDirectory,
} from "./productionDeployment.mjs";
import { command } from "./productionProcess.mjs";

const exec = promisify(execFile);
export const ciWorkflowPath = ".github/workflows/ci.yml";

/**
 * Push exclusions from a workflow's text; throws when the policy is
 * unsupported. A workflow without push exclusions excludes nothing.
 * @param {string} workflow @param {string} commit
 * @returns {string[]}
 */
function pushExclusions(workflow, commit) {
  const policy = readCiPathIgnorePolicy(workflow);
  if (!policy.supported) {
    throw new Error(
      `${ciWorkflowPath} at ${commit} has an unsupported CI push path policy.`,
    );
  }
  return policy.events.push?.pathsIgnore ?? [];
}

/**
 * `git diff --name-only -z` output between two trees: every changed path,
 * deletions and both rename endpoints included, NUL-separated.
 * @param {string} directory @param {string} from @param {string} to
 * @param {AbortSignal} [signal]
 */
async function changedPaths(directory, from, to, signal) {
  const { stdout } = await exec(
    "git",
    ["diff", "--name-only", "--no-renames", "-z", from, to, "--"],
    {
      cwd: directory,
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      ...(signal ? { signal } : {}),
    },
  );
  return stdout;
}

/**
 * Compares the successfully served baseline with the selected candidate.
 * Qualifies when any changed path lies outside the candidate's push
 * exclusions. Throws when either commit or the candidate's policy is
 * unreadable or unsupported.
 * @param {{developmentRoot: string, baseline: import("./productionDeployment.mjs").PublishedCommit, selected: import("./productionDeployment.mjs").PublishedCommit, inspectionsRoot?: string, env?: NodeJS.ProcessEnv, signal?: AbortSignal}} options
 * @returns {Promise<{qualifies: boolean, changed: string[], qualifying: string[]}>}
 */
export async function qualifyPublishedRange(options) {
  const { baseline, selected, env, signal } = options;
  const directory = await ownedCommitDirectory(
    options.developmentRoot,
    options.inspectionsRoot ??
      path.join(homedir(), ".open-dough/dashboard/inspections"),
    selected.commit,
  );
  const commandOptions = {
    cwd: directory,
    ...(env ? { env } : {}),
    ...(signal ? { signal } : {}),
  };
  try {
    await command("git", ["init", "--quiet", "--bare"], commandOptions);
    // Both trees are enough for a path comparison; history is not needed.
    await fetchIntoOwnedDirectory(
      selected.origin,
      [baseline.commit, selected.commit],
      commandOptions,
    );
    /** @type {string | Error} */
    let workflow;
    try {
      workflow = (
        await exec("git", ["show", `${selected.commit}:${ciWorkflowPath}`], {
          ...commandOptions,
          encoding: "utf8",
          maxBuffer: 16 * 1024 * 1024,
        })
      ).stdout;
    } catch (error) {
      signal?.throwIfAborted();
      workflow = /** @type {Error} */ (error);
    }
    const diff = await changedPaths(
      directory,
      baseline.commit,
      selected.commit,
      signal,
    );
    return qualifyChangedPaths({ commit: selected.commit, workflow, diff });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

/**
 * Qualifies when any path the NUL-separated diff names lies outside the push
 * exclusions of the workflow published with the selected commit; throws when
 * that workflow could not be read or its policy is unsupported.
 * @param {{commit: string, workflow: string | Error, diff: string}} range
 * @returns {{qualifies: boolean, changed: string[], qualifying: string[]}}
 */
export function qualifyChangedPaths({ commit, workflow, diff }) {
  if (workflow instanceof Error) {
    throw new Error(`Could not read ${ciWorkflowPath} at ${commit}.`, {
      cause: workflow,
    });
  }
  const excluded = pushExclusions(workflow, commit);
  const changed = diff.split("\0").filter((file) => file !== "");
  const qualifying = changed.filter((file) => !isPathIgnored(file, excluded));
  return { qualifies: qualifying.length > 0, changed, qualifying };
}
