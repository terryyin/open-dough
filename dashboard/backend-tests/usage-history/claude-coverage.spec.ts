// Distinct task requests in one native session must not share an API charge.
import assert from "node:assert/strict";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { responseKey } from "../../server/usageRecords.ts";
import { taskUsage } from "../../server/usageHistory.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import { expect, test } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  at,
  nativeFile,
  nodeProcess,
  readImported,
  runImport,
} from "../../tests/usage-history/importHarness.ts";

test("keeps explicit resumed launch boundaries separate, permits evidenced follow-up, and retains conflicting messages without double charge", ({
  home,
  root,
}) => {
  const sessionId = "claude-resumed";
  const references = [
    "ca7430bd-0d52-499d-a1bd-660263c77c12",
    "99fd2b4d-b5cb-4a13-9193-46b338ed7fe5",
  ] as const;
  const records = references.map((reference, index) =>
    makeMe.aLaunchRecord
      .executing({ identity: `SEED-358#task-${index}`, title: `Task ${index}` })
      .inClaudeSession({ sessionId })
      .launchedAt(`2026-11-14T10:00:0${index}.000Z`)
      .reportingThrough({
        origin: "http://localhost:4318",
        reference,
        command: "report",
      })
      .please(),
  );
  keepLaunchStore(home, { "open-dough": records });
  const claudeRoot = path.join(home, "claude");
  const user = { type: "user", sessionId, origin: { kind: "human" } };
  const assistant = {
    type: "assistant",
    sessionId,
    timestamp: at,
    requestId: "req-shared",
  };
  const usage = {
    input_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
    output_tokens: 7,
  };
  const reporting =
    "Dashboard reporting context:\n- project: open-dough\n- host: claude\n- launch reference: ";
  const rows = [
    {
      ...user,
      uuid: "first",
      parentUuid: null,
      message: { content: reporting + references[0] },
    },
    {
      ...assistant,
      uuid: "response-first",
      parentUuid: "first",
      message: { id: "msg-first", model: "model-a", usage },
    },
    {
      ...user,
      uuid: "follow-up",
      parentUuid: "response-first",
      message: { content: reporting + references[0] },
    },
    {
      ...assistant,
      uuid: "response-follow-up",
      parentUuid: "follow-up",
      message: {
        id: "msg-follow-up",
        model: "model-b",
        usage: { ...usage, output_tokens: 3 },
      },
    },
    {
      ...user,
      uuid: "second",
      parentUuid: "response-follow-up",
      message: { content: reporting + references[1] },
    },
    {
      ...assistant,
      uuid: "response-second",
      parentUuid: "second",
      message: { id: "msg-second", usage: { ...usage, output_tokens: 11 } },
    },
  ];
  nativeFile(claudeRoot, sessionId, rows);
  runImport(home, root, ["--claude-root", claudeRoot]);
  const history = readImported(home);
  const first = Object.values(history.tasks).find(
    (task) => task.identity === "SEED-358#task-0",
  );
  const second = Object.values(history.tasks).find(
    (task) => task.identity === "SEED-358#task-1",
  );
  assert(first && second);
  expect(taskUsage(history, first.id)).toEqual(
    expect.objectContaining({
      requests: 2,
      tokens: expect.objectContaining({ output: 10, uncachedInput: 0 }),
    }),
  );
  expect(taskUsage(history, second.id)).toEqual(
    expect.objectContaining({
      requests: 1,
      tokens: expect.objectContaining({ output: 11 }),
    }),
  );
  const observation =
    history.observations[responseKey("claude", sessionId, "msg-first")];
  assert(observation);
  const replay = {
    ...observation,
    measurements: observation.measurements.map((measurement) => ({
      ...measurement,
      source: { kind: "native", file: "collector://claude/message" },
    })),
  };
  nodeProcess(
    home,
    `const {writeUsageHistory}=await import('./dashboard/server/usageHistory.ts'); await writeUsageHistory({observations:[${JSON.stringify(replay)}]});`,
  );
  expect(taskUsage(readImported(home), first.id).tokens.output).toBe(10);
  nativeFile(claudeRoot, sessionId, [
    ...rows,
    {
      ...assistant,
      uuid: "conflicting-stream",
      parentUuid: "response-first",
      timestamp: "2026-11-14T10:00:02.000Z",
      message: { id: "msg-first", usage: { ...usage, output_tokens: 9 } },
    },
    {
      ...assistant,
      uuid: "contradictory-task",
      parentUuid: "response-second",
      timestamp: "2026-11-14T10:00:03.000Z",
      message: { id: "msg-follow-up", usage: { ...usage, output_tokens: 3 } },
    },
  ]);
  runImport(home, root, ["--claude-root", claudeRoot]);
  const conflicted = readImported(home);
  const changed = conflicted.observations[observation.id];
  assert(changed);
  expect(changed.tokens.output).toBeNull();
  expect(changed.gaps).toContain("contradictory-measurements");
  expect(
    changed.measurements.map((measurement) => measurement.tokens.output),
  ).toEqual(expect.arrayContaining([7, 9]));
  expect(
    conflicted.associations[responseKey("claude", sessionId, "msg-follow-up")]
      ?.taskId,
  ).toBeNull();
  expect(taskUsage(conflicted, first.id).requests).toBe(1);
  expect(taskUsage(conflicted, second.id).tokens.output).toBe(11);
});

