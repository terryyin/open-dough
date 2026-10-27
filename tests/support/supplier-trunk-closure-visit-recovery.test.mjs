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
import {
  handTrunkVisit,
  judgeConsumers,
  selectedTrunkSupplier,
} from "./supplier-closure-visit-fixture.mjs";
import { lsRemoteSha } from "../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { deliverThroughCli } from "../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { git } from "../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs";
import {
  branchSha,
  finishThroughCli,
  installInIntegration,
  recordPushes,
  releaseCi,
} from "../../src/skills/dough-story-wrap-up/scripts/trunk-closure-test-fixtures.mjs";

const main = "refs/heads/main";
const question = "Does the late story adopt B's contract?";

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
