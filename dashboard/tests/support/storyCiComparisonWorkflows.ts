// CI workflow files a CI comparison fixture (./storyCiComparisonFixture.ts)
// commits: this repository's own workflow at a selected path, and a workflow
// whose paths-ignore confirms skips.

import { readFileSync } from "node:fs";
import { commitAll, writeAt } from "./storyReviewWorktree.ts";

export const comparisonWorkflowPath = ".github/workflows/comparison.yml";
export const comparisonWorkflow = readFileSync(
  new URL("../../../.github/workflows/ci.yml", import.meta.url),
  "utf8",
);

// Workflow file whose paths-ignore matches this repository's CI, so a fixture
// can confirm a skip at a planning-only or docs-only revision.
export const comparisonCiWorkflow = [
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
  "    steps:",
  "      - run: echo ok",
  "",
].join("\n");

export function commitComparisonCiWorkflow(project: string): void {
  writeAt(project, ".github/workflows/ci.yml", comparisonCiWorkflow);
  commitAll(project, "add CI workflow with paths-ignore");
}
