import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";

const exec = promisify(execFile);

async function git(cwd, ...args) {
  return exec("git", args, { cwd });
}

async function revParse(cwd, ref) {
  return (await git(cwd, "rev-parse", ref)).stdout.trim();
}

// Resolves a ref on a bare remote directly (not the checkout's cached
// remote-tracking ref), so proof about "the bare origin itself" is genuine.
async function lsRemoteSha(remote, ref) {
  const { stdout } = await exec("git", ["ls-remote", remote, ref]);
  return stdout.trim().split(/\s+/)[0];
}

// Shared precondition step (trunk-publication.md's "Publish the candidate"
// step 1): fetch the authorized remote and confirm the checkout observed the
// pre-publication trunk before any reconciliation is attempted.
async function fetchAndAssertOriginMain(integration, expectedSha) {
  await git(integration, "fetch", "origin");
  assert.equal(
    await revParse(integration, "origin/main"),
    expectedSha,
    "fetch must observe the pre-publication trunk before reconciling",
  );
}

// Builds the fixture named in Slice 1 of
// .planning/quick/033-synchronize-local-main-after-trunk-publication/PLAN.md:
// a disposable repository whose primary checkout (the shared "integration
// checkout") is clean `main` at the same SHA as `origin/main` (a local bare
// repo), plus an execution worktree whose unpublished suffix is already
// based on that trunk. Exported so later slices in this same test file can
// build on the same clean-trunk starting point before diverging it.
export async function createCleanTrunkFixture() {
  const fixture = realpathSync(
    mkdtempSync(join(tmpdir(), "trunk-publication-local-main-")),
  );
  const origin = join(fixture, "remote.git");
  const integration = join(fixture, "integration");
  const execution = join(fixture, "execution");

  await exec("git", ["init", "--bare", "-b", "main", origin]);

  await exec("git", ["init", "-b", "main", integration]);
  await git(integration, "config", "user.name", "Integration Checkout");
  await git(integration, "config", "user.email", "integration@example.test");
  await git(integration, "remote", "add", "origin", origin);
  writeFileSync(join(integration, "trunk.txt"), "base\n");
  await git(integration, "add", "trunk.txt");
  await git(integration, "commit", "-m", "base trunk commit");
  await git(integration, "push", "origin", "main");

  await git(integration, "branch", "exec/story");
  await git(integration, "worktree", "add", execution, "exec/story");
  await git(execution, "config", "user.name", "Execution Worktree");
  await git(execution, "config", "user.email", "execution@example.test");

  writeFileSync(join(execution, "increment.txt"), "increment\n");
  await git(execution, "add", "increment.txt");
  await git(execution, "commit", "-m", "verified increment");

  const trunkSha = await revParse(integration, "main");
  const candidateSha = await revParse(execution, "exec/story");

  return {
    fixture,
    origin,
    integration,
    execution,
    trunkSha,
    candidateSha,
    cleanup: () => rmSync(fixture, { recursive: true, force: true }),
  };
}

test("publishing a verified increment onto a clean local main leaves local main, origin/main, and the execution branch at the candidate SHA", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  assert.notEqual(
    candidateSha,
    trunkSha,
    "the increment must start unpublished, ahead of trunk",
  );

  // 1. Fetch the authorized remote for the target branch.
  await fetchAndAssertOriginMain(integration, trunkSha);

  // 2 & 3. Reconcile from the fetched target and confirm the owned
  // unpublished suffix is already based on current trunk, so the rule
  // leaves its commits unchanged (no rebase performed).
  const executionParent = await revParse(execution, "exec/story~1");
  assert.equal(
    executionParent,
    trunkSha,
    "the increment's parent must already be current trunk",
  );

  // 5. Fast-forward the local target to the exact candidate by running
  // `git -C <integration-checkout> merge --ff-only <candidate>` on the
  // integration checkout, per the tightened rule text -- not a SHA push
  // from the execution worktree and not `update-ref`/`branch -f`.
  await git(integration, "merge", "--ff-only", candidateSha);
  assert.equal(await revParse(integration, "main"), candidateSha);

  // 6. Push that exact candidate from the integration checkout, then
  // refresh the integration checkout's remote view.
  await git(integration, "push", "origin", "main");
  await git(integration, "fetch", "origin");

  // Observable proof: local main (integration checkout), fetched
  // origin/main, the retained candidate SHA, and the execution branch all
  // agree on the same candidate SHA.
  assert.equal(await revParse(integration, "main"), candidateSha);
  assert.equal(await revParse(integration, "origin/main"), candidateSha);
  assert.equal(await revParse(execution, "exec/story"), candidateSha);

  // The bare origin itself (not just the integration checkout's cached
  // remote-tracking ref) carries the candidate.
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), candidateSha);

  // main...origin/main is 0/0: neither side is ahead of the other.
  const counts = (
    await git(
      integration,
      "rev-list",
      "--left-right",
      "--count",
      "main...origin/main",
    )
  ).stdout.trim();
  assert.equal(counts, "0\t0");

  // The integration checkout's working tree is not left with a staged or
  // reverted inverse diff after the fast-forward merge.
  const status = (await git(integration, "status", "--porcelain")).stdout;
  assert.equal(
    status,
    "",
    "the integration checkout must be clean after merge --ff-only",
  );
});

