import assert from "node:assert/strict";
import { readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  taskUsage,
  usageHistoryFile,
} from "../../server/usageHistory.ts";
import { importUsageHistory } from "../../server/usageImport.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import { test } from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  nativeFile,
  writeClaudeSession,
} from "../../test-support/usage-history/importHarness.ts";

test("imports retained Claude root and explicitly joined worker messages once across streaming updates and resumed tasks", async ({
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
  const rootUsage = {
    input_tokens: 2,
    cache_read_input_tokens: 20,
    cache_creation_input_tokens: 10,
    cache_creation: {
      ephemeral_5m_input_tokens: 3,
      ephemeral_1h_input_tokens: 7,
    },
  };
  writeClaudeSession(
    claudeRoot,
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withLaunchInput({
        reference,
        command: "report",
        suffix: "\nprivate launch instructions",
        role: true,
      })
      .withAttachment()
      .withAssistant({
        uuid: "stream-a",
        messageId: "msg-root",
        model: "observed-model",
        effort: "medium",
        requestId: "req-shared",
        usage: rootUsage,
      })
      .withAssistant({
        uuid: "stream-b",
        messageId: "msg-root",
        model: "observed-model",
        effort: "medium",
        requestId: "req-shared",
        timestamp: "2026-11-14T10:00:01.000Z",
        usage: { ...rootUsage, output_tokens: 7 },
      })
      .withUser({
        uuid: "worker-result",
        toolUseResult: { agentId: "worker-1" },
        content: [
          {
            type: "tool_result",
            tool_use_id: "tool-1",
            content: "private worker output",
          },
        ],
      })
      .withUser({
        uuid: "notification",
        origin: { kind: "task-notification" },
        content: "private notification",
      })
      .withAssistant({
        uuid: "after-notification",
        messageId: "msg-next",
        model: "changed-model",
        effort: "low",
        requestId: "req-shared",
        usage: {
          input_tokens: 0,
          cache_read_input_tokens: 0,
          cache_creation_input_tokens: 0,
          output_tokens: 3,
        },
      })
      .withUser({
        uuid: "later-task",
        origin: { kind: "human" },
        content: "/dough-land\nprivate landing note",
      })
      .withAssistant({
        uuid: "later-response",
        messageId: "msg-later",
        model: "another-model",
        usage: { output_tokens: 900 },
      })
      .please(),
  );
  const workerUsage = {
    input_tokens: 4,
    cache_read_input_tokens: 6,
    cache_creation_input_tokens: 8,
    output_tokens: 5,
  };
  // Worker path under `subagents/` is layout under proof.
  nativeFile(path.join(claudeRoot, sessionId, "subagents"), "agent-worker-1", [
    ...makeMe.aClaudeTranscript
      .forSession(sessionId)
      .asSidechain({ agentId: "worker-1" })
      .withUser({
        uuid: "worker-input",
        parentUuid: null,
        content: "private worker prompt",
      })
      .withAssistant({
        uuid: "worker-a",
        messageId: "msg-worker",
        model: "worker-model",
        effort: "high",
        requestId: "req-worker",
        usage: workerUsage,
      })
      .withAssistant({
        uuid: "worker-b",
        messageId: "msg-worker",
        model: "worker-model",
        effort: "high",
        requestId: "req-worker",
        timestamp: "2026-11-14T10:00:02.000Z",
        usage: workerUsage,
      })
      .please(),
  ]);
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: [claudeRoot],
    })
    .please();
  await importUsageHistory(options);
  const history = {
    ...(await readUsageHistory(options.store)),
    ...(JSON.parse(readFileSync(options.responses, "utf8")) as UsageResponses),
  };
  const task = Object.values(history.tasks).find(
    (item) => item.kind === "launch",
  );
  assert(task);
  expect(task.requested).toMatchObject({
    model: "requested-model",
    effort: "high",
  });
  const usage = taskUsage(history, task.id);
  expect(usage.requests).toBe(3);
  expect(usage.tokens).toMatchObject({
    uncachedInput: 6,
    cacheRead: 26,
    cacheWrite: 18,
    output: 15,
  });
  // Each response read keeps its cache-write split.
  const split = (name: "cacheWrite5m" | "cacheWrite1h") =>
    Object.values(history.observations).reduce(
      (sum, item) => sum + (item.tokens[name] ?? 0),
      0,
    );
  expect([split("cacheWrite5m"), split("cacheWrite1h")]).toEqual([3, 7]);
  const observed = new Map(
    Object.values(history.observations).map((item) => [item.responseId, item]),
  );
  const own = observed.get("msg-root");
  const next = observed.get("msg-next");
  const worker = observed.get("msg-worker");
  const later = observed.get("msg-later");
  assert(own && worker && next && later);
  expect(own).toMatchObject({
    at: "2026-11-14T10:00:00.000Z",
    lastAt: "2026-11-14T10:00:01.000Z",
    settings: { model: "observed-model", effort: "medium" },
    rootTurnId: "launch-input",
    coverage: "measured",
  });
  expect(own.gaps).not.toContain("contradictory-lineage");
  expect(worker).toMatchObject({
    agentId: "worker-1",
    parentSessionId: sessionId,
    settings: { model: "worker-model", effort: "high" },
    rootTurnId: "launch-input",
  });
  expect(
    history.associations[worker.id]?.sources.some((source) =>
      source.file.endsWith(`${sessionId}.jsonl`),
    ),
  ).toBe(true);
  expect(next.settings).toEqual({ model: "changed-model", effort: "low" });
  // The later task's response is its own, not the launch's.
  const laterTask = history.associations[later.id]?.taskId;
  expect(laterTask).not.toBe(task.id);
  expect(history.tasks[laterTask ?? ""]?.workflow).toBe("dough-land");
  expect(history.gaps.map((gap) => gap.code)).toContain(
    "auxiliary-usage-not-covered",
  );
  expect(JSON.stringify(history)).not.toMatch(
    /private launch|private worker|private notification|private landing/,
  );
  await importUsageHistory(options);
  expect({
    ...(await readUsageHistory(options.store)),
    ...(JSON.parse(readFileSync(options.responses, "utf8")) as UsageResponses),
  }).toEqual(history);
  rmSync(claudeRoot, { recursive: true });
  expect({
    ...(await readUsageHistory(options.store)),
    ...(JSON.parse(readFileSync(options.responses, "utf8")) as UsageResponses),
  }).toEqual(history);
});
