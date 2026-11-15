import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { retainedUsage } from "../../evaluation/src/native-comparison-archive-usage.mjs";
import { readCodexSession } from "../../evaluation/src/native-host-stream.mjs";

const row = (type, payload) => ({ type, payload });
const started = (turn) =>
  row("event_msg", { type: "task_started", turn_id: turn });
const completed = (turn) =>
  row("event_msg", { type: "task_complete", turn_id: turn });
const response = (thread, turn, id, usage) =>
  row("token_usage_record", {
    thread_id: thread,
    turn_id: turn,
    root_turn_id: "root-turn",
    response_id: id,
    usage,
  });

// Exact native wire ordering under proof: the fork's own metadata precedes
// copied parent metadata/history; its settings event resumes the child record.
function capture(t, { unfinished = false, missingCounter = false } = {}) {
  const directory = mkdtempSync(join(tmpdir(), "fork-usage-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const save = (name, records) => {
    const file = join(directory, name);
    writeFileSync(file, `${records.map(JSON.stringify).join("\n")}\n`);
    return file;
  };
  const parent = [
    row("session_meta", { id: "coordinator", source: "exec" }),
    started("root-turn"),
    row("turn_context", { turn_id: "root-turn", cwd: "/workspace" }),
    response("coordinator", "root-turn", "root-response", {
      input_tokens: 20,
      cached_input_tokens: 10,
      output_tokens: 3,
      total_tokens: 23,
    }),
  ];
  save("codex-session.jsonl", [...parent, completed("root-turn")]);
  const ownUsage = {
    input_tokens: 7,
    cached_input_tokens: 4,
    output_tokens: 2,
    total_tokens: 9,
  };
  if (missingCounter) delete ownUsage.output_tokens;
  const worker = save("codex-worker-child.jsonl", [
    row("session_meta", {
      id: "child",
      source: {
        subagent: { thread_spawn: { parent_thread_id: "coordinator" } },
      },
    }),
    ...parent,
    row("event_msg", { type: "turn_aborted", turn_id: "root-turn" }),
    row("event_msg", {
      type: "thread_settings_applied",
      thread_id: "child",
    }),
    started("child-turn"),
    row("turn_context", { turn_id: "child-turn", cwd: "/workspace" }),
    response("child", "child-turn", "child-response", ownUsage),
    ...(unfinished ? [] : [completed("child-turn")]),
  ]);
  return { directory, worker };
}

test("fork accounting owns the child lifecycle and counts copied parent responses only once", (t) => {
  const f = capture(t);

  const usage = retainedUsage(f.directory, "coordinator", 1);

  assert.equal(usage.status, "complete");
  assert.deepEqual(usage.totals, {
    input_tokens: 27,
    cached_input_tokens: 14,
    output_tokens: 5,
    total_tokens: 32,
  });
  assert.equal(usage.responses.length, 2);
  const worker = readCodexSession(f.worker);
  assert.equal(worker.thread, "child");
  assert.equal(worker.parentThread, "coordinator");
  assert.deepEqual(worker.startedTurns, ["child-turn"]);
  assert.deepEqual(worker.completedTurns, ["child-turn"]);
  assert.deepEqual(
    worker.contexts.map(({ turn }) => turn),
    ["root-turn", "child-turn"],
  );
});

test("a genuinely unfinished child turn or missing native counter leaves totals unknown", (t) => {
  for (const facts of [{ unfinished: true }, { missingCounter: true }]) {
    const f = capture(t, facts);

    const usage = retainedUsage(f.directory, "coordinator", 1);

    assert.equal(usage.status, "unknown");
    assert.equal(usage.totals, null);
  }
});
