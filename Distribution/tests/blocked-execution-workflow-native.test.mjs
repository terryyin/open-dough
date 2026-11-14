import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import {
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { InvoiceNativeObservation } from "./support/blocked-execution-workflow-observation.mjs";
import {
  invoiceSessionReady,
  InvoiceTurnOwnership,
} from "./support/blocked-execution-workflow-ownership.mjs";

test("accepted invoice turn retains cleanup ownership before its session history is ready", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "invoice-native-startup-"));
  const watches = [];
  t.after(() => {
    for (const watcher of watches) watcher.close();
    rmSync(root, { recursive: true, force: true });
  });
  const path = join(root, "future-native-session.jsonl");
  assert.equal(invoiceSessionReady(path, "invoice"), false);
  const future = Object.assign(
    Object.create(InvoiceNativeObservation.prototype),
    {
      threads: new Map(),
      watched: new Set(),
      watches,
    },
  );
  future.trackRollout({ id: "invoice", path });
  writeFileSync(path, '{"type":"session_meta","payload":{"id":"invoice"}}');
  assert.equal(invoiceSessionReady(path, "invoice"), false);
  const calls = [];
  const connection = new EventEmitter();
  connection.request = async (method, params) => {
    calls.push({ method, params });
    assert.equal(
      method,
      "turn/interrupt",
      "cleanup cannot depend on unavailable history",
    );
    connection.emit("notification", {
      method: "turn/completed",
      params: {
        threadId: "invoice",
        turn: { id: "accepted-1", status: "interrupted" },
      },
    });
    return {};
  };
  const ownership = new InvoiceTurnOwnership(root, connection);
  ownership.accepted(
    "invoice",
    { id: "accepted-1", status: "inProgress" },
    "initial assignment",
  );
  assert.equal(
    JSON.parse(readFileSync(join(root, "owned-native-turns.json")))[0].turnId,
    "accepted-1",
  );
  const observation = Object.assign(
    Object.create(InvoiceNativeObservation.prototype),
    {
      root,
      connection,
      ownership,
      workspace: root,
      ancestry: new Map([["invoice", null]]),
      threads: new Map([["invoice", path]]),
      watched: new Set([path]),
      histories: new Map(),
      historyLimits: new Map(),
    },
  );
  assert.equal(
    (await observation.history("invoice")).historyUnavailable,
    "Exact native session metadata is not persisted yet",
  );
  assert.equal(
    calls.length,
    0,
    "early accepted turn causes no unsupported history read",
  );
  const stopped = await ownership.interruptKnown();
  assert.deepEqual(calls, [
    {
      method: "turn/interrupt",
      params: { threadId: "invoice", turnId: "accepted-1" },
    },
  ]);
  assert.equal(stopped[0].params.turn.status, "interrupted");
  const appeared = new Promise((accept) => future.once("change", accept));
  writeFileSync(
    `${path}.next`,
    '{"type":"session_meta","payload":{"id":"invoice"}}\n',
  );
  renameSync(`${path}.next`, path);
  await appeared;
  assert.equal(
    invoiceSessionReady(path, "invoice"),
    true,
    "controlled native persistence enables history",
  );
  connection.request = async (method, params) => {
    assert.equal(method, "thread/read");
    assert.equal(params.threadId, "invoice");
    return {
      thread: {
        id: "invoice",
        cwd: root,
        path,
        turns: [{ id: "accepted-1", status: "interrupted" }],
      },
    };
  };
  assert.equal(
    (await observation.history("invoice")).turns[0].id,
    "accepted-1",
  );
  assert.equal(observation.historyLimits.size, 0);
});

test("invoice cleanup keeps exact terminal evidence across interrupt refusal and continues other turns", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "invoice-native-interrupt-race-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const connection = new EventEmitter(),
    calls = [];
  const ownership = new InvoiceTurnOwnership(root, connection);
  connection.on("notification", (message) =>
    ownership.observed(message.params.threadId, message.params.turn),
  );
  ownership.accepted("parent", { id: "p1", status: "inProgress" });
  ownership.accepted("child", { id: "c1", status: "inProgress" });
  connection.request = async (method, params) => {
    calls.push({ method, params });
    connection.emit("notification", {
      method: "turn/completed",
      params: {
        threadId: params.threadId,
        turn: { id: params.turnId, status: "completed" },
      },
    });
    if (params.threadId === "parent") throw new Error("turn already terminal");
    return {};
  };
  const stopped = await ownership.interruptKnown();
  assert.deepEqual(
    calls.map((call) => call.params.turnId),
    ["p1", "c1"],
  );
  assert.deepEqual(
    stopped.map((event) => event.params.turn.id),
    ["p1", "c1"],
  );
  assert.ok(
    [...ownership.turns.values()].every((turn) => turn.status === "completed"),
  );
});

test("invoice cleanup reports unconfirmed owned identities when accepted interrupt disconnects", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "invoice-native-disconnect-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const connection = new EventEmitter(),
    calls = [];
  const ownership = new InvoiceTurnOwnership(root, connection);
  ownership.accepted("parent", { id: "p1", status: "inProgress" });
  ownership.accepted("child", { id: "c1", status: "inProgress" });
  connection.request = async (method, params) => {
    calls.push({ method, params });
    queueMicrotask(() => connection.emit("disconnect"));
    return {};
  };
  const cleanup = ownership.interruptKnown();
  const result = await Promise.race([
    cleanup.then((value) => ({ kind: "settled", value })),
    new Promise((accept) => setImmediate(() => accept({ kind: "pending" }))),
  ]);
  assert.equal(
    result.kind,
    "settled",
    "disconnect is an observable completion of the wait, not a wall-clock timeout",
  );
  assert.equal(result.value[0].status, "unconfirmed");
  assert.match(result.value[0].reason, /disconnect/i);
  const retained = JSON.parse(
    readFileSync(join(root, "native-cleanup-status.json")),
  );
  assert.equal(retained.status, "unconfirmed");
  assert.deepEqual(
    retained.remaining.map((turn) => turn.turnId),
    ["p1", "c1"],
  );
  assert.match(retained.recovery, /exact.*history/i);
  assert.equal(
    calls.length,
    1,
    "a disconnected route cannot confirm a second interruption",
  );
  assert.ok(
    [...ownership.turns.values()].every((turn) => turn.status === "inProgress"),
  );
});