test("retains independent partial workers and reports missing transcripts and unsupported API identities honestly", ({
  home,
  root,
}) => {
  const sessionId = "claude-missing";
  const record = makeMe.aLaunchRecord
    .executing({ identity: "SEED-358#task", title: "Task" })
    .inClaudeSession({ sessionId })
    .launchedAt(at)
    .please();
  keepLaunchStore(home, { "open-dough": [record] });
  const claudeRoot = path.join(home, "claude");
  nativeFile(claudeRoot, sessionId, [
    {
      type: "user",
      sessionId,
      uuid: "result",
      parentUuid: null,
      toolUseResult: { agentId: "missing-worker" },
      message: { content: [{ type: "tool_result" }] },
    },
    {
      type: "assistant",
      sessionId,
      uuid: "unsupported",
      parentUuid: "result",
      timestamp: at,
      requestId: "request-only",
      message: { usage: { output_tokens: 700 } },
    },
  ]);
  nativeFile(path.join(claudeRoot, "workers"), "agent-orphan", [
    {
      type: "user",
      sessionId,
      agentId: "orphan",
      uuid: "worker-input",
      parentUuid: null,
      message: { content: "private orphan prompt" },
    },
    {
      type: "assistant",
      sessionId,
      agentId: "orphan",
      uuid: "worker-response",
      parentUuid: "worker-input",
      timestamp: at,
      message: { id: "msg-orphan", usage: { output_tokens: 4 } },
    },
  ]);
  runImport(home, root, ["--claude-root", claudeRoot]);
  const history = readImported(home);
  const task = Object.values(history.tasks)[0];
  const observation = Object.values(history.observations)[0];
  assert(task && observation);
  expect(taskUsage(history, task.id).tokens.output).toBeNull();
  expect(observation.tokens).toEqual(
    expect.objectContaining({
      uncachedInput: null,
      cacheRead: null,
      cacheWrite: null,
      output: 4,
    }),
  );
  expect(observation.coverage).toBe("partial");
  expect(history.associations[observation.id]?.taskId).toBeNull();
  expect(history.gaps.map((gap) => gap.code)).toEqual(
    expect.arrayContaining([
      "missing-worker-evidence",
      "unjoined-worker-evidence",
      "missing-root-transcript-usage",
      "unsupported-response-identity",
      "no-attributable-response-usage",
    ]),
  );
  expect(JSON.stringify(history)).not.toContain("private orphan prompt");
});
