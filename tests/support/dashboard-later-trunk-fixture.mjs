// Trunk repositories and run listings for the cancelled-landing forward walk
// tests (./dashboard-later-trunk-build.test.mjs,
// ./dashboard-later-trunk-landed.test.mjs).
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function commit(cwd, name) {
  writeFileSync(path.join(cwd, `${name}.txt`), `${name}\n`);
  git(cwd, "add", "-A");
  git(cwd, "commit", "--quiet", "-m", name);
  return git(cwd, "rev-parse", "HEAD");
}

// A trunk revision that adds `<name>.txt`.
const revision = (name) => ({ files: { [`${name}.txt`]: `${name}\n` } });

// landing, then four first-parent trunk revisions; the second is a merge
// whose side commit must never be walked. The side branch, the merge and the
// last two revisions are Git operations on the materialized checkout.
export async function trunk(t) {
  const { integration: cwd, revisions } = await materializeLocalCheckout(
    t,
    makeMe.aRepository
      .withRevision("landing", revision("landing"))
      .withRevision("later1", revision("later1"))
      .please(),
  );
  git(cwd, "switch", "--quiet", "-c", "side");
  const side = commit(cwd, "side");
  git(cwd, "switch", "--quiet", "main");
  git(cwd, "merge", "--quiet", "--no-ff", "--no-edit", "side");
  const later2 = git(cwd, "rev-parse", "HEAD");
  const later3 = commit(cwd, "later3");
  const later4 = commit(cwd, "later4");
  return {
    call: { cwd },
    landing: revisions.landing,
    side,
    later: [revisions.later1, later2, later3, later4],
  };
}

// landing, then `count` single-parent trunk revisions.
export async function trunkOf(t, count) {
  const names = [...Array(count).keys()].map((index) => `later${index}`);
  const description = names
    .reduce(
      (builder, name) => builder.withRevision(name, revision(name)),
      makeMe.aRepository.withRevision("landing", revision("landing")),
    )
    .please();
  const { integration: cwd, revisions } = await materializeLocalCheckout(
    t,
    description,
  );
  return {
    call: { cwd },
    landing: revisions.landing,
    later: names.map((name) => revisions[name]),
  };
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
