// The settings each browser test group's runner reads, by name and from a
// given environment, and where its run keeps its files: only its own
// `<prefix>_*` settings (./browserTestGroups.mjs), so no run reads another
// runner's split, times, proof record or deadline. The npm group run
// (../../../scripts/dashboard-group-run.mjs) and the Playwright
// configurations (./runnerConfig.mjs) share them.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runOutputs } from "./testFiles.mjs";

/**
 * `<prefix>_SPLIT`, `_TIMES`, `_PROOF_RECORD`, `_DEADLINE_MS` and
 * `_RUN_STAMP`: the settings one runner reads.
 * @param {string} prefix
 */
export function runnerVariables(prefix) {
  return {
    split: `${prefix}_SPLIT`,
    times: `${prefix}_TIMES`,
    proofRecord: `${prefix}_PROOF_RECORD`,
    deadline: `${prefix}_DEADLINE_MS`,
    runStamp: `${prefix}_RUN_STAMP`,
  };
}

/**
 * The settings `group`'s run reads from `env`: only its own `<prefix>_*`
 * split (none for an unsharded group), proof record, times, deadline and
 * Playwright run stamp.
 * @param {import("./browserTestGroups.mjs").BrowserTestGroup} group
 * @param {Record<string, string | undefined>} env
 */
export function groupRunSettings({ prefix, sharded }, env) {
  const variables = runnerVariables(prefix);
  const names = {
    split: sharded === false ? undefined : variables.split,
    proofRecord: variables.proofRecord,
    times: variables.times,
    deadline: variables.deadline,
    runStamp: variables.runStamp,
  };
  return {
    names,
    split: names.split === undefined ? undefined : env[names.split],
    proofRecord: env[names.proofRecord],
    times: env[names.times],
    deadline: env[names.deadline],
    runStamp: env[names.runStamp],
  };
}

/**
 * The absolute directory holding `group`'s run directories (`test-results/`)
 * and CI `playwright-report/` directories: its own `root` of `directory`.
 * @param {Pick<import("./browserTestGroups.mjs").BrowserTestGroup, "directory" | "root">} group
 */
export function groupOutputs({ directory, root }) {
  return fileURLToPath(new URL(`${root}/`, directory));
}

/**
 * The directory under `group`'s own root's `test-results/` that keeps a
 * failed Vitest run's report, named by the run's start and process.
 * @param {import("./browserTestGroups.mjs").BrowserTestGroup} group
 * @param {string} startedAt ISO time
 * @param {number} pid
 */
export function vitestRunDirectory(group, startedAt, pid) {
  return path.join(
    groupOutputs(group),
    runOutputs.results,
    `vitest-${startedAt.replaceAll(":", "-")}-${pid}`,
  );
}
