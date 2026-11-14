// Damaged native files preserve independent evidence and expose coverage limits.
import assert from "node:assert/strict";
import { appendFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { taskUsage } from "../../server/usageHistory.ts";
import {
  expect,
  test,
  launch,
  meta,
  response,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  keepRetainedLaunch,
  nativeFile,
  readImported,
  runImport,
} from "../../tests/usage-history/importHarness.ts";

test("keeps independent responses through damaged files and reports unsupported, missing and incomplete native evidence", ({
  home,
  root,
}) => {
  keepOperationalLaunch(home, launch("root", "task"));
  keepRetainedLaunch(home, launch("old", "old-task"));
  const file = nativeFile(root, "root", [
    meta("root"),
    response("root", "task", "valid", { output_tokens: 3 }),
    {
      type: "event_msg",
      payload: {
        type: "token_count",
        info: { total_token_usage: { output_tokens: 9000 } },
      },
    },
    {
      type: "response_item",
      payload: {
        type: "function_call",
        name: "spawn_agent",
        call_id: "missing-worker",
      },
    },
    {
      type: "response_item",
      payload: {
        type: "function_call_output",
        call_id: "missing-worker",
        output: JSON.stringify({ agent_id: "missing-child" }),
      },
    },
  ]);
  appendFileSync(file, '{"type":"token_usage_record"');
  nativeFile(root, "old", [
    meta("old"),
    {
      type: "event_msg",
      payload: {
        type: "token_count",
        info: { last_token_usage: { output_tokens: 2000 } },
      },
    },
  ]);
  nativeFile(path.join(root, "partial"), "root", [
    response("root", "task", "independent", { output_tokens: 5 }),
  ]);
  nativeFile(root, "incomplete-child", [
    {
      type: "session_meta",
      payload: { id: "incomplete-child", parent_thread_id: "root" },
    },
  ]);
  const broken = nativeFile(root, "broken", []);
  writeFileSync(`${broken}.zst`, "not zstd");
  runImport(home, root, ["--codex-root", path.join(home, "absent")]);
  const history = readImported(home);
  const task = Object.values(history.tasks).find(
    (item) => item.sessionId === "root",
  );
  assert(task);
  expect(taskUsage(history, task.id)).toEqual(
    expect.objectContaining({
      requests: 2,
      tokens: expect.objectContaining({ output: 8 }),
    }),
  );
  const old = Object.values(history.tasks).find(
    (item) => item.sessionId === "old",
  );
  assert(old);
  expect(taskUsage(history, old.id)).toEqual(
    expect.objectContaining({
      requests: 0,
      tokens: expect.objectContaining({ output: null }),
    }),
  );
  expect(history.gaps).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ code: "malformed-native-row" }),
      expect.objectContaining({
        code: "missing-session-metadata",
        sessionId: "root",
      }),
      expect.objectContaining({
        code: "incomplete-worker-evidence",
        sessionId: "incomplete-child",
      }),
      expect.objectContaining({
        code: "native-source-unreadable",
        source: expect.objectContaining({ file: `${broken}.zst` }),
      }),
      expect.objectContaining({ code: "native-source-unavailable" }),
      expect.objectContaining({
        code: "unsupported-response-counters",
        sessionId: "old",
      }),
      expect.objectContaining({
        code: "missing-worker-evidence",
        sessionId: "missing-child",
      }),
    ]),
  );
});

test("refuses contradictory parent lineage instead of charging a worker to a task", ({
  home,
  root,
}) => {
  keepOperationalLaunch(home, launch("root", "task"));
  const worker = response("worker", "child-turn", "child", {
    output_tokens: 99,
  });
  worker.payload.root_turn_id = "task";
  nativeFile(root, "worker", [
    {
      type: "session_meta",
      payload: {
        id: "worker",
        parent_thread_id: "root",
        source: {
          subagent: { thread_spawn: { parent_thread_id: "different-root" } },
        },
      },
    },
    worker,
  ]);
  runImport(home, root);
  const history = readImported(home);
  const [observation] = Object.values(history.observations);
  assert(observation);
  expect(observation.gaps).toContain("contradictory-lineage");
  expect(history.associations[observation.id]?.taskId).toBeNull();
  const [task] = Object.values(history.tasks);
  assert(task);
  expect(taskUsage(history, task.id)).toEqual(
    expect.objectContaining({
      requests: 0,
      tokens: expect.objectContaining({ output: null }),
    }),
  );
});
