// Recovery of Trunk Mode `finish` around a selected supplier's visit: an
// execution worktree lost before the visit settled keeps the closure at the
// visit with nothing pushed, completed or retired; a settled SHA whose
// observer ended stops at observation until `deliver` from the worktree
// establishes and registers this coordinator's own, after which the settled
// SHA completes and the resources retire.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { consumer } from "./supplier-dependency-fixture.mjs";
import {
  commitCompletedSupplier,
  commitSupplierCleanup,
  handTrunkVisit,
  judgeConsumers,
  selectedTrunkSupplier,
} from "./supplier-closure-visit-fixture.mjs";
import { lsRemoteSha } from "../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { deliverThroughCli } from "../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { git } from "../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs";
import {
  branchSha,
  createTrunkClosureFixture,
  deliverBeforeCleanupThroughCli,
  finishThroughCli,
  installInIntegration,
  recordPushes,
  releaseCi,
} from "../../src/skills/dough-story-wrap-up/scripts/trunk-closure-test-fixtures.mjs";

const main = "refs/heads/main";
const question = "Does the late story adopt B's contract?";

test("a clean visit printed by finish lets its worktree-absent rerun name --visit-settled and finish retirement", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  installInIntegration(fixture);
  const project = await commitCompletedSupplier(
    t,
    fixture.execution,
    fixture.fixture,
  );
  const before = await deliverBeforeCleanupThroughCli(fixture);
  const final = await commitSupplierCleanup(project);
  releaseCi(fixture, { [before.receipt.sha]: "success", [final]: "success" });
  const selected = ["--supplier-identity", consumer.identity];
  // Without the caller's creation fact, retirement holds after the real
  // finish has printed its clean visit and completed CI. Removing only the
  // worktree supplies the state of an interruption before branch removal.
  const first = await finishThroughCli(fixture, {
    beforeCleanup: before.receipt.sha,
    final,
    extra: selected,
  });
  assert.equal(first.result.step, "retire");
  assert.equal(first.result.visit.status, "visited");
  assert.deepEqual(first.result.visit.consumers, []);
  assert.deepEqual(first.result.visit.problems, []);
  assert.equal(first.result.completion.verdict, "success");
  assert.equal(first.result.completion.shutdown.status, "confirmed");
  await git(fixture.integration, "worktree", "remove", fixture.execution);
  const recorded = recordPushes(fixture);
  const rerun = (extra = []) =>
    finishThroughCli(fixture, {
      beforeCleanup: before.receipt.sha,
      final,
      checkout: fixture.integration,
      env: recorded.env,
      extra: [
        ...selected,
        "--created-for-work",
        "--repository",
        join(fixture.integration, ".git"),
        ...extra,
      ],
    });

  const stopped = await rerun();
  assert.equal(stopped.code, 1);
  assert.equal(stopped.result.step, "visit");
  assert.equal(stopped.result.acceptedSha, final);
  assert.match(stopped.result.recovery, /clean visit.*earlier finish/);
  assert.ok(stopped.result.recovery.includes(`--visit-settled ${final}`));
  assert.equal(await branchSha(fixture), final);

  const finished = await rerun(["--visit-settled", final]);
  assert.equal(finished.code, 0, finished.stderr);
  assert.equal(finished.result.completion.requestedSha, final);
  assert.equal(finished.result.completion.shutdown.status, "confirmed");
  assert.equal(finished.result.cleanup.worktree, "already-absent");
  assert.equal(finished.result.cleanup.branch, "removed");
  assert.equal(await branchSha(fixture), "");
  assert.deepEqual(recorded.pushes(), []);
  assert.equal(await lsRemoteSha(fixture.origin, main), final);
});

test("finish for a selected supplier whose worktree is gone before the visit settled stops at the visit with nothing pushed, completed or retired", async (t) => {
  const handed = await handTrunkVisit(t);
  const { fixture, acceptedSha } = handed;
  installInIntegration(fixture);
  // The observer's launcher lives in the worktree; stop it before removal.
  await fixture.stopObserver(handed.observer);
  const repository = join(fixture.integration, ".git");
  await git(
    fixture.integration,
    "worktree",
    "remove",
    "--force",
    fixture.execution,
  );
  const recorded = recordPushes(fixture);

  const { result, code } = await finishThroughCli(fixture, {
    beforeCleanup: handed.evidence,
    final: acceptedSha,
    checkout: fixture.integration,
    env: recorded.env,
    extra: [...selectedTrunkSupplier, "--repository", repository],
  });

  assert.equal(code, 1);
  assert.equal(result.step, "visit");
  assert.equal(result.publication, "accepted");
  assert.equal(result.acceptedSha, acceptedSha);
  assert.equal(result.pushCount, 0);
  assert.match(result.reason, /execution worktree is absent/);
  assert.match(result.recovery, /report the unfinished consumer visit/);
  assert.equal(Object.hasOwn(result, "visit"), false);
  assert.equal(Object.hasOwn(result, "completion"), false);
  assert.equal(result.cleanup, "not-performed");
  assert.deepEqual(recorded.pushes(), []);
  assert.equal(await lsRemoteSha(fixture.origin, main), acceptedSha);
  assert.equal(await branchSha(fixture), acceptedSha);
});

test("a settled consumer publication whose observer ended stops at observation until deliver establishes this coordinator's own, then completes and retires", async (t) => {
  const handed = await handTrunkVisit(t);
  const { fixture, acceptedSha, observer } = handed;
  await judgeConsumers(handed.setup, handed.visit, acceptedSha, question);
  const { delivered } = await deliverThroughCli(fixture, { base: acceptedSha });
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.observation.directory, observer);
  const consumerSha = delivered.receipt.sha;
  await fixture.stopObserver(observer);
  releaseCi(fixture, {
    [handed.evidence]: "success",
    [acceptedSha]: "success",
    [consumerSha]: "success",
  });
  const settled = [...selectedTrunkSupplier, "--visit-settled", consumerSha];

  const ended = await finishThroughCli(fixture, {
    beforeCleanup: handed.evidence,
    final: acceptedSha,
    extra: settled,
  });
  assert.equal(ended.code, 1);
  assert.equal(ended.result.step, "observation");
  assert.equal(ended.result.pushCount, 0);
  assert.equal(ended.result.completion, null);
  assert.equal(ended.result.cleanup, "not-performed");
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(await branchSha(fixture), consumerSha);

  const reestablished = await deliverThroughCli(fixture, { base: consumerSha });
  assert.equal(reestablished.delivered.publication, "accepted");
  assert.notEqual(reestablished.delivered.observation.directory, observer);
  assert.equal(await lsRemoteSha(fixture.origin, main), consumerSha);

  const finished = await finishThroughCli(fixture, {
    beforeCleanup: handed.evidence,
    final: acceptedSha,
    extra: settled,
  });
  assert.equal(finished.code, 0, finished.stderr);
  assert.equal(finished.result.pushCount, 0);
  assert.equal(
    finished.result.observation.directory,
    reestablished.delivered.observation.directory,
  );
  assert.equal(finished.result.completion.requestedSha, consumerSha);
  assert.equal(finished.result.completion.verdict, "success");
  assert.equal(finished.result.completion.shutdown.status, "confirmed");
  assert.equal(finished.result.cleanup.worktree, "removed");
  assert.equal(existsSync(fixture.execution), false);
});
