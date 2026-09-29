// Trunk Mode wrap-up closure through the installed `finish` command, run as a
// child process after the before-cleanup commit was accepted: the final
// closure is published and registered on the matching observer, one
// completion receipt covers it, and only a receipt with confirmed shutdown
// retires the worktree and branch. Every stop preserves both closure commits.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { deliverThroughCli } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  lsRemoteSha,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  branchSha,
  commitFinalClosure,
  createTrunkClosureFixture,
  finishThroughCli,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";
import { git } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs";

const main = "refs/heads/main";

// The before-cleanup commit accepted through the installed `deliver`, leaving
// its observer live for `finish` to recover.
async function deliverBeforeCleanup(fixture) {
  const { delivered } = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
  });
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.observation.state, "attached");
  return delivered;
}

test("finish publishes the final closure, completes it once on the recovered observer, refreshes the default checkout, and then retires", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const before = await deliverBeforeCleanup(fixture);
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

test("finish arms an observer on a non-default remote and target when none is live, without a default checkout", async (t) => {
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
  const before = await deliverBeforeCleanup(fixture);
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

test("a failed CI receipt retains the observer and preserves the worktree and branch", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const before = await deliverBeforeCleanup(fixture);
  const final = await commitFinalClosure(fixture);
  releaseCi(fixture, { [before.receipt.sha]: "success", [final]: "failure" });

  const { result, code } = await finishThroughCli(fixture, {
    beforeCleanup: before.receipt.sha,
    final,
    extra: ["--created-for-work"],
  });

  assert.equal(code, 1);
  assert.equal(result.step, "completion");
  assert.equal(result.acceptedSha, final);
  assert.equal(result.completion.verdict, "failure");
  assert.equal(result.completion.shutdown.status, "retained");
  assert.equal(result.cleanup, "not-performed");
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(await branchSha(fixture), final);
});

test("without any observer the accepted closure is reported as lost coverage and nothing is retired", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const env = { ...fixture.env };
  delete env.CLAUDE_CODE_SESSION_ID;
  const beforeCleanup = fixture.candidateSha;
  await git(fixture.execution, "push", "-q", "origin", "HEAD:main");
  const final = await commitFinalClosure(fixture);

  const { result, code } = await finishThroughCli(fixture, {
    beforeCleanup,
    final,
    env,
    extra: ["--created-for-work"],
  });

  assert.equal(code, 1);
  assert.equal(result.step, "observation");
  assert.equal(result.observation.state, "unobserved");
  assert.equal(result.completion, null);
  assert.equal(await lsRemoteSha(fixture.origin, main), final);
  assert.equal(existsSync(fixture.execution), true);
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
