import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { digestFile, execute } from "./blocked-execution-store.mjs";
import { heldFixture } from "./blocked-execution-test-fixtures.mjs";
import { heldClock } from "./blocked-execution-attention-test-fixtures.mjs";

for (const host of ["claude", "cursor"]) {
  test(`${host} retains an observed usage limit and exposes missing reset evidence before yielding`, async (t) => {
    let resume;
    const h = await heldFixture(t, (builder, { root }) => {
      // Project-owned executable substitute: this tests fallback retention,
      // not either host's native continuation CLI.
      resume = [
        process.execPath,
        join(root, "manual-recovery.mjs"),
        "consumer-agent",
        "retained-usage-session",
      ];
      return builder
        .waitingForUsage({
          description: "the recorded model usage hold is observably released",
          notice: "observed host error: rate_limit; no reset timestamp",
        })
        .continuingManuallyIn(host, "retained-usage-session", resume);
    });
    writeFileSync(
      resume[1],
      "process.stdout.write(JSON.stringify({fixture:true,owner:process.argv[2],session:process.argv[3]}));\n",
    );
    const advance = heldClock(h);
    const receipt = await h.start();
    assert.equal(receipt.phase, "attention");
    assert.equal(receipt.worker.ended, true);
    assert.equal(receipt.attentionRoute.kind, "manual");
    assert.match(receipt.attention.reason, /no verified live delivery binding/);
    assert.match(
      receipt.attention.reason,
      /usage-reset evidence is unavailable/,
    );
    assert.equal(receipt.attention.owner, "consumer-agent");
    assert.deepEqual(receipt.attention.recoveryCommand, resume);
    const [command, ...args] = receipt.attention.recoveryCommand;
    assert.deepEqual(JSON.parse((await execute(command, args)).stdout), {
      fixture: true,
      owner: "consumer-agent",
      session: "retained-usage-session",
    });
    assert.equal(
      receipt.attention.known.condition.notice,
      "observed host error: rate_limit; no reset timestamp",
    );
    assert.deepEqual(receipt.input.execution, h.input.execution);
    assert.deepEqual(receipt.attention.proof, [
      "consumer integration and applicable CI receipt",
    ]);
    advance(6 * 60 * 60 * 1000);
    assert.equal((await h.start()).alreadyEnrolled, true);
    assert.equal((await h.cli("recover")).phase, "attention");
    assert.equal(
      h.submissions().length,
      0,
      "elapsed hours never establish reset or new authority",
    );
    assert.equal(h.partial(), "accepted partial work\n");
  });
}

test("a usage hold without reset evidence reaches an available retained owner", async (t) => {
  const h = await heldFixture(t, (builder) =>
    builder.waitingForUsage({
      description: "an evidenced release of this exact usage hold",
      notice: "observed host limit",
    }),
  );
  await h.start();
  const noticed = await h.until((state) => state.phase === "accepted");
  assert.match(
    noticed.attention.reason,
    /Reliable observed usage-reset evidence is unavailable/,
  );
  assert.match(
    noticed.pending.text,
    /capacity purchase establishes neither reset nor authority/,
  );
  assert.equal(h.submissions().length, 1);
  h.complete();
  await h.until(
    (state) => state.phase === "attention-delivered" && state.worker.ended,
  );
});

test("fixture reset evidence permits reassessment under the same authority, without proving a real host signal", async (t) => {
  const h = await heldFixture(t, (builder, { signalFile, checker }) =>
    builder.waitingForUsage({
      description: "fixture host reports this same usage hold released",
      notice: "fixture observed usage limit",
      signalFile,
      observed: digestFile(signalFile),
      check: [process.execPath, checker, signalFile],
    }),
  );
  await h.start();
  const retained = h.read();
  assert.equal(h.submissions().length, 0);
  const notReset = h.signal({
    status: "paused",
    checked: false,
    hoursElapsed: 6,
    offeredModel: "another-model",
    offeredPurchase: true,
  });
  await h.until((state) => state.observed === notReset);
  assert.equal(h.submissions().length, 0);
  h.signal({
    status: "ready",
    checked: true,
    evidence: "fixture observed current reset",
  });
  const accepted = await h.until((state) => state.phase === "accepted");
  assert.equal(accepted.pending.purpose, "continuation");
  assert.equal(h.submissions().length, 1);
  assert.deepEqual(accepted.input.execution, retained.input.execution);
  assert.equal(h.submissions()[0].params.model, undefined);
  assert.match(
    accepted.pending.text,
    /grants no scope, model, capacity-purchase or proof-waiver authority/,
  );
  h.complete();
  await h.until((state) => state.worker.ended);
});
