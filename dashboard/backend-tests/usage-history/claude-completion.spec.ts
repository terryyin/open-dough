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
  readImported,
  runImport,
  writeClaudeSession,
} from "../../test-support/usage-history/importHarness.ts";

const sessionId = "claude-completion";
const reference = "ca7430bd-0d52-499d-a1bd-660263c77c12";

function keepLaunch(home: string) {
  keepLaunchStore(home, {
    "open-dough": [
      makeMe.aLaunchRecord
        .executing({
          identity: "SEED-358#reconstruct-codex-and-claude-code-usage-history",
          title: "Usage recovery",
        })
        .inClaudeSession({ sessionId })
        .reportingThrough({
          origin: "http://localhost:4318",
          reference,
          command: "report",
        })
        .please(),
    ],
  });
}

function assistant(
  id: string,
  uuid: string,
  output: number | undefined,
  stop: unknown,
  timestamp?: string,
) {
  return {
    uuid,
    parentUuid: "launch-input" as const,
    ...(timestamp === undefined ? {} : { timestamp }),
    messageId: id,
    model: "claude-model",
    ...(stop === undefined ? {} : { stopReason: stop }),
    content: [{ type: "text", text: "private response text" }],
    usage: {
      input_tokens: 2,
      cache_read_input_tokens: 20,
      cache_creation_input_tokens: 10,
      output_tokens: output,
      output_tokens_details: { thinking_tokens: output === 690 ? 20 : 1 },
      iterations: [{ output_tokens: 9999 }],
    },
  };
}

test("counts explicit terminal output once, even before a later progressive snapshot, without completing the task", ({
  home,
  root,
}) => {
  keepLaunch(home);
  const claudeRoot = path.join(home, "claude");
  writeClaudeSession(
    claudeRoot,
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withLaunchInput({ reference, command: "report", role: true })
      .withAssistant(assistant("msg-one", "partial", 3, null))
      .withAssistant(
        assistant(
          "msg-one",
          "final",
          690,
          "tool_use",
          "2026-11-14T10:00:01.000Z",
        ),
      )
      .withAssistant(
        assistant(
          "msg-one",
          "later-progress",
          8,
          null,
          "2026-11-14T10:00:02.000Z",
        ),
      )
      .please(),
  );
  runImport(home, root, ["--claude-root", claudeRoot]);
  const history = readImported(home);
  const [observation] = Object.values(history.observations);
  const [task] = Object.values(history.tasks);
  assert(observation && task);
  expect(Object.values(history.observations)).toHaveLength(1);
  expect(observation.tokens).toEqual(
    expect.objectContaining({
      output: 690,
      reasoningOutput: 20,
      uncachedInput: 2,
      cacheRead: 20,
      cacheWrite: 10,
    }),
  );
  expect(
    observation.measurements.map((item) => item.reported["output_tokens"]),
  ).toEqual([3, 690, 8]);
  expect(observation).toEqual(
    expect.objectContaining({
      at: "2026-11-14T10:00:00.000Z",
      lastAt: "2026-11-14T10:00:02.000Z",
      coverage: "measured",
    }),
  );
  expect(observation.gaps).not.toContain("contradictory-measurements");
  expect(taskUsage(history, task.id)).toEqual(
    expect.objectContaining({
      requests: 1,
      tokens: expect.objectContaining({ output: 690 }),
    }),
  );
  expect(task.outcome ?? null).toBeNull();
  expect(JSON.stringify(history)).not.toContain("private response text");
});

test("keeps incomplete progress and competing terminal or unclassified evidence unknown while preserving legacy counters", ({
  home,
  root,
}) => {
  keepLaunch(home);
  const claudeRoot = path.join(home, "claude");
  writeClaudeSession(
    claudeRoot,
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withAssistant(assistant("partial-only", "partial", 3, null))
      .withAssistant(
        assistant("missing-terminal-output", "measured-progress", 3, null),
      )
      .withAssistant(
        assistant(
          "missing-terminal-output",
          "missing-final",
          undefined,
          "end_turn",
        ),
      )
      .withAssistant(assistant("legacy-only", "legacy", 4, undefined))
      .withAssistant(
        assistant("conflicting-finals", "final-a", 690, "tool_use"),
      )
      .withAssistant(
        assistant("conflicting-finals", "final-b", 843, "end_turn"),
      )
      .withAssistant(assistant("unknown-competes", "old", 8, undefined))
      .withAssistant(assistant("unknown-competes", "new", 690, "tool_use"))
      .withAssistant(
        assistant("unsupported-competes", "unsupported", 4, "future_reason"),
      )
      .withAssistant(
        assistant("unsupported-competes", "supported", 690, "max_tokens"),
      )
      .please(),
  );
  runImport(home, root, ["--claude-root", claudeRoot]);
  const observations = Object.fromEntries(
    Object.values(readImported(home).observations).map((item) => [
      item.responseId,
      item,
    ]),
  );
  expect(observations["partial-only"]?.tokens.output).toBeNull();
  expect(observations["partial-only"]?.tokens.reasoningOutput).toBeNull();
  expect(observations["partial-only"]?.gaps).toContain("incomplete-output");
  expect(
    observations["partial-only"]?.measurements[0]?.reported["output_tokens"],
  ).toBe(3);
  expect(observations["missing-terminal-output"]?.tokens.output).toBeNull();
  expect(observations["missing-terminal-output"]?.gaps).toContain(
    "incomplete-output",
  );
  expect(observations["legacy-only"]?.tokens.output).toBe(4);
  expect(observations["legacy-only"]?.gaps).not.toContain("incomplete-output");
  for (const id of [
    "conflicting-finals",
    "unknown-competes",
    "unsupported-competes",
  ]) {
    expect(observations[id]?.tokens.output).toBeNull();
    expect(observations[id]?.gaps).toContain("contradictory-measurements");
  }
});
