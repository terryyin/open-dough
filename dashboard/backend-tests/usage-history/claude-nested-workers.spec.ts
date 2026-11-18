import assert from "node:assert/strict";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { taskUsage } from "../../server/usageHistory.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  expect,
  test,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  nativeFile,
  readImported,
  runImport,
  writeClaudeSession,
} from "../../test-support/usage-history/importHarness.ts";

// Coordinator → worker A → background worker B, whose agent result, when
// recorded, is in A's transcript. A forked B's transcript first replays A's
// rows with their native identities.
function nestedWorkerSession(
  home: string,
  { joinedB, forkedB = false }: { joinedB: boolean; forkedB?: boolean },
) {
  const sessionId = "nested-session";
  const reference = "5b0e2d6c-36a4-4c1e-9f6e-3f1d2a7c8b90";
  keepLaunchStore(home, {
    "open-dough": [
      makeMe.aLaunchRecord
        .executing({ identity: "SEED-388#nested", title: "Nested" })
        .inClaudeSession({ sessionId })
        .reportingThrough({
          origin: "http://localhost:4318",
          reference,
          command: "report",
        })
        .please(),
    ],
  });
  const claudeRoot = path.join(home, "claude");
  writeClaudeSession(
    claudeRoot,
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withLaunchInput({ reference, command: "report" })
      .withAssistant({ uuid: "root-a", messageId: "msg-root" })
      .withUser({
        uuid: "a-result",
        toolUseResult: { agentId: "worker-a" },
        content: [{ type: "tool_result" }],
      })
      .please(),
  );
  const subagents = path.join(claudeRoot, sessionId, "subagents");
  const workerA = makeMe.aClaudeTranscript
    .forSession(sessionId)
    .asSidechain({ agentId: "worker-a" })
    .withUser({ uuid: "a-input", parentUuid: null, content: "start A" })
    .withAssistant({ uuid: "a-response", messageId: "msg-a" });
  nativeFile(subagents, "agent-worker-a", [
    ...(joinedB
      ? workerA.withUser({
          uuid: "b-result",
          toolUseResult: { status: "async_launched", agentId: "worker-b" },
          content: [{ type: "tool_result" }],
        })
      : workerA
    ).please(),
  ]);
  const workerB = makeMe.aClaudeTranscript
    .forSession(sessionId)
    .asSidechain({ agentId: "worker-b" });
  nativeFile(subagents, "agent-worker-b", [
    ...(forkedB
      ? workerB
          .withUser({ uuid: "a-input", parentUuid: null, content: "start A" })
          .withAssistant({ uuid: "a-response", messageId: "msg-a" })
          .withUser({ uuid: "b-input", content: "start B" })
      : workerB.withUser({
          uuid: "b-input",
          parentUuid: null,
          content: "start B",
        })
    )
      .withAssistant({
        uuid: "b-response",
        messageId: "msg-b",
        usage: { output_tokens: 13 },
      })
      .please(),
  ]);
  return claudeRoot;
}

test("counts a background worker started by a worker through the starting worker's agent result", ({
  home,
  root,
}) => {
  const claudeRoot = nestedWorkerSession(home, { joinedB: true });
  runImport(home, root, ["--claude-root", claudeRoot]);
  const history = readImported(home);
  const task = Object.values(history.tasks).find(
    (item) => item.kind === "launch",
  );
  const nested = Object.values(history.observations).find(
    (item) => item.responseId === "msg-b",
  );
  assert(task && nested);
  expect(history.associations[nested.id]?.taskId).toBe(task.id);
  expect(nested.gaps).not.toContain("unresolved-native-task-lineage");
  expect(taskUsage(history, task.id).requests).toBe(3);
});

test("leaves a nested worker without a recorded agent result unassigned and explained", ({
  home,
  root,
}) => {
  const claudeRoot = nestedWorkerSession(home, { joinedB: false });
  runImport(home, root, ["--claude-root", claudeRoot]);
  const history = readImported(home);
  const nested = Object.values(history.observations).find(
    (item) => item.responseId === "msg-b",
  );
  assert(nested);
  expect(history.associations[nested.id]?.taskId).toBeNull();
  expect(nested.gaps).toContain("unresolved-native-task-lineage");
  expect(history.gaps.map((gap) => gap.code)).toContain(
    "unjoined-worker-evidence",
  );
});

test("counts a response a forked worker replays from its parent once, as the parent's", ({
  home,
  root,
}) => {
  const claudeRoot = nestedWorkerSession(home, {
    joinedB: true,
    forkedB: true,
  });
  runImport(home, root, ["--claude-root", claudeRoot]);
  const history = readImported(home);
  const task = Object.values(history.tasks).find(
    (item) => item.kind === "launch",
  );
  const replayed = Object.values(history.observations).find(
    (item) => item.responseId === "msg-a",
  );
  assert(task && replayed);
  expect(replayed.measurements.map((item) => item.agentId)).toEqual([
    "worker-a",
    "worker-a",
  ]);
  expect(replayed.agentId).toBe("worker-a");
  expect(replayed.gaps).not.toContain("contradictory-lineage");
  expect(history.associations[replayed.id]?.taskId).toBe(task.id);
  expect(taskUsage(history, task.id).requests).toBe(3);
});
