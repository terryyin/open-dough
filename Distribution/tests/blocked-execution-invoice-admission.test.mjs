import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { InvoiceNativeObservation } from "./support/blocked-execution-workflow-observation.mjs";
import { InvoiceTurnOwnership } from "./support/blocked-execution-workflow-ownership.mjs";

test("invoice child admission replays earlier exact turn events and keeps unknown ownership explicit", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "invoice-native-admission-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const connection = new EventEmitter();
  const ownership = new InvoiceTurnOwnership(root, connection);
  ownership.observed("parent", { id: "p1", status: "completed" });
  const events = [
    {
      method: "turn/started",
      params: { threadId: "child", turn: { id: "c0", status: "inProgress" } },
    },
    {
      method: "turn/completed",
      params: { threadId: "child", turn: { id: "c0", status: "completed" } },
    },
    {
      method: "turn/started",
      params: { threadId: "child", turn: { id: "c1", status: "inProgress" } },
    },
    {
      method: "turn/started",
      params: {
        threadId: "unrelated",
        turn: { id: "foreign", status: "inProgress" },
      },
    },
  ];
  const observation = Object.assign(
    Object.create(InvoiceNativeObservation.prototype),
    {
      ancestry: new Map([["parent", null]]),
      events,
      ownership,
    },
  );
  observation.admitThread("child", "parent");
  assert.equal(ownership.turns.get("child:c0")?.status, "completed");
  assert.equal(ownership.turns.get("child:c1")?.status, "inProgress");
  assert.equal(ownership.turns.has("unrelated:foreign"), false);
  connection.request = async (method, params) => {
    assert.equal(method, "turn/interrupt");
    assert.equal(params.turnId, "c1");
    connection.emit("notification", {
      method: "turn/completed",
      params: { threadId: "child", turn: { id: "c1", status: "interrupted" } },
    });
    return {};
  };
  await ownership.interruptKnown(["parent", "child", "pending-child"]);
  const result = JSON.parse(
    readFileSync(join(root, "native-cleanup-status.json")),
  );
  assert.equal(result.status, "unconfirmed");
  assert.deepEqual(result.unknownThreads, ["pending-child"]);
  assert.equal(
    result.remaining.length,
    0,
    "confirmed known terminals cannot settle unknown admitted ownership",
  );
});

test("invoice admission recursively replays retained exact child spawn evidence before history is available", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "invoice-native-grandchild-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const connection = new EventEmitter(),
    calls = [];
  const ownership = new InvoiceTurnOwnership(root, connection);
  ownership.observed("parent", { id: "p1", status: "completed" });
  const events = [
    {
      method: "item/completed",
      params: {
        threadId: "child",
        item: {
          type: "collabAgentToolCall",
          tool: "spawnAgent",
          senderThreadId: "child",
          receiverThreadIds: ["grandchild"],
        },
      },
    },
    {
      method: "turn/started",
      params: {
        threadId: "grandchild",
        turn: { id: "g1", status: "inProgress" },
      },
    },
    {
      method: "turn/completed",
      params: { threadId: "child", turn: { id: "c1", status: "completed" } },
    },
    {
      method: "item/completed",
      params: {
        threadId: "unrelated",
        item: {
          type: "collabAgentToolCall",
          tool: "spawnAgent",
          senderThreadId: "child",
          receiverThreadIds: ["foreign-event"],
        },
      },
    },
    {
      method: "item/completed",
      params: {
        threadId: "child",
        item: {
          type: "collabAgentToolCall",
          tool: "spawnAgent",
          senderThreadId: "parent",
          receiverThreadIds: ["copied-ancestor"],
        },
      },
    },
  ];
  const observation = Object.assign(
    Object.create(InvoiceNativeObservation.prototype),
    {
      root,
      ancestry: new Map([["parent", null]]),
      events,
      ownership,
      threads: new Map(),
      historyLimits: new Map(),
      limits: { tokens: 1000, output: 1000 },
    },
  );
  observation.admitThread("child", "parent");
  assert.equal(observation.ancestry.get("grandchild"), "child");
  assert.equal(ownership.turns.get("grandchild:g1")?.status, "inProgress");
  assert.equal(ownership.turns.get("child:c1")?.status, "completed");
  observation.admitThread("child", "parent");
  assert.deepEqual(
    [...observation.ancestry],
    [
      ["parent", null],
      ["child", "parent"],
      ["grandchild", "child"],
    ],
  );
  const accounting = await observation.accounting();
  assert.equal(accounting.requests, null);
  assert.equal(
    accounting.threads.grandchild.available,
    false,
    "missing descendant usage remains visible",
  );
  connection.request = async (method, params) => {
    assert.equal(method, "turn/interrupt");
    calls.push(params);
    connection.emit("notification", {
      method: "turn/completed",
      params: {
        threadId: "grandchild",
        turn: { id: "g1", status: "interrupted" },
      },
    });
    return {};
  };
  await ownership.interruptKnown(observation.ancestry.keys());
  assert.deepEqual(calls, [{ threadId: "grandchild", turnId: "g1" }]);
  const cleanup = JSON.parse(
    readFileSync(join(root, "native-cleanup-status.json")),
  );
  assert.equal(cleanup.status, "confirmed-terminal");
  assert.deepEqual(cleanup.unknownThreads, []);
});
