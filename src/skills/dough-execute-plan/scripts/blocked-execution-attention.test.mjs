import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { heldFixture } from "./blocked-execution-test-fixtures.mjs";
import {
  assertRetained,
  heldClock,
  heldCiFixture,
} from "./blocked-execution-attention-test-fixtures.mjs";
import { execute } from "./blocked-execution-store.mjs";

test("a meaningful deadline reaches its retained owner once, after the original turn completes", async (t) => {
  const h = await heldFixture(t, (builder) =>
    builder.withObservationDeadline(2000, "supplier's agreed proof window"),
  );
  h.native.history[0].status = "inProgress";
  const advance = heldClock(h);
  const receipt = await h.start();
  assert.equal(receipt.attentionRoute.kind, "same-native-thread");
  assert.equal(receipt.attentionRoute.owner, "consumer-agent");
  assert.match(receipt.attentionRoute.lifetime, /worker.*daemon/);
  assert.match(receipt.attentionRoute.limitation, /No spontaneous alert/);
  advance(1999);
  assert.equal(h.submissions().length, 0);
  advance(2000);
  const waiting = await h.until(
    (state) => state.attention?.delivery === "pending",
  );
  assert.equal(waiting.phase, "held");
  assertRetained(h, waiting);
  assert.equal(h.submissions().length, 0);
  h.complete("held-turn");
  const accepted = await h.until((state) => state.phase === "accepted");
  assert.equal(accepted.pending.purpose, "attention");
  assert.equal(h.submissions().length, 1);
  assert.equal(
    h.submissions()[0].params.threadId,
    h.input.continuation.threadId,
  );
  assert.match(h.submissions()[0].params.input[0].text, /agreed proof window/);
  assert.match(
    h.submissions()[0].params.input[0].text,
    /consumer integration and applicable CI receipt/,
  );
  assertRetained(h, accepted);
  h.complete();
  const delivered = await h.until(
    (state) => state.phase === "attention-delivered" && state.worker.ended,
  );
  assert.equal(delivered.attentionRoute.availability, "ended");
  const [command, ...args] = delivered.attention.recoveryCommand;
  const repeated = JSON.parse(
    (
      await execute(command, args, {
        cwd: h.workspace,
        env: h.commandEnvironment,
      })
    ).stdout,
  );
  assert.equal(repeated.phase, "attention");
  await h.until((state) => state.worker.ended);
  assert.equal((await h.cli("recover")).phase, "attention");
  await h.until((state) => state.worker.ended);
  assert.equal(
    h.submissions().length,
    1,
    "recovery cannot repeatedly alert for the same deadline",
  );
  assertRetained(h, h.read());
});

test("loss of the supplier signal delivers actionable attention and permits explicit recovery", async (t) => {
  const h = await heldFixture(t);
  await h.start();
  rmSync(h.input.condition.signalFile);
  const noticed = await h.until((state) => state.phase === "accepted");
  assert.match(
    noticed.attention.reason,
    /signal is unavailable.*success is unknown/,
  );
  assert.equal(noticed.attention.owner, "consumer-agent");
  assertRetained(h, noticed);
  assert.equal(h.submissions().length, 1);
  h.complete();
  await h.until((state) => state.worker.ended);
  h.signal({ status: "ready", checked: true });
  h.native.nextTurnId = "recovered-work";
  await h.cli("recover");
  const resumed = await h.until(
    (state) => state.accepted?.id === "recovered-work",
  );
  assert.equal(resumed.pending.purpose, "continuation");
  assert.equal(h.submissions().length, 2);
  assertRetained(h, resumed);
  h.complete("recovered-work");
  await h.until((state) => state.phase === "continued" && state.worker.ended);
});

test("an ended CI observer preserves local proof and names managed recovery at its completion boundary", async (t) => {
  const h = await heldCiFixture(t, {
    directoryName: "owned-observer",
    completionBoundary:
      "complete the accepted execution SHA before story closure",
  });
  const advance = heldClock(h);
  const ci = h.input.nextObservation.ci;
  mkdirSync(ci.directory);
  await h.start();
  assert.equal(h.submissions().length, 0);
  const terminal = JSON.stringify({
    status: "stopped",
    coverage: { state: "ended", pendingCi: "unobserved" },
  });
  const resultFile = join(ci.directory, "result.json");
  writeFileSync(resultFile, terminal);
  advance(1100);
  const noticed = await h.until((state) => state.phase === "accepted");
  assert.match(noticed.attention.reason, /CI observation ended/);
  assert.equal(noticed.attention.ci.owner, "ci-coordinator");
  assert.equal(
    noticed.attention.ci.completionBoundary,
    "complete the accepted execution SHA before story closure",
  );
  assert.deepEqual(noticed.attention.ci.recoveryCommand, ci.recoveryCommand);
  assert.equal(noticed.attention.ci.acceptedSha, h.input.execution.revision);
  assert.equal(noticed.attention.ci.receiptOutstanding, true);
  assert.equal(noticed.attention.ci.repo, "owner/project");
  assert.equal(noticed.attention.ci.targetRef, "refs/heads/main");
  assert.match(noticed.pending.text, /fresh yielded stream first/);
  assert.match(noticed.pending.text, /not evidence of.*successful CI/);
  assertRetained(h, noticed);
  assert.equal(
    readFileSync(resultFile, "utf8"),
    terminal,
    "the hold never rearms or rewrites the CI observer",
  );
  h.complete();
  await h.until((state) => state.worker.ended);
  await h.cli("recover");
  await h.until((state) => state.worker.ended);
  assert.equal(h.submissions().length, 1);
  assert.equal(readFileSync(resultFile, "utf8"), terminal);
});

test("an unavailable native route is exposed in the enrollment receipt before yielding", async (t) => {
  const h = await heldFixture(t, (builder) =>
    builder.continuingInCodex(
      "saved-thread",
      "unix:///missing/held-execution.sock",
    ),
  );
  const receipt = await h.start();
  assert.equal(receipt.phase, "attention");
  assert.equal(receipt.attention.delivery, "unavailable");
  assert.match(receipt.attention.reason, /Codex connection closed/);
  assert.match(receipt.attentionRoute.limitation, /resume manually/);
  assert.deepEqual(receipt.attention.recoveryCommand.slice(2, 3), ["recover"]);
  await h.until((state) => state.worker.ended);
  assertRetained(h, h.read());
  assert.equal(h.submissions().length, 0);
});

test("lost native acceptance remains uncertain and its exact recovery never resends", async (t) => {
  const h = await heldFixture(t, (builder) =>
    builder.withObservationDeadline(2000, "owned observation"),
  );
  const advance = heldClock(h);
  await h.start();
  h.native.beforeInput = () => h.native.failConnection();
  advance(2000);
  const uncertain = await h.until(
    (state) => state.phase === "uncertain" && state.worker.ended,
  );
  assert.equal(uncertain.attention.delivery, "uncertain");
  assertRetained(h, uncertain);
  assert.equal(h.submissions().length, 1);
  await assert.rejects(h.cli("recover"), /Reconcile unresolved acceptance/);
  h.native.history.at(-1).status = "completed";
  const result = await h.cli("reconcile");
  assert.equal(result.phase, "attention-delivered");
  assert.equal(h.submissions().length, 1);
  assertRetained(h, result);
});
