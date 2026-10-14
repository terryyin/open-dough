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
  exec,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import { readWorkerIdentity } from "./ci-mailbox-store.mjs";
import {
  listRegisteredRevisions,
  readRevisionCoverage,
} from "./ci-mailbox-revision-coverage.mjs";
import { recordedVerdict } from "./ci-mailbox-await.mjs";
import { receiptPrefix } from "./ci-mailbox-location.mjs";
import { awaitWorkerState } from "./watch-ci-test-fixtures.mjs";
import { completeThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  customPolicy,
  customProvider,
} from "./ci-integrated-state-custom-test-fixtures.mjs";
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

test("declared policy: a rejected Trunk publication registers no candidate, and the racing writer's validated snapshot completes only the earlier accepted B", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  await ignoreInstalledSkills(fixture);
  const provider = (await customProvider()(t, fixture, customPolicy)).members;
  const first = await deliver(fixture, fixture.trunkSha);
  const b = first.receipt.sha;
  const directory = first.observation.directory;
  writeFileSync(join(fixture.execution, "repair.txt"), "repair\n");
  await git(fixture.execution, "add", "repair.txt");
  await git(fixture.execution, "commit", "-m", "repair");
  const racing = [];
  const stopped = await deliver(fixture, b, {
    validate: async () => ({ ok: true }),
    beforePush: async () =>
      racing.push(
        await advanceOriginFromAnotherWriter(fixture.origin, {
          file: `race-${racing.length + 1}.txt`,
        }),
      ),
  });
  assert.equal(stopped.status, "persistent-contention");
  assert.equal(stopped.receipt, null);
  assert.ok(racing.length >= 2);
  // Delivery fetched the earlier racing snapshot before retrying; the last
  // one stays an unvalidated newer tip.
  const c = racing.at(-2);
  const cAttempt = await provider.validate(c);
  await awaitWorkerState(
    directory,
    () => {
      const { integrated } =
        readRevisionCoverage(directory).find(({ sha }) => sha === b) ?? {};
      return integrated?.state === "success" && integrated.validated.sha === c;
    },
    "the racing snapshot's validated integrated state",
  );
  assert.deepEqual(listRegisteredRevisions(directory), [b]);
  assert.equal(recordedVerdict(directory, stopped.candidate), undefined);
  const { stdout } = await exec(
    process.execPath,
    [
      join(fixture.skill, "scripts/ci-mailbox.mjs"),
      "await-revision",
      directory,
      stopped.candidate,
    ],
    { cwd: fixture.execution, env: fixture.env },
  );
  const refused = JSON.parse(stdout.trim().slice(receiptPrefix.length));
  assert.equal(refused.unresolvedReason, "missing_registration");
  assert.equal(refused.verdict, undefined);

  const completion = await completeThroughCli(fixture, directory, b);
  assert.equal(completion.verdict, "success");
  assert.equal(completion.effectiveEvidence.source, "integrated_state");
  assert.equal(completion.effectiveEvidence.accepted.sha, b);
  assert.deepEqual(
    [
      completion.effectiveEvidence.validated.sha,
      completion.effectiveEvidence.validated.runId,
    ],
    [c, cAttempt.runId],
  );
  assert.equal(completion.shutdown.status, "confirmed");
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(
    await revParse(fixture.execution, "exec/story"),
    stopped.candidate,
  );
  assert.deepEqual(
    [b, stopped.candidate, c, racing.at(-1)].map((sha) =>
      provider.provider.count(sha),
    ),
    [0, 0, 1, 0],
  );
});
