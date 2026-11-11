// @ts-check
// Shared repository and workflow fixtures for requested-revision CI status.
import { defaultGitOutputLimit } from "../../dashboard/server/gitRunner.ts";
import { materializeLocalCheckout } from "./repository-fixture.mjs";

export const ignoredWorkflow = [
  "name: CI",
  "",
  "on:",
  "  push:",
  "    paths-ignore:",
  "      - '.planning/**'",
  "      - 'docs/**'",
  "  pull_request:",
  "    paths-ignore:",
  "      - '.planning/**'",
  "      - 'docs/**'",
  "  workflow_dispatch:",
  "",
  "jobs:",
  "  check:",
  "    runs-on: ubuntu-24.04",
  "",
].join("\n");

export const phraseCases = [
  ["required", "changes CI does not ignore"],
  ["unreadable-revision", "the workflow at that revision could not be read"],
  [
    "numeric-workflow",
    "the configured workflow is a numeric ID, so a skip cannot be confirmed",
  ],
  ["mixed-paths", "changes mix ignored and non-ignored paths"],
  ["non-ignored-delete", "a delete touches a path CI does not ignore"],
  ["non-ignored-rename", "a rename touches a path CI does not ignore"],
  ["no-ancestor-basis", "no ancestor build was found to compare against"],
  [
    "unsupported-workflow-policy",
    "the workflow's path rule could not be confirmed",
  ],
  ["unreadable-diff", "the diff from the nearest build could not be read"],
];

export function callOf(repo) {
  return { cwd: repo, maxBuffer: defaultGitOutputLimit };
}

/** A base revision holding `app.js`, and the workflow when one is stated. */
export const base = (workflow) => ({
  backlog: null,
  files: {
    ...(workflow && { ".github/workflows/ci.yml": workflow }),
    "app.js": "base\n",
  },
});

export const planningOnly = { files: { ".planning/note.md": "plan\n" } };
export const codeChange = { files: { "app.js": "changed\n" } };

/** One local checkout on main holding the described revisions. */
export async function repositoryOf(t, description) {
  const { integration, revisions } = await materializeLocalCheckout(
    t,
    description,
  );
  return { revisions, call: callOf(integration) };
}
