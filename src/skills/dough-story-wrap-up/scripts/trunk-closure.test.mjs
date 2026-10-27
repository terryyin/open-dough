// Trunk Mode wrap-up closure through the installed `finish` command, run as a
// child process after the before-cleanup commit was accepted: the final
// closure is published and registered on the coordinator's observer, one
// completion receipt covers it, and only a `success` receipt with confirmed
// shutdown retires the worktree and branch. Every stop preserves both closure
// commits. The receipts that stop at completion are in
// `trunk-closure-completion-gate.test.mjs`.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import {
  advanceOriginFromAnotherWriter,
  lsRemoteSha,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  branchSha,
  commitFinalClosure,
  createTrunkClosureFixture,
  deliverBeforeCleanupThroughCli,
  finishThroughCli,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";
import { git } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs";
import { deliverThroughCli } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-cli-test-fixtures.mjs";
import "./trunk-closure-integrated-state-cases.mjs";

const main = "refs/heads/main";

test("finish publishes the final closure, completes it once on its coordinator's observer, refreshes the default checkout, and then retires", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const before = await deliverBeforeCleanupThroughCli(fixture);
  const beforeCleanup = before.receipt.sha;
  const final = await commitFinalClosure(fixture);
  releaseCi(fixture, { [beforeCleanup]: "success", [final]: "success" });

  const { result, code, stderr } = await finishThroughCli(fixture, {
    beforeCleanup,
    final,
    extra: ["--created-for-work", "--default-checkout", fixture.integration],
  });

  assert.equal(code, 0, stderr);
  assert.equal(result.ok, true);
  assert.equal(result.publication, "accepted");
  assert.equal(result.acceptedSha, final);
  assert.equal(await lsRemoteSha(fixture.origin, main), final);
  assert.equal(result.observation.state, "reused");
  assert.equal(result.observation.directory, before.observation.directory);
  assert.equal(result.completion.verdict, "success");
  assert.equal(result.completion.requestedSha, final);
  assert.equal(result.completion.shutdown.status, "confirmed");
  assert.equal(await revParse(fixture.integration, "main"), final);
  assert.deepEqual(
    [result.cleanup.worktree, result.cleanup.branch],
    ["removed", "removed"],
  );
  assert.equal(existsSync(fixture.execution), false);
  assert.equal(await branchSha(fixture), "");
});

test("a stopped default-checkout refresh keeps the accepted closure, still retires after the receipt, and leaves the remote execution branch", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const remoteBranch = "refs/heads/exec/story";
  await git(fixture.execution, "push", "-q", "origin", `HEAD:${remoteBranch}`);
  const remoteExecutionTip = await lsRemoteSha(fixture.origin, remoteBranch);
  const before = await deliverBeforeCleanupThroughCli(fixture);
  const final = await commitFinalClosure(fixture);
  releaseCi(fixture, { [before.receipt.sha]: "success", [final]: "success" });
  await git(fixture.integration, "switch", "-q", "-c", "side");
  const sideHead = await revParse(fixture.integration, "HEAD");

  const { result, code, stderr } = await finishThroughCli(fixture, {
    beforeCleanup: before.receipt.sha,
    final,
    extra: ["--created-for-work", "--default-checkout", fixture.integration],
  });

  assert.equal(code, 0, stderr);
  assert.equal(result.refresh.result, "stopped");
  assert.equal(result.refresh.reason, "unexpected-branch");
  assert.equal(await revParse(fixture.integration, "HEAD"), sideHead);
  assert.equal(await lsRemoteSha(fixture.origin, main), final);
  assert.equal(result.completion.shutdown.status, "confirmed");
  assert.equal(result.cleanup.worktree, "removed");
  assert.equal(existsSync(fixture.execution), false);
  assert.equal(await branchSha(fixture), "");
  assert.equal(
    await lsRemoteSha(fixture.origin, remoteBranch),
    remoteExecutionTip,
  );
});

// Commits a closure and pins its author time, so two closures share an
// identity as when they land within one second.
async function commitClosureAt(fixture, file) {
  await commitFinalClosure(fixture, file);
  await git(
    fixture.execution,
    "commit",
    "-q",
    "--amend",
    "--no-edit",
    "--date=@1700000000",
  );
  return revParse(fixture.execution, "exec/story");
}

