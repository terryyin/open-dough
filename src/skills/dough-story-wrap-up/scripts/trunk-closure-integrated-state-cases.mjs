// Trunk Mode `finish` under a declared integrated-state policy, through the
// installed runnable custom provider: its attempts come from actually executed
// counted commands. Another writer's later snapshot C, published after the
// final closure was accepted, is unknown to this checkout; the observer
// fetches only C's objects, changing no ref, and the one `finish` completes
// the accepted closure from C. Retirement still needs that `success` with
// confirmed shutdown and no unread failure.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import {
  git,
  lsRemoteSha,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  awaitSignalWhileRunning,
  settledProbe,
} from "../../dough-execute-plan/scripts/process-lifetime-test-fixtures.mjs";
import { readRevisionCoverage } from "../../dough-execute-plan/scripts/ci-mailbox-revision-records.mjs";
import { readWorkerIdentity } from "../../dough-execute-plan/scripts/ci-mailbox-store.mjs";
import { waitForFailureEvent } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs";
import { checkMailboxWorkerLiveness } from "../../dough-execute-plan/scripts/ci-mailbox-worker-process.mjs";
import {
  customPolicy,
  customProvider,
} from "../../dough-execute-plan/scripts/ci-integrated-state-custom-test-fixtures.mjs";
import {
  branchSha,
  commitFinalClosure,
  createTrunkClosureFixture,
  deliverBeforeCleanupThroughCli,
  finishThroughCli,
} from "./trunk-closure-test-fixtures.mjs";

const main = "refs/heads/main";
const registered = (directory, sha) =>
  readRevisionCoverage(directory).some((revision) => revision.sha === sha);
const liveness = (directory) =>
  checkMailboxWorkerLiveness(readWorkerIdentity(directory), directory);
const refs = async (fixture) =>
  (await git(fixture.integration, "for-each-ref")).stdout;

for (const { name, rebased, unread } of [
  {
    name: "rebased past another writer's green R, completes the accepted rebased closure from C, and retires",
    rebased: true,
    unread: false,
  },
  {
    name: "completes the accepted closure from C but keeps every resource for the before-cleanup commit's unread failure",
    rebased: false,
    unread: true,
  },
])
  test(`Trunk finish, with another writer's C unknown to this checkout and no external fetch, ${name}`, async (t) => {
    const fixture = await createTrunkClosureFixture(t);
    const provider = (await customProvider()(t, fixture, customPolicy)).members;
    const before = await deliverBeforeCleanupThroughCli(fixture);
    const beforeCleanup = before.receipt.sha;
    const directory = before.observation.directory;
    if (unread) {
      await provider.validate(beforeCleanup, { failed: true });
      assert.equal((await waitForFailureEvent(directory)).sha, beforeCleanup);
    }
    const final = await commitFinalClosure(fixture);
    const r = rebased && (await provider.validateFromAnotherWriter("r.txt"));
    const finishing = finishThroughCli(fixture, {
      beforeCleanup,
      final,
      extra: ["--created-for-work"],
    });
    let accepted;
    await awaitSignalWhileRunning(
      async () => {
        accepted = await lsRemoteSha(fixture.origin, main);
        return (
          accepted !== (r ? r.sha : beforeCleanup) &&
          registered(directory, accepted)
        );
      },
      settledProbe(finishing),
      () => "finish ended before registering the final closure",
    );
    assert.equal(accepted === final, !rebased, "the rebased closure is new");
    const c = await provider.publishFromAnotherWriter("c.txt");
    const before_ = await refs(fixture);
    await assert.rejects(
      git(fixture.execution, "cat-file", "-e", c.sha),
      "this checkout lacks C",
    );
    const cAttempt = await c.validate();

    const { result, code, stderr } = await finishing;
    assert.equal(code, unread ? 1 : 0, stderr);
    assert.equal(result.acceptedSha, accepted);
    assert.equal(result.observation.directory, directory);
    const { completion } = result;
    assert.equal(completion.requestedSha, accepted);
    assert.equal(completion.verdict, "success");
    const evidence = completion.effectiveEvidence;
    assert.equal(evidence.source, "integrated_state");
    assert.equal(evidence.accepted.sha, accepted);
    assert.deepEqual(evidence.validated, {
      sha: c.sha,
      branch: "main",
      runId: cAttempt.runId,
      attempt: cAttempt.attemptId,
      url: cAttempt.url,
      ...customPolicy,
    });
    assert.deepEqual(evidence.ancestry, {
      ancestor: accepted,
      descendant: c.sha,
      basis: "git merge-base --is-ancestor",
    });
    // The observer's fetch wrote no ref; only retirement removes the branch.
    const branchLine = (
      await git(fixture.integration, "for-each-ref", "refs/heads/exec/story")
    ).stdout;
    if (unread) {
      assert.equal(await refs(fixture), before_);
      assert.equal(result.step, "completion");
      assert.deepEqual(completion.shutdown, {
        status: "retained",
        reason: "unread_actionable_failure",
      });
      assert.deepEqual(
        completion.unreadActionableFailures.map(({ sha }) => sha),
        [beforeCleanup],
      );
      assert.equal(result.cleanup, "not-performed");
      assert.equal(existsSync(fixture.execution), true);
      assert.equal(await branchSha(fixture), final);
      assert.equal(liveness(directory), "alive");
    } else {
      // Retirement removes the branch, and its own containment fetch moves
      // remote-tracking refs; local branches are otherwise unchanged.
      const branches = (listing) =>
        listing
          .split("\n")
          .filter(
            (line) =>
              line.includes("\trefs/heads/") &&
              !line.endsWith("\trefs/heads/exec/story"),
          );
      assert.equal(branchLine, "");
      assert.deepEqual(branches(await refs(fixture)), branches(before_));
      assert.equal(result.step, "done");
      assert.equal(completion.shutdown.status, "confirmed");
      assert.deepEqual(
        [result.cleanup.worktree, result.cleanup.branch],
        ["removed", "removed"],
      );
      assert.equal(existsSync(fixture.execution), false);
      assert.equal(await branchSha(fixture), "");
    }
    assert.deepEqual(
      [final, accepted, c.sha].map((sha) => provider.provider.count(sha)),
      [0, 0, 1],
    );
  });
