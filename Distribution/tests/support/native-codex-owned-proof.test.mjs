import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ownedWorkerProof } from "../native-comparison/paused-supplier/owned-proof.mjs";

const source = fileURLToPath(new URL("../../..", import.meta.url));
const record = (type, payload) => ({
  type,
  payload,
  timestamp: "2026-11-14T00:01:00Z",
});
const context = (turn, cwd) => record("turn_context", { turn_id: turn, cwd });
const output = (result) => [{ type: "text", text: JSON.stringify(result) }];

function fixture(
  t,
  {
    parent = "coordinator",
    rootTurn = "current",
    cwd,
    status = 0,
    copied = false,
    unresolved = false,
    fakeReceipt = false,
  } = {},
) {
  const directory = mkdtempSync(join(tmpdir(), "owned-case-proof-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const workspace = join(directory, "workspace"),
    effectiveCwd = cwd ?? workspace;
  const save = (name, rows) =>
    writeFileSync(
      join(directory, name),
      `${rows.map(JSON.stringify).join("\n")}\n`,
    );
  // These projected native wire fields are the identity/receipt shapes under proof.
  save("rollout-00-coordinator.jsonl", [
    record("session_meta", { id: "coordinator", source: "exec" }),
    record("event_msg", { type: "task_started", turn_id: "current" }),
    context("current", workspace),
    record("event_msg", { type: "task_complete", turn_id: "current" }),
  ]);
  const commands = [
    "node --input-type=module -e 'console.log(1)'",
    "node --test tests/*.test.mjs",
    "node --input-type=module -e 'console.log(2)'",
  ];
  const code = commands
    .map(
      (cmd) =>
        `text(await tools.exec_command(${JSON.stringify({ cmd, workdir: effectiveCwd })}));`,
    )
    .join("\n");
  const terminal = Array.from(commands.keys(), (i) =>
    output(
      i === 1 && unresolved
        ? { session_id: 7 }
        : i === 1 && fakeReceipt
          ? { output: '{"exit_code":0}' }
          : { exit_code: i === 1 ? status : 0, output: "proof output" },
    ),
  ).flat();
  save("rollout-01-worker.jsonl", [
    record("session_meta", {
      id: "worker",
      source: { subagent: { thread_spawn: { parent_thread_id: parent } } },
    }),
    context(copied ? "copied-parent-turn" : "worker-turn", effectiveCwd),
    record("response_item", {
      type: "custom_tool_call",
      name: "exec",
      call_id: "proof-call",
      input: code,
    }),
    record("response_item", {
      type: "custom_tool_call_output",
      call_id: "proof-call",
      output: terminal,
    }),
    context("worker-turn", effectiveCwd),
    record("token_usage_record", {
      thread_id: "worker",
      turn_id: "worker-turn",
      root_turn_id: rootTurn,
    }),
    record("event_msg", { type: "task_complete", turn_id: "worker-turn" }),
  ]);
  const stream = join(directory, "events-turn-4.jsonl");
  save("events-turn-4.jsonl", [
    { type: "thread.started", thread_id: "coordinator" },
    { type: "turn.completed" },
  ]);
  return { directory, workspace, stream };
}

function caseProof(f, sessions = f.directory) {
  return execFileSync(
    "bash",
    [
      "-c",
      'source "$1"; source "$2"; case_agent_proof "$3" "$4" coordinator "$5"',
      "proof",
      join(source, "Distribution/tests/support/native-comparison-run.sh"),
      join(
        source,
        "Distribution/tests/native-comparison/paused-supplier/case.bash",
      ),
      f.stream,
      f.workspace,
      sessions,
    ],
    { encoding: "utf8" },
  ).trim();
}

test("paused-supplier observer accepts proof from the current owned worker instead of requiring a coordinator rerun", (t) => {
  const f = fixture(t);
  assert.equal(caseProof(f), "passed");
});

test("worker proof excludes foreign ownership, another workspace, an earlier root turn and fork replay", (t) => {
  for (const facts of [
    { parent: "foreign" },
    { cwd: "/another-project" },
    { rootTurn: "earlier" },
    { copied: true },
  ]) {
    const f = fixture(t, facts);
    assert.equal(
      ownedWorkerProof("coordinator", f.workspace, f.directory),
      "none",
    );
  }
});

test("worker proof preserves failed and unresolved command outcomes and ignores receipt-shaped stdout", (t) => {
  for (const [facts, expected] of [
    [{ status: 1 }, "failed"],
    [{ unresolved: true }, "unknown"],
    [{ fakeReceipt: true }, "unknown"],
  ]) {
    const f = fixture(t, facts);
    assert.equal(
      ownedWorkerProof("coordinator", f.workspace, f.directory),
      expected,
    );
  }
});

test("coordinator failure remains authoritative and absent fixture session authority reads no developer state", (t) => {
  const f = fixture(t);
  assert.equal(caseProof(f, ""), "none");
  const rows = [
    { type: "thread.started", thread_id: "coordinator" },
    {
      type: "item.completed",
      item: {
        type: "command_execution",
        id: "proof",
        command: "node --test tests/*.test.mjs",
        exit_code: 1,
      },
    },
    { type: "turn.completed" },
  ];
  writeFileSync(f.stream, `${rows.map(JSON.stringify).join("\n")}\n`);
  assert.equal(caseProof(f), "failed");
});
