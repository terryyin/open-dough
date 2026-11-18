// Damaged native files preserve independent evidence and expose coverage limits.
import assert from "node:assert/strict";
import { appendFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { taskUsage } from "../../server/usageHistory.ts";
import {
  expect,
  test,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  keepRetainedLaunch,
  nativeFile,
  readImported,
  runImport,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";

test("keeps independent responses through damaged files and reports unsupported, missing and incomplete native evidence", ({
  home,
  root,
}) => {
  keepOperationalLaunch(home, launch("root", "task"));
  keepRetainedLaunch(home, launch("old", "old-task"));
  const file = writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("root")
      .withResponse("task", "valid", { output_tokens: 3 })
      .withRow({
        type: "event_msg",
        payload: {
          type: "token_count",
          info: { total_token_usage: { output_tokens: 9000 } },
        },
      })
      .withRow({
        type: "response_item",
        payload: {
          type: "function_call",
          name: "spawn_agent",
          call_id: "missing-worker",
        },
      })
      .withRow({
        type: "response_item",
        payload: {
          type: "function_call_output",
          call_id: "missing-worker",
          output: JSON.stringify({ agent_id: "missing-child" }),
        },
      })
      .please(),
  );
  appendFileSync(file, '{"type":"token_usage_record"');
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("old")
      .withRow({
        type: "event_msg",
        payload: {
          type: "token_count",
          info: { last_token_usage: { output_tokens: 2000 } },
        },
      })
      .please(),
  );
  // Partial path with no session_meta: layout and missing metadata under proof.
  const [independent] = makeMe.aCodexRollout
    .forSession("root")
    .withResponse("task", "independent", { output_tokens: 5 })
    .rows();
  assert(independent);
  nativeFile(path.join(root, "partial"), "root", [independent]);
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("incomplete-child")
      .withParent("root")
      .please(),
  );
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
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("worker")
      .spawnedFrom("root", { spawnParent: "different-root" })
      .withResponse(
        "child-turn",
        "child",
        { output_tokens: 99 },
        {
          rootTurnId: "task",
        },
      )
      .please(),
  );
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
