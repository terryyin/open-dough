import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { publishHistoryPreservingCandidate } from "./history-preserving-publication.mjs";
import {
  createManagedFixture,
  git,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import { retireWorktree } from "../../dough-land/scripts/worktree-retirement.mjs";
import {
  installReuseProvider,
  completeTarget,
  ignoreInstalledSkills,
  startStoryTarget,
} from "./ci-reuse-journey-test-fixtures.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import { readWorkerIdentity } from "./ci-mailbox-store.mjs";

const main = "refs/heads/main";
const story = "exec/story";
const publish = (fixture, options = {}) =>
  publishHistoryPreservingCandidate({
    ownedWorkspace: fixture.execution,
    publishedTip: fixture.candidateSha,
    branch: story,
    ...options,
  });
const retire = (fixture, receipt, completion) =>
  retireWorktree({
    repository: fixture.integration,
    worktree: fixture.execution,
    branch: story,
    createdForWork: true,
    contained: [receipt.sha],
    holdReason: () =>
      completion.verdict === "success" &&
      completion.shutdown.status === "confirmed"
        ? null
        : "completion unresolved",
  });

test("Story exact-A publication completes a real target reuse attempt with one covered execution and retires only after shutdown", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  await ignoreInstalledSkills(fixture);
  const provider = await installReuseProvider(fixture);
  const source = await provider.direct(fixture.candidateSha);
  await git(fixture.execution, "push", "origin", `HEAD:refs/heads/${story}`);
  const publication = await publish(fixture);
  assert.equal(publication.receipt.sha, fixture.candidateSha);
  assert.equal(await lsRemoteSha(fixture.origin, main), fixture.candidateSha);
  const directory = await startStoryTarget(fixture, publication.receipt.sha);
  const target = await provider.target(publication.receipt.sha);
  assert.equal(
    provider.count(fixture.candidateSha),
    1,
    "reuse must prevent duplicate covered execution",
  );
  assert.equal(target.decision.reuse, true);
  assert.equal(target.decision.source.runId, source.id);
  assert.equal(provider.count(fixture.candidateSha, "target-only"), 1);
  assert.equal(existsSync(fixture.execution), true);
  const completion = await completeTarget(fixture, directory, target);
  assert.equal(completion.verdict, "success");
  assert.equal(completion.shutdown.status, "confirmed");
  assert.equal(
    checkMailboxWorkerLiveness(readWorkerIdentity(directory), directory),
    "dead",
  );
  const removed = await retire(fixture, publication.receipt, completion);
  assert.equal(removed.worktree, "removed");
  assert.equal(removed.branch, "removed");
  assert.equal(existsSync(fixture.execution), false);
});

for (const race of [false, true]) {
  test(`Story ${race ? "rejected merge M replaced by N" : "new merge M"} validates only the exact accepted SHA`, async (t) => {
    const fixture = await createManagedFixture();
    t.after(fixture.cleanup);
    await ignoreInstalledSkills(fixture);
    const provider = await installReuseProvider(fixture);
    await provider.direct(fixture.candidateSha);
    await git(fixture.execution, "push", "origin", `HEAD:refs/heads/${story}`);
    await advanceOriginFromAnotherWriter(fixture.origin);
    const publication = await publish(fixture, {
      beforePush: async ({ attempt }) => {
        if (race && attempt === 0)
          await advanceOriginFromAnotherWriter(fixture.origin, {
            file: "racing.txt",
          });
      },
    });
    const sha = publication.receipt.sha;
    assert.notEqual(sha, fixture.candidateSha);
    assert.equal(publication.rejectedPushCount, race ? 1 : 0);
    assert.equal(await lsRemoteSha(fixture.origin, main), sha);
    const directory = await startStoryTarget(fixture, sha);
    const target = await provider.target(sha);
    assert.equal(target.decision.reuse, false);
    assert.equal(provider.count(sha), 1);
    assert.equal(provider.count(fixture.candidateSha), 1);
    if (race) {
      assert.notEqual(sha, publication.supersededSha);
      assert.equal(provider.count(publication.supersededSha), 0);
    }
    assert.equal(
      (await completeTarget(fixture, directory, target)).verdict,
      "success",
    );
  });
}

test("Story target-only failure on a reuse hit keeps branch, workspace and live observer", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  await ignoreInstalledSkills(fixture);
  const provider = await installReuseProvider(fixture);
  await provider.direct(fixture.candidateSha);
  await git(fixture.execution, "push", "origin", `HEAD:refs/heads/${story}`);
  const publication = await publish(fixture);
  const directory = await startStoryTarget(fixture, publication.receipt.sha);
  const target = await provider.target(publication.receipt.sha, {
    targetFailed: true,
  });
  assert.equal(target.decision.reuse, true);
  assert.equal(target.attempt.outcome, "failure");
  assert.equal(provider.count(publication.receipt.sha), 1);
  assert.equal(provider.count(publication.receipt.sha, "target-only"), 1);
  const completion = await completeTarget(fixture, directory, target);
  assert.equal(completion.verdict, "failure");
  assert.equal(completion.shutdown.status, "retained");
  assert.equal(
    checkMailboxWorkerLiveness(readWorkerIdentity(directory), directory),
    "alive",
  );
  assert.equal(
    (await retire(fixture, publication.receipt, completion)).worktree,
    "preserved",
  );
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(
    (await git(fixture.integration, "rev-parse", story)).stdout.trim(),
    publication.receipt.sha,
  );
});

test("Story closure-added C is freshly validated instead of borrowing the green implementation A", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  await ignoreInstalledSkills(fixture);
  const provider = await installReuseProvider(fixture);
  const implementation = fixture.candidateSha;
  await provider.direct(implementation);
  writeFileSync(join(fixture.execution, "closure.txt"), "closure\n");
  await git(fixture.execution, "add", "closure.txt");
  await git(fixture.execution, "commit", "-m", "final story closure");
  const closure = await revParse(fixture.execution, "HEAD");
  fixture.candidateSha = closure;
  await git(fixture.execution, "push", "origin", `HEAD:refs/heads/${story}`);
  const publication = await publish(fixture);
  assert.equal(publication.receipt.sha, closure);
  assert.notEqual(closure, implementation);
  const directory = await startStoryTarget(fixture, closure);
  const target = await provider.target(closure);
  assert.equal(target.decision.reuse, false);
  assert.equal(provider.count(implementation), 1);
  assert.equal(provider.count(closure), 1);
  assert.equal(
    (await completeTarget(fixture, directory, target)).requestedSha,
    closure,
  );
});
