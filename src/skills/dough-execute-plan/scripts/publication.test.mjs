// Git mechanics (not guidance-following): owned-workspace publication pushes
// an exact candidate SHA. A pending human edit or unrelated commit on the
// default checkout does not block that push and is not modified. Remote
// acceptance and the checkout's maintenance result are separate. Racing
// retry beyond one existing recovery attempt is not this file.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  assertPublicationAgreement,
  assertRemoteCandidate,
  captureCheckout,
  createCleanTrunkFixture,
  fetchAndAssertOriginMain,
  git,
  lsRemoteSha,
  maintenanceFromInspection,
  plantHumanEdit,
  pushCandidate,
  revParse,
} from "./publication-test-fixtures.mjs";

const exec = promisify(execFile);

async function createClaimFixture() {
  const fixture = realpathSync(
    mkdtempSync(join(tmpdir(), "publication-claim-")),
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
    origin,
    integration,
    trunkSha,
    claimSha,
    cleanup: () => rmSync(fixture, { recursive: true, force: true }),
  };
}

test("publishing a queue claim from the checkout that holds it accepts that SHA remotely without including a later human edit", async (t) => {
  const { origin, integration, trunkSha, claimSha, cleanup } =
    await createClaimFixture();
  t.after(cleanup);

  assert.notEqual(claimSha, trunkSha);
  await fetchAndAssertOriginMain(integration, trunkSha);
  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);

  await pushCandidate(integration, claimSha);
  await git(integration, "fetch", "origin");

  await assertRemoteCandidate(origin, claimSha);
  assert.equal(await revParse(integration, "HEAD"), claimSha);
  const after = await captureCheckout(integration);
  assertCheckoutUnchanged(before, after);
  assert.equal(
    maintenanceFromInspection(
      { head: claimSha, status: after.status },
      claimSha,
    ),
    "deferred",
    "a pending human edit keeps maintenance deferred even though HEAD is the accepted SHA",
  );
  assert.match(after.status, /human-staged\.txt/);
  assert.match(after.status, /human-unstaged\.txt/);
  assert.equal(
    (await git(integration, "show", `${claimSha}:backlog-entry.txt`)).stdout,
    "SEED-1: Taken\n",
  );
});

test("rebasing an owned suffix onto an advanced remote publishes that SHA and leaves a clean default checkout unmoved", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  const disjointSha = await advanceOriginFromAnotherWriter(origin);
  assert.notEqual(disjointSha, trunkSha);

  await git(execution, "fetch", "origin");
  await git(execution, "rebase", "--onto", disjointSha, trunkSha, "exec/story");
  const rewrittenSha = await revParse(execution, "exec/story");
  assert.notEqual(rewrittenSha, candidateSha);
  assert.equal(
    (
      await git(execution, "log", "--format=%P", "-1", rewrittenSha)
    ).stdout.trim(),
    disjointSha,
  );

  const before = await captureCheckout(integration);
  await pushCandidate(execution, rewrittenSha);
  await git(execution, "fetch", "origin");

  await assertRemoteCandidate(origin, rewrittenSha);
  const after = await captureCheckout(integration);
  assertCheckoutUnchanged(before, after);
  assert.equal(after.head, trunkSha);
  assert.equal(maintenanceFromInspection(after, rewrittenSha), "deferred");
  assert.equal(
    (await git(origin, "show", `${rewrittenSha}:increment.txt`)).stdout,
    "increment\n",
  );
});

test("a pending human edit and an unrelated local commit do not block or change publication from a separate workspace", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  writeFileSync(join(integration, "unrelated.txt"), "unrelated local work\n");
  await git(integration, "add", "unrelated.txt");
  await git(integration, "commit", "-m", "unrelated local main commit");
  const unrelatedSha = await revParse(integration, "main");
  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);

  await git(execution, "fetch", "origin");
  assert.equal(await revParse(execution, "origin/main"), trunkSha);
  await pushCandidate(execution, candidateSha);
  await git(execution, "fetch", "origin");

  await assertRemoteCandidate(origin, candidateSha);
  assert.equal(
    (await git(origin, "log", "--format=%P", "-1", candidateSha)).stdout.trim(),
    trunkSha,
  );
  const after = await captureCheckout(integration);
  assertCheckoutUnchanged(before, after);
  assert.equal(after.head, unrelatedSha);
  assert.equal(maintenanceFromInspection(after, candidateSha), "deferred");
  assert.doesNotMatch(
    (await git(origin, "ls-tree", "-r", "--name-only", candidateSha)).stdout,
    /unrelated\.txt|human-/,
  );
});

test("one rejected push is recovered by rebasing the owned branch only, leaving the default checkout's human edit in place", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);

  const disjointSha = await advanceOriginFromAnotherWriter(origin);

  await assert.rejects(
    () => pushCandidate(execution, candidateSha),
    /! \[rejected\]/,
    "the stale candidate push must be rejected",
  );
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), disjointSha);

  await git(execution, "fetch", "origin");
  await git(execution, "rebase", "--onto", disjointSha, trunkSha, "exec/story");
  const rewrittenSha = await revParse(execution, "exec/story");
  assert.notEqual(rewrittenSha, candidateSha);
  await pushCandidate(execution, rewrittenSha);
  await git(execution, "fetch", "origin");

  await assertRemoteCandidate(origin, rewrittenSha);
  assert.equal(await revParse(execution, "exec/story"), rewrittenSha);
  const after = await captureCheckout(integration);
  assertCheckoutUnchanged(before, after);
  assert.equal(after.head, trunkSha);
  assert.equal(maintenanceFromInspection(after, rewrittenSha), "deferred");
  assert.equal(
    (await git(origin, "show", `${rewrittenSha}:increment.txt`)).stdout,
    "increment\n",
  );
});

test("a clean claim with no separate workspace still converges the checkout that is the owned workspace", async (t) => {
  const { origin, integration, claimSha, cleanup } = await createClaimFixture();
  t.after(cleanup);

  await pushCandidate(integration, claimSha);
  await git(integration, "fetch", "origin");
  await assertPublicationAgreement(
    { origin, integration },
    claimSha,
    "the claim checkout stays clean when it had no human edit",
  );
  assert.equal(
    maintenanceFromInspection(await captureCheckout(integration), claimSha),
    "already current",
  );
});
