// The Codex session-record reader (native-codex-session.mjs): the settings a
// thread's turns applied and the worker sessions it spawned, directly or
// through its workers, among records Codex keeps under one sessions root.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { codexSessionSettings } from "./native-codex-session.mjs";

// Writes a record for `id` started at `time` on 2026-11-14, spawned by
// `parent` when given, with one turn_context line per setting.
function record(root, time, id, parent, settings = []) {
  const day = join(root, "2026", "11", "14");
  mkdirSync(day, { recursive: true });
  const source = parent
    ? { subagent: { thread_spawn: { parent_thread_id: parent, depth: 1 } } }
    : "exec";
  const lines = [
    {
      type: "session_meta",
      payload: { id, cli_version: "0.169.0", originator: "codex_exec", source },
    },
    ...settings.map((setting, turn) => ({
      type: "turn_context",
      payload: { turn_id: `t${turn}`, approval_policy: "never", ...setting },
    })),
  ];
  const file = join(day, `rollout-2026-11-14T${time}-${id}.jsonl`);
  writeFileSync(
    file,
    lines.map((line) => `${JSON.stringify(line)}\n`).join(""),
  );
  return file;
}

test("a thread's turn settings and the workers it spawned come from its records", (t) => {
  const root = mkdtempSync(join(tmpdir(), "codex-sessions-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const turn = {
    model: "gpt-6.1-sol",
    effort: "xhigh",
    sandbox_policy: { type: "danger-full-access" },
    cwd: "/arm/workspace",
  };
  const coordinator = record(root, "10-00-00", "coordinator", null, [
    turn,
    turn,
  ]);
  const worker = record(root, "10-05-00", "worker", "coordinator");
  const nested = record(root, "10-06-00", "nested", "worker");
  record(root, "10-07-00", "elsewhere", "another-coordinator");
  // A session started before the thread cannot be one of its workers.
  record(root, "09-00-00", "earlier", "coordinator");

  const read = codexSessionSettings("coordinator", root);

  assert.equal(read.file, coordinator);
  assert.equal(read.version, "0.169.0");
  assert.deepEqual(read.settings, [
    [
      "model=gpt-6.1-sol effort=xhigh sandbox=danger-full-access approval=never cwd=/arm/workspace",
      2,
    ],
  ]);
  assert.deepEqual(read.workers, [
    { thread: "worker", parent: "coordinator", file: worker },
    { thread: "nested", parent: "worker", file: nested },
  ]);
  assert.equal(codexSessionSettings("absent", root), null);
});