// Builds the Slice 2 fixture on top of Slice 1's clean-trunk starting point:
// the same layout, but local `main` on the integration checkout also carries
// a commit made directly on that checkout (not via the execution worktree),
// so it is ahead of both `origin/main` and the execution suffix's parent by a
// commit that is not the owned unpublished suffix.
test("stopping when local main has unrelated unpublished commits preserves both the unrelated commit and the execution increment without advancing origin/main", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  // Diverge local main directly on the integration checkout: an unrelated
  // commit made outside the execution worktree, not part of the owned
  // unpublished suffix (exec/story's candidate).
  writeFileSync(join(integration, "unrelated.txt"), "unrelated local work\n");
  await git(integration, "add", "unrelated.txt");
  await git(integration, "commit", "-m", "unrelated local main commit");
  const unrelatedSha = await revParse(integration, "main");

  assert.notEqual(
    unrelatedSha,
    trunkSha,
    "the unrelated commit must actually diverge local main from trunk",
  );
  assert.notEqual(
    unrelatedSha,
    candidateSha,
    "the unrelated commit must not coincide with the execution's candidate",
  );

  // 1. Fetch the authorized remote for the target branch.
  await fetchAndAssertOriginMain(integration, trunkSha);

  // 2. Reconcile from the fetched target, per trunk-publication.md's
  // "Publish the candidate" step 2 and the Preconditions section: the local
  // target (main) has an unpublished commit that is neither the fetched
  // remote tip nor this execution's owned suffix (exec/story's candidate).
  // That is a stop, not permission to fast-forward or push the candidate
  // SHA.
  //
  // Demonstrate the real Git mechanism the rule leans on, not a JS-level
  // decision not to act: local main (at unrelatedSha) is NOT an ancestor of
  // candidateSha (which descends from trunkSha, unrelatedSha's parent), so
  // even a naive attempt at step 5's `git -C <integration> merge --ff-only
  // <candidate>` cannot silently succeed -- Git itself refuses the
  // fast-forward. That is what makes stopping at the step-2 ownership check
  // (rather than falling back to a forced ref move, `update-ref`,
  // `branch -f`, or a same-command SHA push -- all already forbidden by
  // Slice 1) load-bearing: there is no quiet way to advance past the
  // unrelated commit.
  await assert.rejects(
    () => git(integration, "merge", "--ff-only", candidateSha),
    /Not possible to fast-forward|not possible to fast-forward/,
    "a naive fast-forward merge onto the candidate must be genuinely refused by Git while local main carries an unrelated, non-ancestor commit",
  );

  // Preserved-state proof, per Slice 2's fixture description:

  // The bare origin itself is still the pre-publication trunk SHA, not the
  // execution's candidate.
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), trunkSha);

  // The execution increment remains recoverable on exec/story: it still
  // resolves to the same candidate SHA it had before the attempt.
  assert.equal(await revParse(execution, "exec/story"), candidateSha);

  // The unrelated local-main commit remains on the integration checkout's
  // main -- not reverted, reset, or overwritten.
  assert.equal(await revParse(integration, "main"), unrelatedSha);
});
