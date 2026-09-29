// Dough Land's installed `retire` command, run as a child process the way the
// agent runs it, against disposable repositories with a real remote.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  createCleanTrunkFixture,
  exec,
  git,
  lsRemoteSha,
  remoteHeads,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { runRetirementCommand } from "../../dough-story-refinement/scripts/dough-land-test-fixtures.mjs";

const command = fileURLToPath(
  new URL("./worktree-retirement.mjs", import.meta.url),
);
const branch = "exec/story";
const identity = "SEED-1#landed-story";

function retire(fixture, ownership = {}) {
  return runRetirementCommand({
    repository: fixture.management,
    worktree: fixture.execution,
    branch,
    ...ownership,
  });
}

// A fixture whose execution tip the remote trunk contains unless `landed` is
// false. Its management context is recorded while the worktree exists, so a
// rerun after removal still has it.
async function retirementFixture(t, { landed = true } = {}) {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  if (landed) {
    await git(fixture.execution, "push", "-q", "origin", `${branch}:main`);
  }
  const management = (
    await git(
      fixture.execution,
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    )
  ).stdout.trim();
  return { ...fixture, management };
}

function markCreatedFor(fixture, work) {
  return git(
    fixture.execution,
    "update-ref",
    `refs/worktree/dough/created-for/${work}`,
    "HEAD",
  );
}

async function assertKept(fixture, tip) {
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(await revParse(fixture.integration, branch), tip);
}

async function assertRetired(fixture, run) {
  assert.equal(run.code, 0, JSON.stringify(run.result));
  assert.equal(run.result.ok, true);
  assert.equal(run.result.worktree, "removed");
  assert.equal(run.result.branch, "removed");
  assert.equal(existsSync(fixture.execution), false);
  await assert.rejects(
    git(fixture.integration, "rev-parse", "--verify", `refs/heads/${branch}`),
  );
}

test("a contained worktree created for this work is retired, and a rerun reports it already absent and pushes nothing", async (t) => {
  const fixture = await retirementFixture(t);
  await assertRetired(fixture, await retire(fixture, { createdForWork: true }));
  const heads = await remoteHeads(fixture.origin);

  const rerun = await retire(fixture);
  assert.equal(rerun.code, 0, JSON.stringify(rerun.result));
  assert.equal(rerun.result.worktree, "already-absent");
  assert.equal(rerun.result.branch, "already-absent");
  assert.deepEqual(await remoteHeads(fixture.origin), heads);
  assert.equal(
    await lsRemoteSha(fixture.origin, "refs/heads/main"),
    fixture.candidateSha,
  );
});

test("an uncontained branch tip is refused and nothing is removed", async (t) => {
  const fixture = await retirementFixture(t, { landed: false });
  const run = await retire(fixture, { createdForWork: true });
  assert.equal(run.code, 1);
  assert.equal(run.result.ok, false);
  assert.equal(run.result.reason, "unique unpublished work");
  await assertKept(fixture, fixture.candidateSha);
  assert.equal(
    await lsRemoteSha(fixture.origin, "refs/heads/main"),
    fixture.trunkSha,
  );
});

test("a dirty worktree is preserved with its reason and its edit intact", async (t) => {
  const fixture = await retirementFixture(t);
  writeFileSync(join(fixture.execution, "draft.txt"), "unsaved\n");
  const run = await retire(fixture, { createdForWork: true });
  assert.equal(run.code, 1);
  assert.equal(run.result.reason, "dirty checkout");
  await assertKept(fixture, fixture.candidateSha);
  assert.equal(
    readFileSync(join(fixture.execution, "draft.txt"), "utf8"),
    "unsaved\n",
  );
});

test("a creation ref naming this work retires the worktree without the caller's flag", async (t) => {
  const fixture = await retirementFixture(t);
  await markCreatedFor(fixture, identity);
  await assertRetired(fixture, await retire(fixture, { identity }));
});

test("a creation ref naming other work retains the worktree even with the caller's flag", async (t) => {
  const fixture = await retirementFixture(t);
  await markCreatedFor(fixture, "SEED-2#other-story");
  const run = await retire(fixture, { identity, createdForWork: true });
  assert.equal(run.code, 1);
  assert.equal(run.result.reason, "created for other work: SEED-2#other-story");
  assert.deepEqual(run.result.createdFor, ["SEED-2#other-story"]);
  await assertKept(fixture, fixture.candidateSha);
});

test("without a creation ref or the caller's flag the worktree is retained as not created for this work", async (t) => {
  const fixture = await retirementFixture(t);
  const run = await retire(fixture, { identity });
  assert.equal(run.code, 1);
  assert.match(run.result.reason, /reused, host-owned, or unrecorded/);
  await assertKept(fixture, fixture.candidateSha);
});

test("a missing required argument is a usage error", async (t) => {
  const fixture = await retirementFixture(t);
  await assert.rejects(
    exec("node", [command, "retire", "--worktree", fixture.execution]),
    (error) => error.code === 2 && /usage:/.test(error.stderr),
  );
  await assertKept(fixture, fixture.candidateSha);
});