test("finish publishes a final closure whose identity an earlier published closure shares, instead of taking that one as already published", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const before = await deliverBeforeCleanupThroughCli(fixture);
  const repair = await commitClosureAt(fixture, "repair.txt");
  const { delivered } = await deliverThroughCli(fixture, {
    base: before.receipt.sha,
  });
  assert.equal(delivered.receipt.sha, repair);
  const final = await commitClosureAt(fixture, "closure.txt");
  releaseCi(fixture, {
    [before.receipt.sha]: "success",
    [repair]: "success",
    [final]: "success",
  });

  const { result, code, stderr } = await finishThroughCli(fixture, {
    beforeCleanup: repair,
    final,
    extra: ["--created-for-work"],
  });

  assert.equal(code, 0, JSON.stringify({ result, stderr }));
  assert.equal(result.acceptedSha, final);
  assert.equal(result.pushCount, 1);
  assert.equal(await lsRemoteSha(fixture.origin, main), final);
});

test("finish establishes its coordinator's observer on a non-default remote and target when it holds none, without a default checkout", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const release = "refs/heads/release";
  await git(fixture.integration, "remote", "add", "upstream", fixture.origin);
  await git(fixture.integration, "push", "-q", "upstream", `main:${release}`);
  const beforeCleanup = fixture.candidateSha;
  await git(fixture.execution, "push", "-q", "upstream", `HEAD:${release}`);
  await git(
    fixture.execution,
    "update-ref",
    "refs/worktree/dough/created-for/SEED-1#closure",
    "HEAD",
  );
  const final = await commitFinalClosure(fixture);
  releaseCi(fixture, { [beforeCleanup]: "success", [final]: "success" });

  const { result, code, stderr } = await finishThroughCli(fixture, {
    beforeCleanup,
    final,
    targetRef: release,
    extra: ["--remote", "upstream", "--identity", "SEED-1#closure"],
  });

  assert.equal(code, 0, stderr);
  assert.equal(result.observation.state, "attached");
  assert.equal(result.target, release);
  assert.equal(await lsRemoteSha(fixture.origin, release), final);
  assert.equal(await lsRemoteSha(fixture.origin, main), fixture.trunkSha);
  assert.equal(result.completion.shutdown.status, "confirmed");
  assert.equal(result.refresh.result, "not applicable");
  assert.equal(result.cleanup.worktree, "removed");
  assert.equal(existsSync(fixture.execution), false);
  assert.equal(await branchSha(fixture), "");
});

test("a conflicting trunk advance stops finish with the worktree, branch, and both closure commits preserved and names the recovery step", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const before = await deliverBeforeCleanupThroughCli(fixture);
  const beforeCleanup = before.receipt.sha;
  const final = await commitFinalClosure(fixture, "trunk.txt");
  const theirs = await advanceOriginFromAnotherWriter(fixture.origin, {
    file: "trunk.txt",
    body: "their conflicting trunk\n",
  });

  const { result, code } = await finishThroughCli(fixture, {
    beforeCleanup,
    final,
    extra: ["--created-for-work"],
  });

  assert.equal(code, 1);
  assert.equal(result.ok, false);
  assert.equal(result.step, "conflict");
  assert.match(result.recovery, /Resolve a publication rebase conflict/);
  assert.equal(result.cleanup, "not-performed");
  assert.equal(await lsRemoteSha(fixture.origin, main), theirs);
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(await branchSha(fixture), final);
  assert.equal(
    await revParse(fixture.integration, `${final}~1`),
    beforeCleanup,
  );
});

test("a before-cleanup commit the target lacks stops finish before anything is published or observed", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const beforeCleanup = fixture.candidateSha;
  const final = await commitFinalClosure(fixture);

  const { result, code } = await finishThroughCli(fixture, {
    beforeCleanup,
    final,
    base: fixture.trunkSha,
    extra: ["--created-for-work"],
  });

  assert.equal(code, 1);
  assert.equal(result.step, "before-cleanup");
  assert.equal(result.publication, "not-attempted");
  assert.match(result.recovery, /deliver/);
  assert.equal(await lsRemoteSha(fixture.origin, main), fixture.trunkSha);
  assert.equal(existsSync(fixture.storage), false);
  assert.equal(await branchSha(fixture), final);
});

test("finish refuses incomplete arguments as a usage error", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const { result, code, stderr } = await finishThroughCli(fixture, {
    beforeCleanup: "",
    final: fixture.candidateSha,
  });
  assert.equal(code, 2);
  assert.equal(result, null);
  assert.match(stderr, /usage: trunk-closure\.mjs finish/);
});
