// Trunk repositories and run listings for the cancelled-landing forward walk
// tests (./dashboard-later-trunk-build.test.mjs,
// ./dashboard-later-trunk-landed.test.mjs).
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function commit(cwd, name) {
  writeFileSync(path.join(cwd, `${name}.txt`), `${name}\n`);
  git(cwd, "add", "-A");
  git(cwd, "commit", "--quiet", "-m", name);
  return git(cwd, "rev-parse", "HEAD");
}

// A repository on main whose first commit is the landing.
function landingRepo(prefix) {
  const cwd = mkdtempSync(path.join(tmpdir(), prefix));
  git(cwd, "init", "--quiet", "--initial-branch=main");
  git(cwd, "config", "user.name", "Test");
  git(cwd, "config", "user.email", "test@example.org");
  git(cwd, "config", "commit.gpgsign", "false");
  return { cwd, landing: commit(cwd, "landing"), call: { cwd } };
}

// landing, then four first-parent trunk revisions; the second is a merge
// whose side commit must never be walked.
export function trunk() {
  const repo = landingRepo("later-trunk-");
  const { cwd } = repo;
  const later1 = commit(cwd, "later1");
  git(cwd, "switch", "--quiet", "-c", "side");
  const side = commit(cwd, "side");
  git(cwd, "switch", "--quiet", "main");
  git(cwd, "merge", "--quiet", "--no-ff", "--no-edit", "side");
  const later2 = git(cwd, "rev-parse", "HEAD");
  const later3 = commit(cwd, "later3");
  const later4 = commit(cwd, "later4");
  return { ...repo, side, later: [later1, later2, later3, later4] };
}

// landing, then `count` single-parent trunk revisions.
export function trunkOf(count) {
  const repo = landingRepo("later-trunk-deep-");
  const later = [];
  for (let index = 0; index < count; index += 1)
    later.push(commit(repo.cwd, `later${String(index)}`));
  return { ...repo, later };
}

export const usable = async () => undefined;

// A proof-absence fact the forward walk stores and names.
export const absent = (reason) => ({ kind: "unavailable", reason });

export function run(sha, id, conclusion, extra = {}) {
  return {
    databaseId: id,
    attempt: 1,
    headSha: sha,
    status: "completed",
    conclusion,
    createdAt: "2026-11-05T12:00:00Z",
    startedAt: "2026-11-05T12:00:00Z",
    completedAt: "2026-11-05T12:03:00Z",
    ...extra,
  };
}

export function lookupOf(runs) {
  const listed = [];
  return {
    listed,
    lookup: {
      listRunsAt: async (sha) => {
        listed.push(sha);
        return runs[sha] ?? [];
      },
      subjectOf: async () => "subject",
      timeWithoutRunnerWaitsOf: async () => ({ reason: "not read" }),
    },
  };
}
