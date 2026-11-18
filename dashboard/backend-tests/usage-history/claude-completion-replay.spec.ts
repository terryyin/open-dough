import assert from "node:assert/strict";
import { rmSync } from "node:fs";
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

const sessionId = "claude-enrichment";
const reference = "ca7430bd-0d52-499d-a1bd-660263c77c12";
// The session's transcript from its launch input on.
const transcript = () =>
  makeMe.aClaudeTranscript
    .forSession(sessionId)
    .withLaunchInput({ reference, command: "report", role: true });

function assistant(uuid: string, output: number, stop?: null | string) {
  return {
    uuid,
    parentUuid: "launch-input" as const,
    ...(stop === undefined ? {} : { stopReason: stop }),
    messageId: "msg-same",
    model: "claude-model",
    usage: {
      input_tokens: 2,
      cache_read_input_tokens: 20,
      cache_creation_input_tokens: 10,
      output_tokens: output,
    },
  };
}

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

// The launch's task with its usage in the history, and the one response the
// latest import read.
function imported(home: string) {
  const history = readImported(home);
  const [task] = Object.values(history.tasks);
  const values = Object.values(history.observations);
  assert(task);
  return { history, usage: taskUsage(history, task.id), responses: values };
}

test("terminal output settles progressive snapshots, a reread replaces the session's contribution, and source removal keeps it", ({
  home,
  root,
}) => {
  keepLaunch(home);
  const claudeRoot = path.join(home, "claude");
  writeClaudeSession(
    claudeRoot,
    transcript()
      .withAssistant(assistant("partial", 3))
      .withAssistant(assistant("terminal", 690))
      .please(),
  );
  runImport(home, root, ["--claude-root", claudeRoot]);
  const legacy = imported(home);
  expect(legacy.responses).toHaveLength(1);
  expect(legacy.responses[0]?.gaps).toContain("contradictory-measurements");
  expect(legacy.usage).toMatchObject({
    requests: 1,
    tokens: { uncachedInput: 2, output: null },
    unmeasured: { output: 1 },
  });
  const terminal = transcript()
    .withAssistant(assistant("partial", 3, null))
    .withAssistant(assistant("terminal", 690, "tool_use"))
    .please();
  writeClaudeSession(claudeRoot, terminal);
  runImport(home, root, ["--claude-root", claudeRoot]);
  const enriched = imported(home);
  expect(enriched.responses[0]?.measurements).toHaveLength(2);
  expect(enriched.responses[0]?.gaps).not.toContain(
    "contradictory-measurements",
  );
  expect(enriched.usage).toMatchObject({
    requests: 1,
    tokens: { uncachedInput: 2, cacheRead: 20, cacheWrite: 10, output: 690 },
    unmeasured: { output: 0 },
  });
  runImport(home, root, ["--claude-root", claudeRoot]);
  expect(imported(home).history).toEqual(enriched.history);
  // The same session read from a second file is still one response.
  const copiedRoot = path.join(home, "copied");
  writeClaudeSession(copiedRoot, terminal);
  runImport(home, root, [
    "--claude-root",
    claudeRoot,
    "--claude-root",
    copiedRoot,
  ]);
  const copied = imported(home);
  expect(copied.responses[0]?.measurements).toHaveLength(4);
  expect(copied.usage).toEqual(enriched.usage);
  rmSync(claudeRoot, { recursive: true });
  rmSync(copiedRoot, { recursive: true });
  runImport(home, root, ["--claude-root", claudeRoot]);
  const removed = imported(home);
  expect(removed.responses).toEqual([]);
  expect(removed.usage).toEqual(enriched.usage);
  expect(removed.history.sessions).toEqual(copied.history.sessions);
});

test("a reread whose files now hold other counts replaces the session's contribution with them", ({
  home,
  root,
}) => {
  keepLaunch(home);
  const claudeRoot = path.join(home, "claude");
  writeClaudeSession(
    claudeRoot,
    transcript()
      .withAssistant(assistant("unavailable", 3))
      .withAssistant(assistant("terminal", 8))
      .please(),
  );
  runImport(home, root, ["--claude-root", claudeRoot]);
  expect(imported(home).usage).toMatchObject({
    requests: 1,
    tokens: { output: null },
  });
  writeClaudeSession(
    claudeRoot,
    transcript()
      .withRow({ type: "system", sessionId })
      .withAssistant(assistant("terminal", 690, "tool_use"))
      .please(),
  );
  runImport(home, root, ["--claude-root", claudeRoot]);
  const reread = imported(home);
  expect(
    reread.responses[0]?.measurements.map(
      (item) => item.reported["output_tokens"],
    ),
  ).toEqual([690]);
  expect(reread.usage).toMatchObject({
    requests: 1,
    tokens: { output: 690 },
    unmeasured: { output: 0 },
  });
});
