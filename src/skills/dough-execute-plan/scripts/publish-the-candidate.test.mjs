import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import {
  assertPublicationAgreement,
  createCleanTrunkFixture,
  fetchAndAssertOriginMain,
  git,
  lsRemoteSha,
  revParse,
} from "./trunk-publication-local-main-test-fixtures.mjs";

const exec = promisify(execFile);

// Git mechanics (not guidance-following): Slice 2 of
// .planning/quick/065-prepare-stories-in-owned-worktrees/PLAN.md extracted
// publish-the-candidate.md's mechanics out of trunk-publication.md without
// changing any caller's required behavior. trunk-publication-local-main.test.mjs
// already covers an ordinary verified-increment publication onto a clean
// trunk, a stop on unrelated unpublished local commits, and rejected-push
// recovery after a concurrent remote advance. This file adds the two cases
// that file does not: (a) an ordinary queue-CLAIM publication, whose candidate
// lives directly on the local target with no execution worktree yet, per
// "Publish the candidate"'s own "A claim may have no execution worktree yet"
// note and the "Integrated locally" row of "Resume an interrupted
// publication"; and (b) the PROACTIVE rebase-onto-candidate path of "Publish
// the candidate" step 3 ("When trunk advanced, rebase only that suffix onto
// it"), triggered by fetch/reconcile discovering an already-advanced remote
// before any push is attempted -- distinct from the rejected-push recovery
// path, which discovers the advance only after a doomed push.

// Builds a disposable repository for a queue-claim publication: a bare
// origin already at trunkSha, and an integration checkout whose local main
// carries exactly one additional commit (the "Taken" claim) made directly on
// that checkout -- never a separate execution branch/worktree, matching
// "Publish a queue claim": [Take queued work] "commits the local Taken claim
// on the resolved integration branch" before any workspace exists.
async function createClaimFixture() {
  const fixture = realpathSync(
    mkdtempSync(join(tmpdir(), "publish-the-candidate-claim-")),
  );
  const origin = join(fixture, "remote.git");
  const integration = join(fixture, "integration");

  await exec("git", ["init", "--bare", "-b", "main", origin]);

  await exec("git", ["init", "-b", "main", integration]);
  await git(integration, "config", "user.name", "Integration Checkout");
  await git(integration, "config", "user.email", "integration@example.test");
  await git(integration, "remote", "add", "origin", origin);
  writeFileSync(join(integration, "trunk.txt"), "base\n");
  await git(integration, "add", "trunk.txt");
  await git(integration, "commit", "-m", "base trunk commit");
  await git(integration, "push", "origin", "main");
  const trunkSha = await revParse(integration, "main");

  writeFileSync(join(integration, "backlog-entry.txt"), "SEED-1: Taken\n");
  await git(integration, "add", "backlog-entry.txt");
  await git(integration, "commit", "-m", "Take queued work: SEED-1");
  const claimSha = await revParse(integration, "main");

  return {
    fixture,
    origin,
    integration,
    trunkSha,
    claimSha,
    cleanup: () => rmSync(fixture, { recursive: true, force: true }),
  };
}

test("publishing an ordinary queue claim (no execution worktree yet) fast-forwards local main onto the already-committed claim and pushes it unchanged", async (t) => {
  const { origin, integration, trunkSha, claimSha, cleanup } =
    await createClaimFixture();
  t.after(cleanup);

  assert.notEqual(
    claimSha,
    trunkSha,
    "the claim commit must already be ahead of trunk on local main",
  );

  // 1. Fetch the authorized remote for the target branch.
  await fetchAndAssertOriginMain(integration, trunkSha);

  // 2 & 3. Reconcile: fetched trunk is still the previously published base
  // (trunkSha), so the owned suffix (the claim commit) is left unchanged --
  // no rebase.
  assert.equal(
    await revParse(integration, "origin/main"),
    trunkSha,
    "fetched trunk must equal the previously published base for this case",
  );

  // 5. Fast-forward the local target to the exact candidate. For a claim
  // published before any execution worktree exists, local main already IS
  // the candidate, so this ff-only merge is a genuine no-op that must still
  // succeed cleanly (proving it is safe to run unconditionally, not only
  // when a separate rebase produced a new tip).
  await git(integration, "merge", "--ff-only", claimSha);
  assert.equal(await revParse(integration, "main"), claimSha);

  // 6. Push that exact candidate, then refresh the fetch.
  await git(integration, "push", "origin", "main");
  await git(integration, "fetch", "origin");

  assert.equal(await revParse(integration, "main"), claimSha);
  assert.equal(await revParse(integration, "origin/main"), claimSha);
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), claimSha);

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

  const status = (await git(integration, "status", "--porcelain")).stdout;
  assert.equal(
    status,
    "",
    "the integration checkout must be clean after publishing the claim",
  );
});

