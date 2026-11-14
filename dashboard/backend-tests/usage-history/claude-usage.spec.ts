import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { taskUsage } from "../../server/usageHistory.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import { expect, test } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  nativeFile,
  readImported,
  runImport,
  at,
} from "../../tests/usage-history/importHarness.ts";

test("imports retained Claude root and explicitly joined worker messages once across streaming updates and resumed tasks", ({
  home,
  root,
}) => {
  const sessionId = "6ccc791e-e1f3-4b69-9794-049c6189dfa5";
  const reference = "ca7430bd-0d52-499d-a1bd-660263c77c12";
  const record = makeMe.aLaunchRecord
    .executing({
      identity: "SEED-358#reconstruct-codex-and-claude-code-usage-history",
      title: "Usage recovery",
    })
    .inClaudeSession({ sessionId })
    .launchedAt(at)
    .requestingModel("requested-model")
    .requestingEffort("high")
    .reportingThrough({
      origin: "http://localhost:4318",
      reference,
      command: "report",
    })
    .please();
  keepLaunchStore(home, { "open-dough": [record] });
  const claudeRoot = path.join(home, "claude");
  const user = { type: "user", sessionId };
  const assistant = { type: "assistant", sessionId, timestamp: at };
  const initial = {
    ...assistant,
    uuid: "stream-a",
    parentUuid: "context",
    timestamp: at,
    requestId: "req-shared",
    effort: "medium",
    message: {
      id: "msg-root",
      model: "observed-model",
      usage: {
        input_tokens: 2,
        cache_read_input_tokens: 20,
        cache_creation_input_tokens: 10,
        cache_creation: {
          ephemeral_5m_input_tokens: 3,
          ephemeral_1h_input_tokens: 7,
        },
      },
    },
  };
  nativeFile(claudeRoot, sessionId, [
    {
      ...user,
      uuid: "launch-input",
      parentUuid: null,
      timestamp: at,
      origin: { kind: "human" },
      message: {
        role: "user",
        content: `Dashboard reporting context:\n- project: open-dough\n- host: claude\n- launch reference: ${reference}\n- reporting command: report\nprivate launch instructions`,
      },
    },
    {
      type: "attachment",
      sessionId,
      uuid: "context",
      parentUuid: "launch-input",
    },
    initial,
    {
      ...initial,
      uuid: "stream-b",
      parentUuid: "stream-a",
      timestamp: "2026-11-14T10:00:01.000Z",
      message: {
        ...initial.message,
        usage: { ...initial.message.usage, output_tokens: 7 },
      },
    },
    {
      ...user,
      uuid: "worker-result",
      parentUuid: "stream-b",
      toolUseResult: { agentId: "worker-1" },
      message: {
        content: [
          {
            type: "tool_result",
            tool_use_id: "tool-1",
            content: "private worker output",
          },
        ],
      },
    },
    {
      ...user,
      uuid: "notification",
      parentUuid: "worker-result",
      origin: { kind: "task-notification" },
      message: { content: "private notification" },
    },
    {
      ...assistant,
      uuid: "after-notification",
      parentUuid: "notification",
      timestamp: at,
      requestId: "req-shared",
      effort: "low",
      message: {
        id: "msg-next",
        model: "changed-model",
        usage: {
          input_tokens: 0,
          cache_read_input_tokens: 0,
          cache_creation_input_tokens: 0,
          output_tokens: 3,
        },
      },
    },
    {
      ...user,
      uuid: "later-task",
      parentUuid: "after-notification",
      origin: { kind: "human" },
      message: { content: "another task" },
    },
    {
      ...assistant,
      uuid: "later-response",
      parentUuid: "later-task",
      timestamp: at,
      message: {
        id: "msg-later",
        model: "another-model",
        usage: { output_tokens: 900 },
      },
    },
  ]);
  const workerRoot = path.join(claudeRoot, sessionId, "subagents");
  const workerMessage = {
    ...assistant,
    agentId: "worker-1",
    isSidechain: true,
    effort: "high",
    requestId: "req-worker",
    message: {
      id: "msg-worker",
      model: "worker-model",
      usage: {
        input_tokens: 4,
        cache_read_input_tokens: 6,
        cache_creation_input_tokens: 8,
        output_tokens: 5,
      },
    },
  };
  nativeFile(workerRoot, "agent-worker-1", [
    {
      ...user,
      agentId: "worker-1",
      isSidechain: true,
      uuid: "worker-input",
      parentUuid: null,
      message: { content: "private worker prompt" },
    },
    { ...workerMessage, uuid: "worker-a", parentUuid: "worker-input" },
    {
      ...workerMessage,
      uuid: "worker-b",
      parentUuid: "worker-a",
      timestamp: "2026-11-14T10:00:02.000Z",
    },
  ]);
  runImport(home, root, ["--claude-root", claudeRoot]);
  const history = readImported(home);
  const task = Object.values(history.tasks)[0];
  assert(task);
  expect(task.requested).toEqual(
    expect.objectContaining({ model: "requested-model", effort: "high" }),
  );
  const usage = taskUsage(history, task.id);
  expect(usage.requests).toBe(3);
  expect(usage.tokens).toEqual(
    expect.objectContaining({
      uncachedInput: 6,
      cacheRead: 26,
      cacheWrite: 18,
      output: 15,
      cacheWrite5m: 3,
      cacheWrite1h: 7,
    }),
  );
  const observed = new Map(
    Object.values(history.observations).map((item) => [item.responseId, item]),
  );
  const own = observed.get("msg-root");
  const next = observed.get("msg-next");
  const worker = observed.get("msg-worker");
  const later = observed.get("msg-later");
  assert(own && worker && next && later);
  expect(own).toEqual(
    expect.objectContaining({
      at,
      lastAt: "2026-11-14T10:00:01.000Z",
      settings: { model: "observed-model", effort: "medium" },
      rootTurnId: "launch-input",
      coverage: "measured",
    }),
  );
  expect(own.gaps).not.toContain("contradictory-lineage");
  expect(worker).toEqual(
    expect.objectContaining({
      agentId: "worker-1",
      parentSessionId: sessionId,
      settings: { model: "worker-model", effort: "high" },
      rootTurnId: "launch-input",
    }),
  );
  expect(
    history.associations[worker.id]?.sources.some((source) =>
      source.file.endsWith(`${sessionId}.jsonl`),
    ),
  ).toBe(true);
  expect(next.settings).toEqual({ model: "changed-model", effort: "low" });
  expect(history.associations[later.id]?.taskId).toBeNull();
  expect(history.associations[later.id]?.gaps).toContain(
    "unresolved-task-association",
  );
  expect(later.gaps).toContain("unresolved-native-task-lineage");
  expect(history.gaps.map((gap) => gap.code)).toContain(
    "auxiliary-usage-not-covered",
  );
  expect(JSON.stringify(history)).not.toMatch(
    /private launch|private worker|private notification|another task/,
  );
  runImport(home, root, ["--claude-root", claudeRoot]);
  expect(readImported(home)).toEqual(history);
  rmSync(claudeRoot, { recursive: true });
  expect(readImported(home)).toEqual(history);
});
