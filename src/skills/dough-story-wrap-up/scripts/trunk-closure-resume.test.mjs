// An interrupted Trunk Mode `finish` is rerun as the agent reruns it: the same
// installed command in a child process. Each rerun continues from the first
// unfinished step: an accepted final closure is not pushed again, completion is
// reused or repeated on the observer that covers it, and cleanup completes or
// reports itself already done. An unpublished final closure the target moved
// past is rebased and published once, keeping the worktree until the receipt.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { setTimeout as pause } from "node:timers/promises";
import { promisify } from "node:util";
import { parseReceipt } from "../../dough-execute-plan/scripts/ci-mailbox-await-test-fixtures.mjs";
import { readRevisionCoverage } from "../../dough-execute-plan/scripts/ci-mailbox-revision-coverage.mjs";
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

// Both closure commits accepted through the installed `deliver` on one live
// observer: `finish` was interrupted after its final push was accepted.
async function acceptBothClosures(fixture) {
  const { delivered: before } = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
  });
  const final = await commitFinalClosure(fixture);
  const { delivered } = await deliverThroughCli(fixture, {
    base: before.receipt.sha,
  });
  assert.equal(delivered.receipt.sha, final);
  assert.equal(delivered.observation.directory, before.observation.directory);
  releaseCi(fixture, { [before.receipt.sha]: "success", [final]: "success" });
  return {
    beforeCleanup: before.receipt.sha,
    final,
    directory: before.observation.directory,
  };
}

// The installed observer command, run from the execution worktree.
async function mailboxCli(fixture, ...args) {
  const launcher = join(fixture.skill, "scripts/ci-mailbox.mjs");
  const { stdout } = await promisify(execFile)(
    process.execPath,
    [launcher, ...args],
    { cwd: fixture.execution, env: fixture.env },
  );
  return stdout;
}

// The completion the interrupted `finish` ran.
async function completeThroughCli(fixture, directory, sha) {
  return parseReceipt(
    await mailboxCli(fixture, "complete-revision", directory, sha),
  );
}

function coverageOf(directory, sha) {
  return readRevisionCoverage(directory).filter((entry) => entry.sha === sha);
}

test("a rerun after the final closure was accepted pushes nothing, completes once on the covering observer, and retires", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const { beforeCleanup, final, directory } = await acceptBothClosures(fixture);
  const recorder = recordPushes(fixture);

  const { result, code, stderr } = await finishThroughCli(fixture, {
    beforeCleanup,
    final,
    env: recorder.env,
    extra: ["--created-for-work"],
  });

  assert.equal(code, 0, stderr);
  assert.deepEqual(recorder.pushes(), []);
  assert.equal(result.pushCount, 0);
  assert.equal(result.acceptedSha, final);
  assert.equal(result.observation.directory, directory);
  assert.equal(coverageOf(directory, final).length, 1);
  assert.equal(result.completion.requestedSha, final);
  assert.equal(result.completion.verdict, "success");
  assert.equal(result.completion.shutdown.status, "confirmed");
  assert.equal(result.cleanup.worktree, "removed");
  assert.equal(existsSync(fixture.execution), false);
  assert.equal(await branchSha(fixture), "");
  assert.equal(await lsRemoteSha(fixture.origin, main), final);
});

test("a rerun after completion repeats it safely on the ended observer, pushes nothing, and retires", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const { beforeCleanup, final, directory } = await acceptBothClosures(fixture);
  const first = await completeThroughCli(fixture, directory, final);
  assert.equal(first.shutdown.status, "confirmed");
  const recorder = recordPushes(fixture);

  const { result, code, stderr } = await finishThroughCli(fixture, {
    beforeCleanup,
    final,
    env: recorder.env,
    extra: ["--created-for-work"],
  });

  assert.equal(code, 0, stderr);
  assert.deepEqual(recorder.pushes(), []);
  assert.equal(result.observation.directory, directory);
  assert.equal(coverageOf(directory, final).length, 1);
  assert.equal(result.completion.verdict, "success");
  assert.equal(result.completion.shutdown.status, "confirmed");
  assert.deepEqual(
    [result.cleanup.worktree, result.cleanup.branch],
    ["removed", "removed"],
  );
  assert.equal(existsSync(fixture.execution), false);
});

