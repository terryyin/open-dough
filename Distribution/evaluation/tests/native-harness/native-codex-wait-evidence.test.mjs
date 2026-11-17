// Case evidence projection: exposure windows and retained compact replay.
// Native wire facts come from the same corpus as the receipt decoder proof.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { archiveObservationText } from "../../src/native-comparison-archive-evidence.mjs";
import {
  captureWatch,
  watchFields,
} from "../../cases/guidance-checks/supplier-watch/evidence.mjs";
import {
  captureCodexWaitSession as capture,
  codexReceiptRows as outputs,
  addSecondCodexWatch,
} from "./support/native-codex-wire-fixture.mjs";

test("compact watch evidence overrides unsupported scalar claims after JSON round-trip", (t) => {
  const f = capture(t),
    evidence = captureWatch(f.file, f.observations);
  const fields = watchFields(evidence);
  assert.equal(fields.get("turn-2-watch-candidate-signal"), "present");
  assert.equal(
    fields.get("turn-2-window-1-candidate-confirmed-live-ms"),
    "4000",
  );
  assert.equal(fields.get("turn-2-window-1-responses"), "6");
  assert.equal(fields.get("turn-2-window-2-responses"), "0");
  const archive = JSON.parse(
    JSON.stringify({
      observations: {
        "turn-2-watch-candidate-signal": "invented",
        "turn-2-window-1-responses": "999",
      },
      evidence: { turns: [], supplierWatch: evidence },
    }),
  );
  const replay = archiveObservationText(archive);
  assert.match(replay, /^turn-2-watch-candidate-signal: present$/m);
  assert.match(replay, /^turn-2-window-1-responses: 6$/m);
  assert.doesNotMatch(
    JSON.stringify(evidence),
    /supplier-publication-watch|\/workspace|response-1|call-0/,
  );
});

test("missing or truncated saved records leave exposure and signal unknown", (t) => {
  const f = capture(t);
  for (const file of [join(f.file, "missing"), f.file]) {
    if (file === f.file) writeFileSync(file, '{"type":');
    const fields = watchFields(captureWatch(file, f.observations));
    assert.equal(fields.get("turn-2-watch-exposure"), "unknown");
    assert.equal(fields.get("turn-2-watch-candidate-signal"), "unknown");
  }
});

test("publication work is excluded from unchanged receipts and following responses", (t) => {
  const f = capture(t);
  f.observations.set("turn-2-publication-1-begin-ms", "4500");
  f.observations.set("turn-2-publication-1-ms", "6500");
  f.observations.set("turn-2-publication-2-begin-ms", "8000");
  f.observations.set("turn-2-publication-2-ms", "10000");
  const fields = watchFields(captureWatch(f.file, f.observations));
  // Only one wait/response pair finishes before release begins. The second
  // straddles publication, and later receipts are inside publication work.
  assert.equal(fields.get("turn-2-watch-candidate-signal"), "absent");
  assert.equal(fields.get("turn-2-window-1-responses"), "3");
  assert.equal(fields.get("turn-2-window-2-responses"), "1");
  assert.equal(
    fields.get("turn-2-window-1-candidate-confirmed-live-ms"),
    "2400",
  );
});

test("missing or invalid publication bounds cannot turn an otherwise positive signal into evidence", (t) => {
  for (const [field, value] of [
    ["turn-2-publication-1-begin-ms", null],
    ["turn-2-publication-2-begin-ms", null],
    ["turn-2-publication-1-begin-ms", "not-a-time"],
    ["turn-2-publication-1-ms", "19500"],
    ["turn-2-publication-2-ms", "18000"],
  ]) {
    const f = capture(t);
    if (value === null) f.observations.delete(field);
    else f.observations.set(field, value);
    const fields = watchFields(captureWatch(f.file, f.observations));
    assert.equal(fields.get("turn-2-watch-candidate-signal"), "unknown");
    assert.equal(fields.get("turn-2-window-1-responses"), "unknown");
    assert.equal(fields.get("turn-2-watch-exposure"), "unknown");
  }
});

test("two handles launched in one wrapper keep separate live spans and terminal bounds", (t) => {
  const f = capture(t, (rows) => {
    addSecondCodexWatch(rows, [2, 3, 4]);
    const usage = structuredClone(
      rows.find((r) => r.type === "token_usage_record"),
    );
    usage.timestamp = new Date(3301).toISOString();
    usage.payload.response_id = "closing-response";
    rows.splice(
      rows.indexOf(outputs(rows)[1]) + 1,
      0,
      {
        type: "response_item",
        timestamp: new Date(3300).toISOString(),
        payload: {
          type: "function_call",
          name: "functions.write_stdin",
          call_id: "close-41",
          arguments: JSON.stringify({ session_id: 41, chars: "" }),
        },
      },
      usage,
      {
        type: "response_item",
        timestamp: new Date(3400).toISOString(),
        payload: {
          type: "function_call_output",
          call_id: "close-41",
          id: "receipt-close-41",
          output: [
            {
              type: "input_text",
              text: JSON.stringify({ exit_code: 0, output: "" }),
            },
          ],
        },
      },
    );
  });
  const evidence = captureWatch(f.file, f.observations);
  const ended = evidence.handles.find((h) => h.endReceiptMs !== null);
  const active = evidence.handles.find((h) => h.endReceiptMs === null);
  assert.equal(ended.lastLiveMs - ended.launchMs, 1000);
  assert.equal(ended.endReceiptMs, 3400);
  assert.equal(active.lastLiveMs - active.launchMs, 4000);
});

test("two empty waits on one live handle with distinct owned responses show repeated activity", (t) => {
  const f = capture(t, undefined, { waits: 2 });
  const evidence = captureWatch(f.file, f.observations);
  assert.equal(
    watchFields(evidence).get("turn-2-watch-candidate-signal"),
    "present",
  );
  const archive = JSON.parse(
    JSON.stringify({
      observations: {},
      evidence: { turns: [], supplierWatch: evidence },
    }),
  );
  assert.match(
    archiveObservationText(archive),
    /^turn-2-watch-candidate-signal: present$/m,
  );
});

test("one bounded liveness check does not show repeated activity", (t) => {
  const f = capture(t, undefined, { waits: 1 });
  assert.equal(
    watchFields(captureWatch(f.file, f.observations)).get(
      "turn-2-watch-candidate-signal",
    ),
    "absent",
  );
});

test("one empty wait on each of two live handles cannot be pooled into repetition", (t) => {
  const f = capture(t, (rows) => addSecondCodexWatch(rows, [2]), { waits: 2 });
  assert.equal(
    watchFields(captureWatch(f.file, f.observations)).get(
      "turn-2-watch-candidate-signal",
    ),
    "absent",
  );
});
