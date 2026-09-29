// A Trunk Mode `finish` interrupted after it rebased and published the final
// closure is rerun as the agent reruns it: the installed command with the
// original `--final`, in a child process. The rerun recognizes the rebased
// closure the target holds, pushes nothing, completes on it, and retires; a
// later rerun from the management context reports cleanup already done.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { deliverThroughCli } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { git } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  lsRemoteSha,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  branchSha,
  commitFinalClosure,
  createTrunkClosureFixture,
  finishThroughCli,
  installInIntegration,
  recordPushes,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";

const main = "refs/heads/main";

test("a rerun with the original final closure after it was rebased and published pushes nothing, completes the rebased closure, retires, and later reports cleanup already done", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  installInIntegration(fixture);
  const { delivered: before } = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
  });
  const beforeCleanup = before.receipt.sha;
  const final = await commitFinalClosure(fixture);
  const theirs = await advanceOriginFromAnotherWriter(fixture.origin);
  // The interrupted `finish` rebased the final closure and published it.
  const { delivered: reconciled } = await deliverThroughCli(fixture, {
    base: beforeCleanup,
  });
  assert.equal(reconciled.status, "needs-validation");
  const { delivered } = await deliverThroughCli(fixture, {
    base: theirs,
    extra: ["--validated-candidate", reconciled.candidate],
  });
  const rebased = delivered.receipt.sha;
  assert.notEqual(rebased, final);
  assert.equal(
    (await git(fixture.origin, "rev-parse", `${rebased}~1`)).stdout.trim(),
    theirs,
  );
  assert.equal(await lsRemoteSha(fixture.origin, main), rebased);
  assert.equal(delivered.observation.directory, before.observation.directory);
  releaseCi(fixture, { [beforeCleanup]: "success", [rebased]: "success" });
  const recorder = recordPushes(fixture);
  const rerun = (extra = [], checkout = fixture.execution) =>
    finishThroughCli(fixture, {
      beforeCleanup,
      final,
      env: recorder.env,
      checkout,
      extra: ["--created-for-work", ...extra],
    });

  const { result, code, stderr } = await rerun();

  assert.equal(code, 0, stderr);
  assert.deepEqual(recorder.pushes(), []);
  assert.equal(result.pushCount, 0);
  assert.equal(result.acceptedSha, rebased);
  assert.equal(result.observation.directory, before.observation.directory);
  assert.equal(result.completion.requestedSha, rebased);
  assert.equal(result.completion.verdict, "success");
  assert.equal(result.completion.shutdown.status, "confirmed");
  assert.deepEqual(
    [result.cleanup.worktree, result.cleanup.branch],
    ["removed", "removed"],
  );
  assert.equal(existsSync(fixture.execution), false);
  assert.equal(await branchSha(fixture), "");

  const again = await rerun(
    ["--repository", join(fixture.integration, ".git")],
    fixture.integration,
  );

  assert.equal(again.code, 0, again.stderr);
  assert.equal(again.result.acceptedSha, rebased);
  assert.deepEqual(
    [again.result.cleanup.worktree, again.result.cleanup.branch],
    ["already-absent", "already-absent"],
  );
  assert.deepEqual(recorder.pushes(), []);
  assert.equal(await lsRemoteSha(fixture.origin, main), rebased);
});
