// Codex completion recovery: a stream finished by budget names arming a fresh
// stream; after arming, complete with --coordinator and --observer-directory
// succeeds without restarting the finished directory.
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  createCodexReplay,
  endCodexStreamByBudget,
} from "./ci-codex-lifecycle-test-fixtures.mjs";
import { snapshotMailboxRecords } from "./ci-mailbox-budget-test-fixtures.mjs";
import { completionState } from "./ci-mailbox-completion-state.mjs";
import { readPredecessors } from "./ci-mailbox-predecessors.mjs";
import { recoverExecutionCompletion } from "./execution-completion-recovery.mjs";
import { createManagedFixture } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { revParse } from "./publication-test-fixtures.mjs";

const coordinator = "publisher";
const repo = "owner/project";
const targetRef = "refs/heads/main";

test("Codex recovery arms a fresh stream after budget finish, then completes on it", async (t) => {
  const fixture = await createManagedFixture({ platforms: [".agents"] });
  t.after(fixture.cleanup);
  const root = fixture.execution;
  const storage = fixture.storage;
  const sha = await revParse(root, "HEAD");
  const observeRoot = join(fixture.fixture, "observe-root");
  mkdirSync(observeRoot, { recursive: true });

  const finished = await endCodexStreamByBudget({
    root,
    storage,
    repo,
    coordinator,
    sha,
    observeRoot,
  });
  const { handoff } = completionState(finished, sha, { root, storage });
  const before = snapshotMailboxRecords(finished);

  const withoutLive = await recoverExecutionCompletion({
    workspace: root,
    acceptedSha: sha,
    targetRef,
    repo,
    host: "codex",
    coordinator,
    observerDirectory: finished,
    env: fixture.env,
    root,
    storage,
  });
  assert.equal(withoutLive.ok, false);
  assert.equal(withoutLive.receipt, null);
  assert.equal(withoutLive.observation.state, "unobserved");
  assert.equal(withoutLive.observation.ownership, "ended");
  assert.match(
    withoutLive.observation.reason,
    /ended \(finished\).*arm a fresh `ci-mailbox\.mjs stream --execution owner\/project main --coordinator <value>`[\s\S]*completion recovery[\s\S]*never restart a finished stream[\s\S]*pass --coordinator and --observer-directory to complete/,
  );
  assert.deepEqual(snapshotMailboxRecords(finished), before);

  const replay = createCodexReplay(fixture.teardown, fixture.env, {
    command: [
      join(fixture.skill, "scripts/ci-mailbox.mjs"),
      "stream",
      "--execution",
      repo,
      "main",
      "60000",
      "--coordinator",
      coordinator,
    ],
  });
  const fresh = await replay.setup();
  fixture.stopAtTeardown(fresh.directory);
  fixture.releaseSuccess(sha);

  const recovered = await recoverExecutionCompletion({
    workspace: root,
    acceptedSha: sha,
    targetRef,
    repo,
    host: "codex",
    coordinator,
    observerDirectory: fresh.directory,
    env: fixture.env,
    root,
    storage,
    maxDurationMs: 60_000,
  });
  assert.equal(recovered.ok, true, recovered.observation?.reason);
  assert.equal(recovered.observation.directory, fresh.directory);
  assert.equal(recovered.receipt.verdict, "success");
  assert.equal(recovered.receipt.shutdown.status, "confirmed");
  assert.equal(recovered.receipt.requestedSha, sha);
  assert.notEqual(fresh.directory, finished);
  assert.deepEqual(readPredecessors(fresh.directory), [finished]);
  assert.equal(
    completionState(fresh.directory, sha, { root, storage }).handoff.deadline,
    handoff.deadline,
  );
  assert.deepEqual(snapshotMailboxRecords(finished), before);
});