test("a rerun after the worktree was removed works from the recorded management context, pushes nothing, and reports cleanup done", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  installInIntegration(fixture);
  const { beforeCleanup, final, directory } = await acceptBothClosures(fixture);
  await completeThroughCli(fixture, directory, final);
  // The management context an earlier result reported.
  const repository = join(fixture.integration, ".git");
  await git(fixture.integration, "worktree", "remove", fixture.execution);
  const recorder = recordPushes(fixture);
  const rerun = (extra = []) =>
    finishThroughCli(fixture, {
      beforeCleanup,
      final,
      env: recorder.env,
      checkout: fixture.integration,
      extra: ["--created-for-work", ...extra],
    });

  const lost = await rerun();
  assert.equal(lost.code, 1);
  assert.equal(lost.result.step, "context");
  assert.match(lost.result.recovery, /--repository/);
  assert.equal(await branchSha(fixture), final);

  const { result, code, stderr } = await rerun(["--repository", repository]);
  assert.equal(code, 0, stderr);
  assert.equal(result.repository, repository);
  assert.equal(result.pushCount, 0);
  assert.equal(result.completion.shutdown.status, "confirmed");
  assert.deepEqual(
    [result.cleanup.worktree, result.cleanup.branch],
    ["already-absent", "removed"],
  );
  assert.equal(await branchSha(fixture), "");

  const again = await rerun(["--repository", repository]);
  assert.equal(again.code, 0, again.stderr);
  assert.deepEqual(
    [again.result.cleanup.worktree, again.result.cleanup.branch],
    ["already-absent", "already-absent"],
  );
  assert.deepEqual(recorder.pushes(), []);
  assert.equal(await lsRemoteSha(fixture.origin, main), final);
});

test("a rerun whose worktree is gone before the final closure was accepted stops without publishing or retiring", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  installInIntegration(fixture);
  const { delivered: before } = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
  });
  const final = await commitFinalClosure(fixture);
  // Its observer ended before the worktree was removed.
  await mailboxCli(fixture, "stop", before.observation.directory);
  await git(fixture.integration, "worktree", "remove", fixture.execution);
  const recorder = recordPushes(fixture);

  const { result, code } = await finishThroughCli(fixture, {
    beforeCleanup: before.receipt.sha,
    final,
    env: recorder.env,
    checkout: fixture.integration,
    extra: ["--repository", fixture.integration, "--created-for-work"],
  });

  assert.equal(code, 1);
  assert.equal(result.step, "context");
  assert.equal(result.publication, "not-attempted");
  assert.match(result.recovery, /unpublished final closure/);
  assert.deepEqual(recorder.pushes(), []);
  assert.equal(await branchSha(fixture), final);
});

test("a final closure the target moved past is rebased and published once, and the worktree stays until the receipt", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const { delivered: before } = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
  });
  const beforeCleanup = before.receipt.sha;
  const final = await commitFinalClosure(fixture);
  const theirs = await advanceOriginFromAnotherWriter(fixture.origin);
  const recorder = recordPushes(fixture);

  const running = finishThroughCli(fixture, {
    beforeCleanup,
    final,
    env: recorder.env,
    extra: ["--created-for-work"],
  });
  let rebased = theirs;
  for (let tries = 0; rebased === theirs && tries < 200; tries += 1) {
    await pause(50);
    rebased = await lsRemoteSha(fixture.origin, main);
  }
  assert.notEqual(rebased, theirs);
  // Published and waiting on CI: the worktree and branch are still there.
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(await branchSha(fixture), rebased);
  releaseCi(fixture, { [beforeCleanup]: "success", [rebased]: "success" });
  const { result, code, stderr } = await running;

  assert.equal(code, 0, stderr);
  assert.equal(recorder.pushes().length, 1);
  assert.equal(result.pushCount, 1);
  assert.equal(result.acceptedSha, rebased);
  assert.notEqual(rebased, final);
  assert.equal(
    (await git(fixture.origin, "rev-parse", `${rebased}~1`)).stdout.trim(),
    theirs,
  );
  assert.equal(result.completion.requestedSha, rebased);
  assert.equal(result.completion.shutdown.status, "confirmed");
  assert.equal(result.cleanup.worktree, "removed");
  assert.equal(existsSync(fixture.execution), false);
  assert.equal(await lsRemoteSha(fixture.origin, main), rebased);
});
