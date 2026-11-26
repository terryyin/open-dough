// Each browser test group once, as its runner and its CI job both take it:
// the npm `command` its job in ../../../.github/workflows/ci.yml runs, its
// OPEN_DOUGH_* settings `prefix`, the `directory` its configs live in and
// labels specs relative to, its Playwright `config` unless it runs on Vitest
// alone, its test `root` there and its CI
// `job`, whose declared shards it runs (./runnerConfig.mjs
// prepareFocusedRun). Their agreement with ci.yml:
// ../../../Distribution/tests/support/ci-browser-groups.test.mjs.
import { ciGroupSelection } from "./testFiles.mjs";

/**
 * @typedef {{
 *   job: string,
 *   command: string,
 *   prefix: string,
 *   directory: URL,
 *   root: string,
 *   config?: string,
 * }} BrowserTestGroup
 */

const dashboard = new URL("../../", import.meta.url);

/** @type {BrowserTestGroup} */
export const e2eGroup = {
  job: "e2e",
  command: "test:e2e",
  prefix: "OPEN_DOUGH_E2E",
  directory: new URL("../e2e/", dashboard),
  root: ".",
  config: "playwright.config.ts",
};

/** @type {BrowserTestGroup} */
export const frontendGroup = {
  job: "dashboard-frontend",
  command: "test:dashboard:frontend",
  prefix: "OPEN_DOUGH_DASHBOARD_FRONTEND",
  directory: dashboard,
  root: "frontend-tests",
};

/** @type {BrowserTestGroup} */
export const backendGroup = {
  job: "dashboard-backend",
  command: "test:dashboard:backend",
  prefix: "OPEN_DOUGH_DASHBOARD_BACKEND",
  directory: dashboard,
  root: "backend-tests",
  config: "backend.playwright.config.ts",
};

export const browserTestGroups = [e2eGroup, frontendGroup, backendGroup];

/**
 * `group`'s spec selection as its runner makes it: its root, split by
 * `<prefix>_SPLIT` into the shards its CI job declares (./testFiles.mjs).
 * @param {Pick<BrowserTestGroup, "prefix" | "root" | "job">} group
 */
export function browserGroupSelection({ prefix, root, job }) {
  return ciGroupSelection(root, `${prefix}_SPLIT`, job);
}
