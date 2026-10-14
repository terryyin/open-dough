import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  createManagedFixture,
  git,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import { readWorkerIdentity } from "./ci-mailbox-store.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import {
  awaitSignalWhileRunning,
  settledProbe,
} from "./process-lifetime-test-fixtures.mjs";
import {
  installReuseProvider,
  ignoreInstalledSkills,
} from "./ci-reuse-journey-test-fixtures.mjs";
import { main, deliver, waitTarget } from "./ci-reuse-trunk-test-fixtures.mjs";
import {
  branchSha,
  commitFinalClosure,
  createTrunkClosureFixture,
  deliverBeforeCleanupThroughCli,
  finishThroughCli,
} from "../../dough-story-wrap-up/scripts/trunk-closure-test-fixtures.mjs";

for (const retained of [
  "failed-fresh",
  "unread-failure-retains-observer",
  "incomplete-target",
]) {
  test(`Trunk ${retained} keeps accepted closure, workspace and branch under the existing observer gate`, async (t) => {
    const fixture = await createTrunkClosureFixture(t);
    const provider = await installReuseProvider(fixture);
    const before = await deliverBeforeCleanupThroughCli(fixture);
    const initial = await provider.target(before.receipt.sha, {
      failed: retained === "unread-failure-retains-observer",
    });
    await waitTarget(before.observation.directory, initial);
    const final = await commitFinalClosure(fixture);
    if (retained === "unread-failure-retains-observer")
      await provider.direct(final);
    const finishing = finishThroughCli(fixture, {
      beforeCleanup: before.receipt.sha,
      final,
      extra: ["--created-for-work"],
    });
    await awaitSignalWhileRunning(
      () => lsRemoteSha(fixture.origin, main).then((sha) => sha === final),
      settledProbe(finishing),
      () => "finish ended before publication",
    );
    const target = await provider.target(final, {
      failed: retained === "failed-fresh",
      incomplete: retained === "failed-fresh",
      cancelled: retained === "incomplete-target",
    });
    const { result, code } = await finishing;
    assert.equal(code, 1);
    assert.equal(result.step, "completion");
    assert.equal(result.acceptedSha, final);
    assert.equal(result.completion.requestedSha, final);
    assert.deepEqual(result.completion.effectiveEvidence.revision.checkedBy, {
      runId: target.attempt.runId,
      attemptId: target.attempt.attemptId,
    });
    assert.equal(
      result.completion.verdict,
      retained === "failed-fresh"
        ? "failure"
        : retained === "incomplete-target"
          ? undefined
          : "success",
    );
    if (retained === "incomplete-target")
      assert.equal(result.completion.unresolvedReason, "incomplete");
    assert.equal(
      target.decision.reuse,
      retained === "unread-failure-retains-observer",
    );
    assert.equal(provider.count(final), 1);
    assert.equal(
      result.completion.shutdown.status,
      retained === "incomplete-target" ? "confirmed" : "retained",
    );
    assert.equal(result.cleanup, "not-performed");
    assert.equal(existsSync(fixture.execution), true);
    assert.equal(await branchSha(fixture), final);
    const directory = result.observation.directory;
    assert.equal(directory, before.observation.directory);
    assert.equal(
      checkMailboxWorkerLiveness(readWorkerIdentity(directory), directory),
      retained === "incomplete-target" ? "dead" : "alive",
    );
    const report = JSON.parse(readFileSync(new URL(target.attempt.url)));
    assert.equal(report.target.sha, final);
  });
}

test("Trunk rejected publication never obtains a receipt and preserves the workspace, branch and existing observer despite source success", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  await ignoreInstalledSkills(fixture);
  const provider = await installReuseProvider(fixture);
  const first = await deliver(fixture, fixture.trunkSha);
  const initial = await provider.target(first.receipt.sha);
  await waitTarget(first.observation.directory, initial);
  writeFileSync(join(fixture.execution, "repair.txt"), "repair\n");
  await git(fixture.execution, "add", "repair.txt");
  await git(fixture.execution, "commit", "-m", "repair");
  const candidate = await revParse(fixture.execution, "HEAD");
  await provider.direct(candidate);
  let attempts = 0;
  const stopped = await deliver(fixture, first.receipt.sha, {
    validate: async () => ({ ok: true }),
    beforePush: async () =>
      advanceOriginFromAnotherWriter(fixture.origin, {
        file: `race-${++attempts}.txt`,
      }),
  });
  assert.equal(stopped.status, "persistent-contention");
  assert.equal(stopped.receipt, null);
  assert.equal(stopped.ok, false);
  assert.equal(provider.targets.length, 1);
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(
    await revParse(fixture.execution, "exec/story"),
    stopped.candidate,
  );
  assert.equal(
    checkMailboxWorkerLiveness(
      readWorkerIdentity(first.observation.directory),
      first.observation.directory,
    ),
    "alive",
  );
});