test("publishing when the remote already advanced past the previously published base rebases the owned suffix onto it proactively, before any push is attempted", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  // Advance the bare origin with a disjoint commit from a third checkout,
  // simulating a concurrent writer -- but do this BEFORE the integration
  // checkout ever attempts a fast-forward or push, so the advance is
  // discovered at fetch/reconcile time (step 2/3 of "Publish the candidate"),
  // never by a rejected push.
  const thirdCheckout = (await exec("mktemp", ["-d"])).stdout.trim();
  await exec("git", ["clone", origin, thirdCheckout]);
  await git(thirdCheckout, "config", "user.name", "Concurrent Writer");
  await git(thirdCheckout, "config", "user.email", "concurrent@example.test");
  writeFileSync(join(thirdCheckout, "disjoint.txt"), "concurrent work\n");
  await git(thirdCheckout, "add", "disjoint.txt");
  await git(thirdCheckout, "commit", "-m", "concurrent disjoint commit");
  await git(thirdCheckout, "push", "origin", "main");
  const disjointSha = await lsRemoteSha(origin, "refs/heads/main");
  t.after(() => rmSync(thirdCheckout, { recursive: true, force: true }));

  assert.notEqual(
    disjointSha,
    trunkSha,
    "the concurrent commit must actually advance origin/main",
  );

  // 1. Fetch the authorized remote for the target branch.
  await git(integration, "fetch", "origin");
  assert.equal(await revParse(integration, "origin/main"), disjointSha);

  // 2 & 3. Reconcile: fetched trunk (disjointSha) is no longer the
  // previously published base (trunkSha), so rebase only the owned suffix
  // (the execution branch's one commit) onto the fetched trunk -- proactively,
  // never having attempted a push against the stale base.
  assert.equal(
    await revParse(execution, "exec/story~1"),
    trunkSha,
    "the owned suffix's parent must still be the stale previously published base before rebase",
  );
  await git(execution, "rebase", "--onto", disjointSha, trunkSha, "exec/story");
  const rewrittenSha = await revParse(execution, "exec/story");

  assert.notEqual(
    rewrittenSha,
    candidateSha,
    "the rebase must replace the pre-rebase candidate SHA with a new one",
  );
  assert.equal(
    (
      await git(execution, "log", "--format=%P", "-1", rewrittenSha)
    ).stdout.trim(),
    disjointSha,
    "the rewritten candidate's parent must be the fetched trunk",
  );

  // 5. Fast-forward the local target directly to the exact (rewritten)
  // candidate. Local main is still at trunkSha (never previously touched),
  // and trunkSha is an ancestor of both disjointSha and rewrittenSha, so one
  // ff-only merge covers the whole advance plus the rebased suffix.
  assert.equal(await revParse(integration, "main"), trunkSha);
  await git(integration, "merge", "--ff-only", rewrittenSha);
  assert.equal(await revParse(integration, "main"), rewrittenSha);

  // 6. Push that exact candidate. This is the FIRST push attempt in this
  // scenario, and it must succeed on the first try -- proving the advance
  // was reconciled before publication, not recovered from a rejection.
  await git(integration, "push", "origin", "main");
  await git(integration, "fetch", "origin");

  await assertPublicationAgreement(
    { origin, integration, execution },
    rewrittenSha,
    "the integration checkout must be clean after the proactive rebase and first-attempt push",
  );
});
