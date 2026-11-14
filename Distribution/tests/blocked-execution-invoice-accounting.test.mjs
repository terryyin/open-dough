import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { EventEmitter } from "node:events";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { InvoiceNativeObservation } from "./support/blocked-execution-workflow-observation.mjs";
import { responseAccounting } from "./support/blocked-execution-invoice-accounting.mjs";
import { InvoiceTurnOwnership } from "./support/blocked-execution-workflow-ownership.mjs";

test("invoice native accounting counts each own response once and refuses missing evidence", () => {
  // Exact native wire records are the counterexample, not a domain fixture.
  const own =
    '{"type":"token_usage_record","payload":{"thread_id":"invoice","response_id":"r1","usage":{"input_tokens":40,"output_tokens":3,"total_tokens":43}}}';
  const foreign =
    '{"type":"token_usage_record","payload":{"thread_id":"ancestor","response_id":"r0","usage":{"input_tokens":900,"output_tokens":90,"total_tokens":990}}}';
  const cumulative =
    '{"type":"event_msg","payload":{"type":"token_count","info":{"total_token_usage":{"total_tokens":9999}}}}';
  const second =
    '{"type":"token_usage_record","payload":{"thread_id":"invoice","response_id":"r2","usage":{"input_tokens":20,"output_tokens":2,"total_tokens":22}}}';
  const actual = responseAccounting(
    [own, foreign, cumulative, own, second].join("\n"),
    "invoice",
  );
  assert.equal(actual.requests, 2);
  assert.deepEqual(actual.usage, {
    input_tokens: 60,
    output_tokens: 5,
    total_tokens: 65,
  });
  assert.equal(responseAccounting(foreign, "invoice").available, false);
  assert.equal(responseAccounting("", "invoice").requests, null);
  const partial = responseAccounting(`${own}\n{"type":"token_usage`, "invoice");
  assert.equal(partial.requests, 1);
  assert.equal(partial.partialLastRecord, true);
  assert.throws(
    () => responseAccounting(`${own}\n{"broken"\n`, "invoice"),
    SyntaxError,
  );
});

test("invoice aggregate remains unknown until every admitted descendant has own usage", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "invoice-native-accounting-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const parent = join(root, "parent.jsonl"),
    child = join(root, "child.jsonl");
  writeFileSync(
    parent,
    '{"type":"token_usage_record","payload":{"thread_id":"parent","response_id":"p1","usage":{"total_tokens":43,"output_tokens":3}}}\n',
  );
  const observation = Object.assign(
    Object.create(InvoiceNativeObservation.prototype),
    {
      root,
      ancestry: new Map([
        ["parent", null],
        ["child", "parent"],
      ]),
      threads: new Map([["parent", parent]]),
      historyLimits: new Map(),
      limits: { tokens: 1000, output: 1000 },
    },
  );
  const missingPath = await observation.accounting();
  assert.equal(missingPath.complete, false);
  assert.equal(missingPath.requests, null);
  assert.equal(
    missingPath.observedTotalTokens,
    43,
    "known parent usage is a lower bound",
  );
  assert.equal(missingPath.threads.child.available, false);
  observation.threads.set("child", child);
  writeFileSync(child, '{"type":"session_meta","payload":{"id":"child"}}\n');
  assert.equal(
    (await observation.accounting()).requests,
    null,
    "a path alone supplies no request counter",
  );
  writeFileSync(
    child,
    '{"type":"token_usage_record","payload":{"thread_id":"child","response_id":"c1","usage":{"total_tokens":32,"output_tokens":2}}}\n',
  );
  const complete = await observation.accounting();
  assert.equal(complete.complete, true);
  assert.equal(complete.requests, 2);
  assert.equal(complete.observedTotalTokens, 75);
});

test("invoice history notices cannot wake another history query while own terminal can", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "invoice-native-notices-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const ownership = new InvoiceTurnOwnership(root, new EventEmitter());
  const observation = Object.assign(
    Object.create(InvoiceNativeObservation.prototype),
    {
      root,
      events: [],
      ancestry: new Map([["parent", null]]),
      ownership,
      noticeCounts: new Map(),
    },
  );
  let queries = 0;
  observation.history = async () => {
    queries++;
    if (queries <= 2)
      observation.handleNotification({
        method: "deprecationNotice",
        params: { summary: "Full-history hydration is deprecated" },
      });
  };
  const pending = observation.until(async () => {
    await observation.history();
    return observation.completed("parent", "p1");
  });
  await new Promise((accept) => setImmediate(accept));
  assert.equal(
    queries,
    1,
    "a notice returned by a history read is not more execution progress",
  );
  observation.handleNotification({
    method: "account/rateLimits/updated",
    params: { rateLimits: {} },
  });
  assert.equal(
    existsSync(join(root, "native-events.jsonl")),
    false,
    "global notices do not grow the native event stream",
  );
  observation.handleNotification({
    method: "turn/started",
    params: { threadId: "child", turn: { id: "c1", status: "inProgress" } },
  });
  await new Promise((accept) => setImmediate(accept));
  assert.equal(
    queries,
    1,
    "unadmitted child evidence is retained without waking current waiters",
  );
  observation.admitThread("child", "parent");
  assert.equal(ownership.turns.get("child:c1").status, "inProgress");
  observation.handleNotification({
    method: "turn/completed",
    params: { threadId: "parent", turn: { id: "p1", status: "completed" } },
  });
  assert.equal(await pending, true);
  assert.equal(queries, 2);
  assert.equal(observation.noticeCounts.get("deprecationNotice"), 2);
  assert.equal(observation.noticeCounts.get("account/rateLimits/updated"), 1);
  observation.handleNotification({
    method: "error",
    params: { error: "native failure" },
  });
  assert.match(observation.failure.message, /native failure/);
});
