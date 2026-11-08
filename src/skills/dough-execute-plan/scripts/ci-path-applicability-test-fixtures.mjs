import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";

// Real temporary Git repositories only: tests using these fixtures declare
// their commits, workflow text included, through `makeMe.aRepository` and
// drive actual `git show`/`diff`/`merge-base` plumbing through the module's
// own functions rather than injecting the expected classification.

const exec = promisify(execFile);

export async function git(cwd, ...args) {
  return exec("git", args, { cwd });
}

export async function commitAll(cwd, message) {
  await git(cwd, "add", "-A");
  await git(cwd, "commit", "-m", message);
  return (await git(cwd, "rev-parse", "HEAD")).stdout.trim();
}

// Where the classifier reads the workflow a revision declares.
export const workflowPath = ".github/workflows/ci.yml";

// The integration checkout of a described repository as `repo` and its named
// revisions' commits; `t.after` removes the materialized fixture.
export async function describedRepository(t, description) {
  const repository = await materializeRepository(description);
  t.after(repository.cleanup);
  return { repo: repository.integration, revisions: repository.revisions };
}

export const acceptedWorkflow = [
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
  "      - run: echo ${{ matrix.check }}",
  "",
].join("\n");

// An applicable `base` revision declaring app code and the workflow, for a
// case to add its descendants to. It is no Open Dough backlog project.
export const applicableBase = (
  workflow = acceptedWorkflow,
  app = "console.log('base');\n",
) =>
  makeMe.aRepository.withRevision("base", {
    backlog: undefined,
    files: { "app.js": app, [workflowPath]: workflow },
  });

export const allBranchesWorkflow = [
  "name: CI",
  "on:",
  "  push:",
  "    branches:",
  '      - "**"',
  "    paths-ignore:",
  '      - ".planning/**"',
  '      - "docs/**"',
  "jobs:",
  "  check:",
  "    runs-on: ubuntu-24.04",
  "",
].join("\n");

export function writeWorkflow(repo, content) {
  const file = join(repo, workflowPath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}
