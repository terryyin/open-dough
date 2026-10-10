// A Trunk Mode `finish` interrupted after it rebased and published the final
// closure is rerun as the agent reruns it: the installed command with the
// original `--final`, in a child process. The rerun recognizes the rebased
// closure the target holds, pushes nothing, completes on it, and retires; a
// later rerun from the management context, skipping a registered revision
// this repository lacks, reports cleanup already done. The rebased closure is
// recognized only from the owner's observer: a sibling coordinator's live
// observer stays untouched, and a rerun by another coordinator finds none.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { registerPushedRevision } from "../../dough-execute-plan/scripts/ci-mailbox-revision-coverage.mjs";
import { git } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  lsRemoteSha,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { closureBesideSibling } from "./trunk-closure-owner-test-fixtures.mjs";
import {
  branchSha,
  commitFinalClosure,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";

const main = "refs/heads/main";

test("a rerun with the original final closure after it was rebased and published pushes nothing, completes the rebased closure, retires, and later reports cleanup already done", async (t) => {
  const journey = await closureBesideSibling(t, "claude");
  const { fixture, publisher } = journey;
  const { delivered: before } = await journey.deliver(fixture.trunkSha);
  assert.equal(before.observation.directory, publisher);
  const beforeCleanup = before.receipt.sha;
  const final = await commitFinalClosure(fixture);
  const theirs = await advanceOriginFromAnotherWriter(fixture.origin);
  // The interrupted `finish` rebased the final closure and published it.
  const { delivered: reconciled } = await journey.deliver(beforeCleanup);
  assert.equal(reconciled.status, "needs-validation");
  const { delivered } = await journey.deliver(theirs, [
    "--validated-candidate",
    reconciled.candidate,
  ]);
  const rebased = delivered.receipt.sha;
  assert.notEqual(rebased, final);
  assert.equal(
    (await git(fixture.origin, "rev-parse", `${rebased}~1`)).stdout.trim(),
    theirs,
  );
  assert.equal(await lsRemoteSha(fixture.origin, main), rebased);
  assert.equal(delivered.observation.directory, publisher);
  releaseCi(fixture, { [beforeCleanup]: "success", [rebased]: "success" });
  const pushes = await journey.pushes();
  const rerun = (extra = [], checkout = fixture.execution, coordinator) =>
    journey.finish(
      {
        beforeCleanup,
        final,
        checkout,
        extra: ["--created-for-work", ...extra],
      },
      coordinator,
    );

  const { result, code, stderr } = await rerun();

  assert.equal(code, 0, stderr);
  assert.equal(pushes(), 0);
  assert.equal(result.pushCount, 0);
  assert.equal(result.acceptedSha, rebased);
  assert.equal(result.observation.directory, publisher);
  assert.equal(result.completion.requestedSha, rebased);
  assert.equal(result.completion.verdict, "success");
  assert.equal(result.completion.shutdown.status, "confirmed");
  assert.deepEqual(
    [result.cleanup.worktree, result.cleanup.branch],
    ["removed", "removed"],
  );
  assert.equal(existsSync(fixture.execution), false);
  assert.equal(await branchSha(fixture), "");
  journey.assertSiblingUntouched();

  // With the branch gone, only the owner's observer names the rebased
  // closure: another coordinator's rerun recognizes none.
  const management = ["--repository", join(fixture.integration, ".git")];
  const stranger = await rerun(
    management,
    fixture.integration,
    "third-coordinator",
  );
  assert.equal(stranger.code, 1);
  assert.equal(stranger.result.step, "context");
  assert.equal(stranger.result.publication, "not-attempted");

  // The observer also holds a revision this repository never received.
  registerPushedRevision(publisher, "0".repeat(40));
  const again = await rerun(management, fixture.integration);

  assert.equal(again.code, 0, again.stderr);
  assert.equal(again.result.acceptedSha, rebased);
  assert.deepEqual(
    [again.result.cleanup.worktree, again.result.cleanup.branch],
    ["already-absent", "already-absent"],
  );
  assert.equal(pushes(), 0);
  assert.equal(await lsRemoteSha(fixture.origin, main), rebased);
  journey.assertSiblingUntouched();
});
