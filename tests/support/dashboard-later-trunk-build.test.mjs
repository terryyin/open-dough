// Cancelled-landing forward walk (`../../dashboard/server/laterTrunkBuild.ts`)
// and its place in Story Branch Landed (`lookupResultBuild`): trunk's
// first-parent revisions after the landing, nearest first; the nearest later
// build with usable proof, past cancelled, unbuilt and proofless revisions;
// stops at a running build. Timed-out and rerun-passed landings stay exact.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { lookupResultBuild } from "../../dashboard/server/baseCiRevisionLookup.ts";
import { storyBranchLandedExactLookup } from "../../dashboard/server/exactSkippedEquivalent.ts";
import {
  laterTrunkChain,
  laterTrunkProofBuild,
} from "../../dashboard/server/laterTrunkBuild.ts";

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function commit(cwd, name) {
  writeFileSync(path.join(cwd, `${name}.txt`), `${name}\n`);
  git(cwd, "add", "-A");
  git(cwd, "commit", "--quiet", "-m", name);
  return git(cwd, "rev-parse", "HEAD");
}

// landing, then four first-parent trunk revisions; the second is a merge
// whose side commit must never be walked.
function trunk() {
  const cwd = mkdtempSync(path.join(tmpdir(), "later-trunk-"));
  git(cwd, "init", "--quiet", "--initial-branch=main");
  git(cwd, "config", "user.name", "Test");
  git(cwd, "config", "user.email", "test@example.org");
  git(cwd, "config", "commit.gpgsign", "false");
  const landing = commit(cwd, "landing");
  const later1 = commit(cwd, "later1");
  git(cwd, "switch", "--quiet", "-c", "side");
  const side = commit(cwd, "side");
  git(cwd, "switch", "--quiet", "main");
  git(cwd, "merge", "--quiet", "--no-ff", "--no-edit", "side");
  const later2 = git(cwd, "rev-parse", "HEAD");
  const later3 = commit(cwd, "later3");
  const later4 = commit(cwd, "later4");
  return {
    cwd,
    landing,
    side,
    later: [later1, later2, later3, later4],
    call: { cwd },
  };
}

function run(sha, id, conclusion, extra = {}) {
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

function lookupOf(runs) {
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

test("laterTrunkChain lists first-parent trunk revisions after the landing, nearest first, within the bound", async (t) => {
  const repo = trunk();
  t.after(() => rmSync(repo.cwd, { recursive: true, force: true }));
  assert.deepEqual(
    await laterTrunkChain(repo.landing, "main", repo.call),
    repo.later,
  );
  assert.deepEqual(
    await laterTrunkChain(repo.landing, "main", repo.call, 2),
    repo.later.slice(0, 2),
  );
  assert.deepEqual(await laterTrunkChain(repo.later[3], "main", repo.call), []);
});

test("laterTrunkProofBuild passes cancelled, unbuilt and proofless builds and counts included revisions", async (t) => {
  const repo = trunk();
  t.after(() => rmSync(repo.cwd, { recursive: true, force: true }));
  const [later1, later2, later3, later4] = repo.later;
  const { listed, lookup } = lookupOf({
    [later1]: [run(later1, 11, "cancelled")],
    [later3]: [run(later3, 13, "success")],
    [later4]: [run(later4, 14, "success")],
  });
  const checked = [];
  const build = await laterTrunkProofBuild(
    repo.landing,
    "main",
    lookup,
    repo.call,
    async (candidate) => {
      checked.push(candidate.runId);
      return candidate.runId === 14;
    },
  );
  assert.equal(build?.revision, later4);
  assert.equal(build?.runId, 14);
  assert.equal(build?.state, "pass");
  assert.equal(build?.selection, "later");
  assert.equal(build?.laterWithoutResult, 4);
  assert.deepEqual(listed, [later1, later2, later3, later4]);
  assert.deepEqual(checked, [13, 14]);
  assert.ok(!listed.includes(repo.side));
});

test("laterTrunkProofBuild uses a failed later build with usable proof", async (t) => {
  const repo = trunk();
  t.after(() => rmSync(repo.cwd, { recursive: true, force: true }));
  const [later1] = repo.later;
  const { listed, lookup } = lookupOf({
    [later1]: [run(later1, 21, "failure")],
  });
  const build = await laterTrunkProofBuild(
    repo.landing,
    "main",
    lookup,
    repo.call,
    async () => true,
  );
  assert.equal(build?.state, "failed");
  assert.equal(build?.selection, "later");
  assert.equal(build?.laterWithoutResult, 1);
  assert.deepEqual(listed, [later1]);
});

test("laterTrunkProofBuild stops at a running build and at the read trunk head", async (t) => {
  const repo = trunk();
  t.after(() => rmSync(repo.cwd, { recursive: true, force: true }));
  const [later1, later2] = repo.later;
  const running = lookupOf({
    [later1]: [run(later1, 31, "cancelled")],
    [later2]: [run(later2, 32, null, { status: "in_progress" })],
    [repo.later[2]]: [run(repo.later[2], 33, "success")],
  });
  assert.equal(
    await laterTrunkProofBuild(
      repo.landing,
      "main",
      running.lookup,
      repo.call,
      async () => true,
    ),
    undefined,
  );
  assert.deepEqual(running.listed, [later1, later2]);

  const atHead = lookupOf({});
  assert.equal(
    await laterTrunkProofBuild(
      repo.later[3],
      "main",
      atHead.lookup,
      repo.call,
      async () => true,
    ),
    undefined,
  );
  assert.deepEqual(atHead.listed, []);
});

test("Story Branch Landed keeps a rerun attempt's own build and a timed-out landing exact without walking forward", async (t) => {
  const repo = trunk();
  t.after(() => rmSync(repo.cwd, { recursive: true, force: true }));
  const [later1] = repo.later;
  const exact = storyBranchLandedExactLookup(
    false,
    "terryyin/open-dough",
    new AbortController().signal,
    "main",
  );
  const rerun = lookupOf({
    [repo.landing]: [run(repo.landing, 41, "success", { attempt: 2 })],
    [later1]: [run(later1, 42, "success")],
  });
  const own = await lookupResultBuild(
    repo.landing,
    repo.landing,
    rerun.lookup,
    repo.call,
    "ci.yml",
    "missing",
    exact,
  );
  assert.equal(own.kind, "build");
  assert.equal(own.runId, 41);
  assert.equal(own.selection, "exact");
  assert.equal(own.requestedStatus, undefined);
  assert.ok(!rerun.listed.includes(later1));

  const timedOut = lookupOf({
    [repo.landing]: [run(repo.landing, 51, "timed_out")],
    [later1]: [run(later1, 52, "success")],
  });
  const slot = await lookupResultBuild(
    repo.landing,
    repo.landing,
    timedOut.lookup,
    repo.call,
    "ci.yml",
    "missing",
    exact,
  );
  assert.deepEqual(slot, {
    kind: "none",
    explanation: "The CI build at the landing merge timed out.",
  });
  assert.ok(!timedOut.listed.includes(later1));
});
