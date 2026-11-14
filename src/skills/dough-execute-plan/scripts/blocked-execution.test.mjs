import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { heldFixture } from "./blocked-execution-test-fixtures.mjs";
import { digestFile } from "./blocked-execution-store.mjs";

test("a held execution observes evidence without idle model requests and continues once", async (t) => {
  const h = await heldFixture(t);
  assert.equal((await h.start()).phase, "held");
  const retained = h.read();
  assert.deepEqual(retained.input, h.input);
  assert.equal(h.partial(), "accepted partial work\n");
  assert.equal(h.submissions().length, 0);

  const unchanged = h.signal({
    status: "paused",
    checked: false,
    notice: "supplier remains paused",
  });
  await h.until((state) => state.observed === unchanged);
  assert.equal(h.submissions().length, 0);
  const unproved = h.signal({ status: "completed", checked: false });
  await h.until((state) => state.observed === unproved);
  assert.equal(
    h.submissions().length,
    0,
    "publication/completion without proof leaves the condition held",
  );

  h.signal({
    status: "ready",
    checked: true,
    notice: "same supplier evidence delivered again",
  });
  const accepted = await h.until((state) => state.phase === "accepted");
  assert.equal(h.submissions().length, 1);
  assert.equal(accepted.accepted.id, "native-turn-id");
  assert.equal(
    h.submissions()[0].params.threadId,
    h.input.continuation.threadId,
  );
  assert.equal(h.submissions()[0].params.model, undefined);
  assert.equal(h.submissions()[0].params.approvalPolicy, undefined);
  assert.deepEqual(
    accepted.input.execution.acceptedProof,
    retained.input.execution.acceptedProof,
  );
  assert.deepEqual(
    accepted.input.execution.outstandingProof,
    retained.input.execution.outstandingProof,
  );
  assert.match(accepted.pending.text, /Reassess this exact retained condition/);
  assert.match(
    accepted.pending.text,
    /grants no scope, model, capacity-purchase or proof-waiver authority/,
  );

  h.signal({ status: "ready", checked: true });
  await h.until((state) => state.signalEvents > accepted.signalEvents);
  assert.equal(
    h.submissions().length,
    1,
    "replay went through the live handler without another submission",
  );
  assert.equal(h.native.history.length, 2);
  h.complete();
  const continued = await h.until(
    (state) => state.phase === "continued" && state.worker.ended,
  );
  assert.equal(continued.accepted.status, "completed");
  assert.equal((await h.start()).alreadyEnrolled, true);
  assert.equal(h.submissions().length, 1);
  assert.equal(h.partial(), "accepted partial work\n");
});

test("an insufficient-evidence continuation rearms its same live owner without a duplicate writer", async (t) => {
  const h = await heldFixture(t);
  await h.start();
  h.signal({ status: "ready", checked: true });
  const first = await h.until((state) => state.phase === "accepted");
  // The native consumer's semantic reassessment rejects this outcome and saves
  // the current observation before returning to its held state.
  h.input.condition.description =
    "supplier result must also cover the consumer's recorded contract";
  h.input.condition.check.push("require-contract");
  h.input.condition.observed = digestFile(h.input.condition.signalFile);
  writeFileSync(h.inputFile, JSON.stringify(h.input));
  const rearmed = await h.cli("rearm", ["--input-file", h.inputFile]);
  assert.equal(rearmed.phase, "held");
  assert.equal(rearmed.worker.pid, first.worker.pid);
  assert.equal(h.read().history.length, 1);
  h.complete();
  const sameOutcome = h.signal({
    status: "ready",
    checked: true,
    notice: "same rejected outcome",
  });
  await h.until((state) => state.observed === sameOutcome);
  assert.equal(h.read().phase, "held");
  assert.equal(
    h.submissions().length,
    1,
    "unchanged rejected evidence cannot cause a recurring model request",
  );
  assert.deepEqual(h.read().input.execution, first.input.execution);
});

test("a running verification cannot be enrolled as a supplier hold", async (t) => {
  const h = await heldFixture(t);
  h.input.condition.kind = "verification";
  await assert.rejects(
    h.start(),
    /running verification retains its existing owner/,
  );
});

test("changed authority or native settings withholds automatic continuation", async (t) => {
  for (const change of ["authority", "settings"])
    await t.test(change, async (t) => {
      const h = await heldFixture(t);
      await h.start();
      if (change === "authority")
        writeFileSync(join(h.workspace, "authority.txt"), "different owner\n");
      else h.native.effectiveModel = "changed-native-model";
      h.signal({ status: "ready", checked: true });
      const stopped = await h.until(
        (state) => state.phase === "attention" && state.worker.ended,
      );
      assert.equal(h.submissions().length, 0);
      assert.equal(stopped.attention.owner, "consumer-agent");
      assert.match(
        stopped.attention.reason,
        change === "authority"
          ? /authority\/owner evidence changed/
          : /Native configuration changed/,
      );
      assert.equal(h.partial(), "accepted partial work\n");
    });
});
