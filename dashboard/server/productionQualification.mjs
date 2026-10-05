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
} from "../../src/skills/dough-execute-plan/scripts/ci-workflow-path-policy.mjs";
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
 * Every path changed between two trees, deletions and both rename endpoints
 * included, read NUL-separated so any file name survives.
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
  return stdout.split("\0").filter((file) => file !== "");
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
      throw new Error(
        `Could not read ${ciWorkflowPath} at ${selected.commit}.`,
        { cause: error },
      );
    }
    const excluded = pushExclusions(workflow, selected.commit);
    const changed = await changedPaths(
      directory,
      baseline.commit,
      selected.commit,
      signal,
    );
    const qualifying = changed.filter((file) => !isPathIgnored(file, excluded));
    return { qualifies: qualifying.length > 0, changed, qualifying };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
