import { execFile, execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

// Real temporary Git repositories only: tests using these fixtures drive
// actual `git init`, commits, and `git show`/`diff`/`merge-base` plumbing
// through the module's own functions rather than injecting the expected
// classification.

export const exec = promisify(execFile);

export async function git(cwd, ...args) {
  return exec("git", args, { cwd });
}

export async function sha(cwd, ref = "HEAD") {
  return (await git(cwd, "rev-parse", ref)).stdout.trim();
}

export async function commitAll(cwd, message) {
  await git(cwd, "add", "-A");
  await git(cwd, "commit", "-m", message);
  return sha(cwd);
}

export async function initRepo() {
  const repo = mkdtempSync(join(tmpdir(), "ci-path-applicability-"));
  await git(repo, "init", "-q", "-b", "main");
  await git(repo, "config", "user.name", "Path Applicability Fixture");
  await git(repo, "config", "user.email", "path-applicability@example.test");
  return repo;
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

function execFileSyncMkdirp(dir) {
  execFileSync("mkdir", ["-p", dir]);
}

export function writeWorkflow(repo, content) {
  execFileSyncMkdirp(join(repo, ".github", "workflows"));
  writeFileSync(join(repo, ".github", "workflows", "ci.yml"), content);
}
