import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { heldFixture } from "./blocked-execution-test-fixtures.mjs";
import { digestFile, execute } from "./blocked-execution-store.mjs";

test("a change during enrollment is reconciled after the signal route is attached", async (t) => {
  const h = await heldFixture(t);
  let changed = false;
  h.native.beforeRead = () => {
    if (changed) return;
    changed = true;
    h.signal({ status: "ready", checked: true });
  };
  await h.start();
  await h.until((state) => state.phase === "accepted");
  assert.equal(h.submissions().length, 1);
  h.complete();
  await h.until((state) => state.worker.ended);
});

test("lost acknowledgment reconciles native acceptance without blind resend", async (t) => {
  const h = await heldFixture(t);
  await h.start();
  h.native.beforeInput = () => h.native.failConnection();
  h.signal({ status: "ready", checked: true });
  const uncertain = await h.until(
    (state) => state.phase === "uncertain" && state.worker.ended,
  );
  assert.equal(uncertain.accepted, undefined);
  assert.match(uncertain.attention.recovery, /reconcile/);
  assert.equal(h.submissions().length, 1);
  const same = await h.start();
  assert.equal(same.phase, "uncertain");
  assert.equal(same.alreadyEnrolled, true);
  h.native.history.at(-1).status = "completed";
  const [recovery, ...recoveryArgs] = uncertain.attention.recoveryCommand;
  const reconciled = JSON.parse(
    (await execute(recovery, recoveryArgs, { cwd: h.root })).stdout,
  );
  assert.equal(reconciled.phase, "continued");
  assert.equal(reconciled.accepted.id, "native-turn-id");
  assert.equal(h.submissions().length, 1);
  assert.deepEqual(
    reconciled.input.execution.acceptedProof,
    uncertain.input.execution.acceptedProof,
  );
  assert.equal((await h.cli("reconcile")).phase, "continued");
  assert.equal(h.submissions().length, 1);
});

test("absence of native acceptance stays uncertain through explicit recovery", async (t) => {
  const h = await heldFixture(t);
  await h.start();
  h.native.beforeInput = () => {
    h.native.history.pop();
    h.native.failConnection();
  };
  h.signal({ status: "ready", checked: true });
  await h.until((state) => state.phase === "uncertain" && state.worker.ended);
  const unresolved = await h.cli("reconcile");
  assert.equal(unresolved.phase, "uncertain");
  assert.match(unresolved.attention.reason, /does not establish.*acceptance/);
  await assert.rejects(
    h.cli("rearm", ["--input-file", h.inputFile]),
    /Reconcile unresolved acceptance/,
  );
  assert.equal(h.submissions().length, 1);
});

test("an existing hold cannot be mistaken for another execution's enrollment", async (t) => {
  const h = await heldFixture(t);
  await h.start();
  h.input.execution.identity = "SEED-002#another-consumer";
  await assert.rejects(h.start(), /cannot replace.*owner or location/);
  assert.equal(h.read().input.execution.identity, "SEED-001#consumer");
  assert.equal(h.submissions().length, 0);
});

test("live rearm enrolls a changed signal location and preserves native identity despite key order", async (t) => {
  const h = await heldFixture(t);
  await h.start();
  h.signal({ status: "ready", checked: true });
  const first = await h.until((state) => state.phase === "accepted");
  const nextDirectory = join(h.root, "next-supplier");
  mkdirSync(nextDirectory);
  const signalFile = join(nextDirectory, "evidence.json");
  writeFileSync(
    signalFile,
    JSON.stringify({ status: "paused", checked: false }),
  );
  h.input.condition.signalFile = signalFile;
  h.input.condition.observed = digestFile(signalFile);
  h.input.condition.check[h.input.condition.check.length - 1] = signalFile;
  const { host, threadId, endpoint } = h.input.continuation;
  h.input.continuation = { endpoint, threadId, host };
  writeFileSync(h.inputFile, JSON.stringify(h.input));
  assert.equal(
    (await h.cli("rearm", ["--input-file", h.inputFile])).phase,
    "held",
  );
  assert.equal(h.read().worker.pid, first.worker.pid);
  h.complete();
  h.native.nextTurnId = "second-continuation";
  writeFileSync(signalFile, JSON.stringify({ status: "ready", checked: true }));
  const second = await h.until(
    (state) => state.accepted?.id === "second-continuation",
  );
  assert.equal(h.submissions().length, 2);
  assert.equal(second.input.condition.signalFile, signalFile);
  h.complete("second-continuation");
  await h.until((state) => state.worker.ended);
});

test("evidence arriving before the original native turn completes waits for its owner", async (t) => {
  const h = await heldFixture(t);
  h.native.history[0].status = "inProgress";
  await h.start();
  h.signal({ status: "ready", checked: true });
  await h.until((state) => state.lastEvidence?.satisfied);
  assert.equal(h.submissions().length, 0);
  h.complete("held-turn");
  await h.until((state) => state.phase === "accepted");
  assert.equal(h.submissions().length, 1);
  h.complete();
  await h.until((state) => state.worker.ended);
});

test("a failed live rearm applies a terminal event received during its native snapshot", async (t) => {
  const h = await heldFixture(t);
  await h.start();
  h.signal({ status: "ready", checked: true });
  const accepted = await h.until((state) => state.phase === "accepted");
  h.input.condition.observed = digestFile(h.input.condition.signalFile);
  writeFileSync(h.inputFile, JSON.stringify(h.input));
  let completedDuringRearm = false;
  h.native.beforeRead = (includeTurns) => {
    if (!includeTurns || completedDuringRearm) return;
    completedDuringRearm = true;
    h.complete();
    h.native.effectiveModel = "configuration-changed-during-rearm";
  };
  await assert.rejects(
    h.cli("rearm", ["--input-file", h.inputFile]),
    /Native settings changed before rearm/,
  );
  assert.equal(completedDuringRearm, true);
  const settled = await h.cli("status");
  assert.equal(settled.phase, "continued");
  assert.equal(settled.accepted.id, accepted.accepted.id);
  assert.equal(settled.accepted.status, "completed");
  assert.equal(
    settled.generation,
    accepted.generation,
    "failed rearm cannot replace the accepted hold",
  );
  assert.deepEqual(
    settled.input.execution.acceptedProof,
    accepted.input.execution.acceptedProof,
  );
  assert.deepEqual(
    settled.input.execution.outstandingProof,
    accepted.input.execution.outstandingProof,
  );
  assert.equal(h.submissions().length, 1);
  await h.until((state) => state.worker.ended);
});
