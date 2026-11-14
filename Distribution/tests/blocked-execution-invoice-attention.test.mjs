import test from "node:test";
import assert from "node:assert/strict";
import { makeMe } from "./support/makeMe.mjs";
import { completedInvoiceAttention } from "./support/blocked-execution-invoice-history.mjs";

test("invoice attention completion follows its archived acceptance after native owner rearm", () => {
  const input = makeMe.aHeldExecution
    .continuingInCodex("invoice", "unix:///tmp/invoice.sock")
    .please();
  // Exact retained-generation and native completion shapes are under proof.
  const acceptance = {
    generation: "original",
    phase: "accepted",
    pending: { purpose: "attention", marker: "attention-marker" },
    accepted: { id: "attention-turn", status: "inProgress" },
  };
  const record = {
    input,
    generation: "rearmed",
    phase: "attention",
    accepted: null,
    pending: null,
    worker: { ended: true },
    attention: {
      recoveryCommand: ["node", "blocked-execution.mjs", "recover"],
    },
    history: [acceptance],
  };
  const completion = {
    method: "turn/completed",
    params: {
      threadId: "invoice",
      turn: { id: "attention-turn", status: "completed" },
    },
  };
  const observation = {
    ancestry: new Map([["invoice", null]]),
    events: [completion],
    histories: new Map(),
  };

  const observed = completedInvoiceAttention(observation, record, "invoice");

  assert.deepEqual(observed?.observedAttention, {
    generation: "original",
    threadId: "invoice",
    turnId: "attention-turn",
    status: "completed",
  });
  assert.equal(
    observed.accepted,
    null,
    "archived acceptance is not invented in the current generation",
  );
  assert.deepEqual(
    observed.attention.recoveryCommand,
    record.attention.recoveryCommand,
  );
  assert.equal(
    record.generation,
    "rearmed",
    "observation never rewrites the hold",
  );
  for (const invalid of [
    { ...completion, params: { ...completion.params, threadId: "foreign" } },
    {
      ...completion,
      params: {
        ...completion.params,
        turn: { id: "wrong-turn", status: "completed" },
      },
    },
    {
      ...completion,
      params: {
        ...completion.params,
        turn: { id: "attention-turn", status: "failed" },
      },
    },
  ]) {
    observation.events = [invalid];
    assert.equal(
      completedInvoiceAttention(observation, record, "invoice"),
      undefined,
    );
  }
  observation.events = [];
  observation.histories.set("invoice", {
    id: "invoice",
    turns: [completion.params.turn],
  });
  assert.equal(
    completedInvoiceAttention(observation, record, "invoice")?.observedAttention
      .status,
    "completed",
  );
  observation.histories.clear();
  observation.events = [completion];
  assert.equal(
    completedInvoiceAttention(
      observation,
      {
        ...record,
        history: [{ ...acceptance, pending: { purpose: "continuation" } }],
      },
      "invoice",
    ),
    undefined,
  );
  assert.equal(
    completedInvoiceAttention(
      observation,
      { ...record, worker: { ended: false } },
      "invoice",
    ),
    undefined,
  );
  const direct = {
    ...record,
    ...acceptance,
    phase: "attention-delivered",
    accepted: { id: "attention-turn", status: "completed" },
    history: [],
  };
  assert.equal(
    completedInvoiceAttention(observation, direct, "invoice")?.observedAttention
      .turnId,
    "attention-turn",
  );
});
