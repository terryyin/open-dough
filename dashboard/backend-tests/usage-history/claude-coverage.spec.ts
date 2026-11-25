// Distinct task requests in one native session must not share an API charge.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { claudeReportingContext } from "../../../Distribution/tests/support/claudeReportingContext.mjs";
import { responseKey } from "../../server/usageRecords.ts";
import {
  readUsageHistory,
  taskUsage,
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import { importUsageHistory } from "../../server/usageImport.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import { test } from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  nativeFile,
  writeClaudeSession,
} from "../../test-support/usage-history/importHarness.ts";

const importOptions = (home: string, root: string, claudeRoot: string) =>
  makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: [claudeRoot],
    })
    .please();

test("keeps explicit resumed launch boundaries separate, permits evidenced follow-up, and retains conflicting messages without double charge", async ({
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
  const usage = {
    input_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
    output_tokens: 7,
  };
  const rows = makeMe.aClaudeTranscript
    .forSession(sessionId)
    .withLaunchInput({ reference: references[0], uuid: "first" })
    .withAssistant({
      uuid: "response-first",
      messageId: "msg-first",
      model: "model-a",
      requestId: "req-shared",
      usage,
    })
    .withUser({
      uuid: "follow-up",
      origin: { kind: "human" },
      content: claudeReportingContext({ reference: references[0] }),
    })
    .withAssistant({
      uuid: "response-follow-up",
      messageId: "msg-follow-up",
      model: "model-b",
      requestId: "req-shared",
      usage: { ...usage, output_tokens: 3 },
    })
    .withUser({
      uuid: "second",
      origin: { kind: "human" },
      content: claudeReportingContext({ reference: references[1] }),
    })
    .withAssistant({
      uuid: "response-second",
      messageId: "msg-second",
      requestId: "req-shared",
      usage: { ...usage, output_tokens: 11 },
    })
    .please();
  writeClaudeSession(claudeRoot, rows);
  const options = importOptions(home, root, claudeRoot);
  await importUsageHistory(options);
  const { store, responses } = options;
  const history = await readUsageHistory(store);
  const initial = JSON.parse(readFileSync(responses, "utf8")) as UsageResponses;
  const tasks = Object.values(history.tasks);
  const first = tasks.find(({ identity }) => identity === "SEED-358#task-0");
  const second = tasks.find(({ identity }) => identity === "SEED-358#task-1");
  assert(first && second);
  expect(taskUsage(history, first.id)).toMatchObject({
    requests: 2,
    tokens: { output: 10, uncachedInput: 0 },
  });
  expect(taskUsage(history, second.id)).toMatchObject({
    requests: 1,
    tokens: { output: 11 },
  });
  const firstResponse = responseKey("claude", sessionId, "msg-first");
  const observation = initial.observations[firstResponse];
  assert(observation);
  const replay: typeof observation = {
    ...observation,
    measurements: observation.measurements.map((measurement) => ({
      ...measurement,
      source: { kind: "native", file: "collector://claude/message" },
    })),
  };
  // A writer passes every response of the session it read, with its tasks.
  const observations = Object.values({
    ...initial.observations,
    [replay.id]: replay,
  });
  const associations = Object.values(initial.associations);
  await writeUsageHistory({ observations, associations }, store);
  const replayed = await readUsageHistory(store);
  expect(taskUsage(replayed, first.id).tokens.output).toBe(10);
  writeClaudeSession(claudeRoot, [
    ...rows,
    ...makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withAssistant({
        uuid: "conflicting-stream",
        parentUuid: "response-first",
        messageId: "msg-first",
        requestId: "req-shared",
        timestamp: "2026-11-14T10:00:02.000Z",
        usage: { ...usage, output_tokens: 9 },
      })
      .withAssistant({
        uuid: "contradictory-task",
        parentUuid: "response-second",
        messageId: "msg-follow-up",
        requestId: "req-shared",
        timestamp: "2026-11-14T10:00:03.000Z",
        usage: { ...usage, output_tokens: 3 },
      })
      .please(),
  ]);
  await importUsageHistory(options);
  const conflicted = await readUsageHistory(store);
  const artifact = JSON.parse(
    readFileSync(responses, "utf8"),
  ) as UsageResponses;
  const changed = artifact.observations[observation.id];
  assert(changed);
  expect(changed.tokens.output).toBeNull();
  expect(changed.gaps).toContain("contradictory-measurements");
  const outputs = changed.measurements.map(({ tokens }) => tokens.output);
  expect(outputs).toEqual(expect.arrayContaining([7, 9]));
  const followup = responseKey("claude", sessionId, "msg-follow-up");
  expect(artifact.associations[followup]?.taskId).toBeNull();
  expect(taskUsage(conflicted, first.id).requests).toBe(1);
  expect(taskUsage(conflicted, second.id).tokens.output).toBe(11);
});

test("retains independent partial workers and reports missing transcripts and unsupported API identities honestly", async ({
  home,
  root,
}) => {
  const sessionId = "claude-missing";
  const record = makeMe.aLaunchRecord
    .executing({ identity: "SEED-358#task", title: "Task" })
    .inClaudeSession({ sessionId })
    .please();
  keepLaunchStore(home, { "open-dough": [record] });
  const claudeRoot = path.join(home, "claude");
  writeClaudeSession(
    claudeRoot,
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withUser({
        uuid: "result",
        parentUuid: null,
        toolUseResult: { agentId: "missing-worker" },
        content: [{ type: "tool_result" }],
      })
      .withAssistant({
        uuid: "unsupported",
        requestId: "request-only",
        usage: { output_tokens: 700 },
      })
      .please(),
  );
  // Orphan worker outside `subagents/` is layout under proof.
  const orphan = makeMe.aClaudeTranscript
    .forSession(sessionId)
    .asSidechain({ agentId: "orphan" })
    .withUser({
      uuid: "worker-input",
      parentUuid: null,
      content: "private orphan prompt",
    })
    .withAssistant({
      uuid: "worker-response",
      messageId: "msg-orphan",
      usage: { output_tokens: 4 },
    })
    .please();
  nativeFile(path.join(claudeRoot, "workers"), "agent-orphan", orphan);
  const options = importOptions(home, root, claudeRoot);
  await importUsageHistory(options);
  const { store, responses } = options;
  const history = await readUsageHistory(store);
  const artifact = JSON.parse(
    readFileSync(responses, "utf8"),
  ) as UsageResponses;
  const task = Object.values(history.tasks)[0];
  const observation = Object.values(artifact.observations)[0];
  assert(task && observation);
  expect(taskUsage(history, task.id).tokens.output).toBeNull();
  expect(observation.tokens).toMatchObject({
    uncachedInput: null,
    cacheRead: null,
    cacheWrite: null,
    output: 4,
  });
  expect(observation.coverage).toBe("partial");
  expect(artifact.associations[observation.id]?.taskId).toBeNull();
  const reasons = [
    "missing-worker-evidence",
    "unjoined-worker-evidence",
    "missing-root-transcript-usage",
    "unsupported-response-identity",
    "no-attributable-response-usage",
  ];
  const gaps = history.gaps.map(({ code }) => code);
  expect(gaps).toEqual(expect.arrayContaining(reasons));
  expect(JSON.stringify([history, artifact])).not.toContain(
    "private orphan prompt",
  );
});
