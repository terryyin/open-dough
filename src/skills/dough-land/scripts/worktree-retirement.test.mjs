// Dough Land's installed `retire` command, run as a child process the way the
// agent runs it, against disposable repositories with a real remote.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  authorizedRemote,
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

// A fixture whose execution tip the remote trunk (`remote`'s `target`)
// contains unless `landed` is false; a remote other than origin is a new bare
// repository on `target`. Its management context is recorded while the
// worktree exists, so a rerun after removal still has it.
async function retirementFixture(
  t,
  { landed = true, remote = "origin", target = "main" } = {},
) {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const remoteUrl = await authorizedRemote(fixture, remote, target);
  if (landed) {
    await git(fixture.execution, "push", "-q", remote, `${branch}:${target}`);
  }
  const management = (
    await git(
      fixture.execution,
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    )
  ).stdout.trim();
  return { ...fixture, management, remoteUrl };
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

// A rerun after an interruption continues from what Git shows: nothing done
// yet, or only the worktree removed with the branch still there.
for (const { interrupted, worktree } of [
  { interrupted: "nothing", worktree: "removed" },
  { interrupted: "only the worktree removal", worktree: "already-absent" },
]) {
  test(`after ${interrupted}, a contained worktree created for this work is retired, and a rerun reports it already absent and pushes nothing`, async (t) => {
    const fixture = await retirementFixture(t);
    if (worktree === "already-absent") {
      await git(fixture.management, "worktree", "remove", fixture.execution);
    }
    const run = await retire(fixture, { createdForWork: true });
    assert.equal(run.code, 0, JSON.stringify(run.result));
    assert.equal(run.result.removed, true);
    assert.equal(run.result.worktree, worktree);
    assert.equal(run.result.branch, "removed");
    assert.equal(existsSync(fixture.execution), false);
    await assert.rejects(
      git(fixture.integration, "rev-parse", "--verify", `refs/heads/${branch}`),
    );
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
}

// The separately published remote execution branch goes on the named remote
// only; any other remote keeps its heads.
for (const [remote, target] of [
  ["origin", "main"],
  ["upstream", "trunk"],
]) {
  test(`the remote execution branch on ${remote} is deleted once ${remote}/${target} contains it, and a rerun reports it already absent`, async (t) => {
    const fixture = await retirementFixture(t, { remote, target });
    await git(fixture.execution, "push", "-q", remote, `${branch}:${branch}`);
    const originHeads = await remoteHeads(fixture.origin);
    const run = () =>
      retire(fixture, {
        remote,
        targetRef: `refs/heads/${target}`,
        createdForWork: true,
        remoteBranch: branch,
        contained: [fixture.candidateSha],
      });
    const removed = await run();
    await assertRetired(fixture, removed);
    assert.equal(removed.result.remoteBranch, "removed");
    const head = (name) => lsRemoteSha(fixture.remoteUrl, `refs/heads/${name}`);
    assert.equal(await head(branch), "");
    assert.equal(await head(target), fixture.candidateSha);

    const rerun = await run();
    assert.equal(rerun.code, 0, JSON.stringify(rerun.result));
    assert.equal(rerun.result.remoteBranch, "already-absent");
    assert.equal(await head(target), fixture.candidateSha);
    if (remote !== "origin") {
      assert.deepEqual(await remoteHeads(fixture.origin), originHeads);
    }
  });
}

// Each refusal keeps the worktree, its branch, and every remote head.
for (const { refused, landed, remoteBranch, reason } of [
  {
    refused: "the target branch itself",
    landed: true,
    remoteBranch: "main",
    reason: "remote branch is the target",
  },
  {
    refused: "a remote execution tip trunk does not contain",
    landed: false,
    remoteBranch: branch,
    reason: "remote execution tip is not integrated",
  },
]) {
  test(`${refused} is never deleted as the remote branch`, async (t) => {
    const fixture = await retirementFixture(t, { landed });
    await git(fixture.execution, "push", "-q", "origin", `${branch}:${branch}`);
    const heads = await remoteHeads(fixture.origin);
    const run = await retire(fixture, {
      createdForWork: true,
      remoteBranch,
      contained: [fixture.trunkSha],
    });
    assert.equal(run.code, 1);
    assert.equal(run.result.ok, false);
    assert.equal(run.result.reason, reason);
    assert.equal(run.result.remoteBranch, "preserved");
    await assertKept(fixture, fixture.candidateSha);
    const status = await git(fixture.execution, "status", "--porcelain");
    assert.equal(status.stdout, "");
    assert.deepEqual(await remoteHeads(fixture.origin), heads);
  });
}

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
