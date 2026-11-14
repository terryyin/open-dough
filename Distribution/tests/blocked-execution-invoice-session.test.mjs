import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { retainFinalInvoiceSessions } from "./support/blocked-execution-invoice-history.mjs";

test("invoice final evidence reuses saved settings on only the exact private owned records", (t) => {
  const root = mkdtempSync(join(tmpdir(), "invoice-final-session-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const sessions = join(root, "sessions"),
    results = join(root, "results");
  mkdirSync(sessions);
  mkdirSync(results);
  // Exact saved native wire records exercise the new reader boundary.
  const record = (time, id, parent) => {
    const path = join(sessions, `rollout-2026-11-14T${time}-${id}.jsonl`);
    const source = parent
      ? { subagent: { thread_spawn: { parent_thread_id: parent } } }
      : "appServer";
    const lines = [
      {
        type: "session_meta",
        payload: {
          id,
          cli_version: "0.169.0",
          originator: "codex_app_server",
          source,
          account_id: "private-account-marker",
        },
      },
      {
        type: "turn_context",
        payload: {
          turn_id: `${id}-turn`,
          model: "gpt-6.1-sol",
          effort: "xhigh",
          sandbox_policy: { type: "danger-full-access" },
          approval_policy: "never",
          cwd: "/invoice",
        },
      },
      {
        type: "response_item",
        payload: { type: "reasoning", text: "private-reasoning-marker" },
      },
    ];
    writeFileSync(
      path,
      `${lines.map((line) => JSON.stringify(line)).join("\n")}\n`,
    );
    return path;
  };
  const parent = record("10-00-00", "parent", null);
  const child = record("10-01-00", "child", "parent");
  record("10-02-00", "unadmitted", "parent");
  const observation = {
    ancestry: new Map([
      ["parent", null],
      ["child", "parent"],
    ]),
    threads: new Map([
      ["parent", parent],
      ["child", child],
    ]),
    histories: new Map([
      ["parent", { turns: [] }],
      ["child", { turns: [] }],
    ]),
    ownership: {
      turns: new Map([
        ["parent:turn", { threadId: "parent", status: "completed" }],
        ["child:turn", { threadId: "child", status: "completed" }],
      ]),
    },
  };

  const evidence = retainFinalInvoiceSessions(observation, "parent", results);

  assert.equal(evidence.reader, "native-codex-session.mjs");
  assert.equal(evidence.workerAncestryMatches, true);
  assert.deepEqual(evidence.threads[0].workers, [
    { thread: "child", parent: "parent" },
  ]);
  assert.deepEqual(evidence.threads[0].settings, [
    [
      "model=gpt-6.1-sol effort=xhigh sandbox=danger-full-access approval=never cwd=/invoice",
      1,
    ],
  ]);
  assert.equal(evidence.recordHashes.length, 2);
  assert.ok(
    evidence.recordHashes.every(({ sha256 }) => /^[a-f0-9]{64}$/.test(sha256)),
  );
  assert.doesNotMatch(
    JSON.stringify(evidence),
    /private-account-marker|private-reasoning-marker|unadmitted/,
  );
  assert.deepEqual(
    readFileSync(
      join(results, "private-native-records", parent.split("/").at(-1)),
    ),
    readFileSync(parent),
  );
  observation.ownership.turns.get("child:turn").status = "inProgress";
  const activeResults = join(root, "active-results");
  assert.throws(
    () => retainFinalInvoiceSessions(observation, "parent", activeResults),
    /must be terminal/,
  );
  assert.equal(
    existsSync(activeResults),
    false,
    "live records are never copied or passed to the final-only reader",
  );
});
