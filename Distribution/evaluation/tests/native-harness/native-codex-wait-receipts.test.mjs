// Receipt and ownership validation through the shared saved-session reader.
// Rejected wire facts must also remain unusable to the watch signal consumer.
import assert from "node:assert/strict";
import { test } from "node:test";
import { readCodexSession } from "../../src/native-host-stream.mjs";
import {
  captureWatch,
  watchFields,
} from "../../cases/comparison/supplier-watch/evidence.mjs";
import {
  captureCodexWaitSession as capture,
  codexReceiptRows as outputs,
  replaceCodexReceipt as replaceReceipt,
} from "./support/native-codex-wire-fixture.mjs";

test("current receipt envelopes pair direct and literal waits with owned response re-entry", (t) => {
  const f = capture(t),
    read = readCodexSession(f.file);
  assert.equal(read.handles.length, 1);
  assert.equal(
    read.waits.filter((w) => w.status === "live" && w.empty).length,
    4,
  );
  assert.equal(read.waits[0].launchCallId, "call-0");
  assert.equal(read.waits[0].receiptId, "receipt-1");
  assert.equal(read.waits[0].nextResponseId, "response-2");
  assert.ok(
    read.waits.every(
      (w) => w.turn === "watch" && w.nextResponseOrder > w.receiptOrder,
    ),
  );
});

test("terminal, missing, truncated, stale and printed receipts cannot prove a live empty watch", (t) => {
  for (const change of [
    (rows) =>
      replaceReceipt(rows, 0, { exit_code: 0, output: '{"session_id":41}' }),
    (rows) =>
      replaceReceipt(rows, 0, { output: '{"session_id":41,"output":""}' }),
    (rows) => replaceReceipt(rows, 0, { session_id: 41 }),
    (rows) => replaceReceipt(rows, 1, { exit_code: 0, output: "" }),
    (rows) =>
      replaceReceipt(rows, 1, {
        session_id: 99,
        output: "",
        original_token_count: 0,
      }),
    (rows) => {
      outputs(rows)[0].payload.call_id = "missing-call";
    },
    (rows) => {
      rows.splice(rows.indexOf(outputs(rows)[0]) + 1, 0, {
        type: "session_meta",
        payload: { id: "other" },
      });
    },
  ]) {
    const f = capture(t, change),
      read = readCodexSession(f.file);
    assert.ok(
      read.waits.every((w) => !w.empty),
      JSON.stringify(read.waits),
    );
    assert.notEqual(
      watchFields(captureWatch(f.file, f.observations)).get(
        "turn-2-watch-candidate-signal",
      ),
      "present",
    );
  }
});

test("copied-parent launches cannot lend handles to the receiving thread", (t) => {
  const f = capture(t, (rows) => {
    rows.unshift({
      type: "session_meta",
      payload: {
        id: "child",
        source: { subagent: { thread_spawn: { parent_thread_id: "owner" } } },
      },
    });
    rows.splice(rows.indexOf(outputs(rows)[0]) + 1, 0, {
      type: "event_msg",
      payload: { type: "thread_settings_applied", thread_id: "child" },
    });
    for (const row of rows
      .filter((r) => r.type === "token_usage_record")
      .slice(1))
      row.payload.thread_id = "child";
  });
  const read = readCodexSession(f.file);
  assert.equal(read.thread, "child");
  assert.equal(read.handles.length, 0);
  assert.ok(read.waits.every((w) => w.status === "unknown"));
});

test("unsupported wrappers, duplicated receipts and missing empty-output counters stay unknown", (t) => {
  for (const change of [
    (rows) => {
      const launch = rows.find((row) => row.payload.call_id === "call-0");
      launch.payload.input =
        'text((await tools.exec_command({cmd:"x"})).output);';
    },
    (rows) => {
      rows.splice(
        rows.indexOf(outputs(rows)[0]) + 1,
        0,
        structuredClone(outputs(rows)[0]),
      );
    },
    (rows) => {
      for (let i = 1; i < 5; i++)
        replaceReceipt(rows, i, { session_id: 41, output: "" });
    },
    (rows) => {
      for (const row of rows.filter((r) => r.type === "token_usage_record"))
        row.payload.thread_id = "other";
    },
  ]) {
    const f = capture(t, change);
    assert.equal(
      watchFields(captureWatch(f.file, f.observations)).get(
        "turn-2-watch-candidate-signal",
      ),
      "unknown",
    );
  }
});

test("no repeated response re-entry is invented from several waits in one model response", (t) => {
  const f = capture(t, (rows) => {
    for (const row of rows
      .filter((r) => r.type === "token_usage_record")
      .slice(1, 5))
      row.payload.response_id = "response-1";
  });
  assert.equal(
    watchFields(captureWatch(f.file, f.observations)).get(
      "turn-2-watch-candidate-signal",
    ),
    "absent",
  );
});
