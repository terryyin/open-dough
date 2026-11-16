// Native rows end at newline alone: a raw U+2028 or U+2029 inside row text
// keeps the row whole, and a genuinely broken row stays a gap at its file line.
import assert from "node:assert/strict";
import { appendFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { taskUsage } from "../../server/usageHistory.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
  expect,
  test,
  launch,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  readImported,
  runImport,
  writeClaudeSession,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";

const malformedRows = (history: ReturnType<typeof readImported>) =>
  history.gaps.filter((gap) => gap.code === "malformed-native-row");

test("counts a Claude Code row whose text holds line separators and the rows climbing through it", ({
  home,
  root,
}) => {
  const sessionId = "7a1f2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
  const reference = "8b2e3f4a-5b6c-4d7e-8f9a-0b1c2d3e4f5a";
  keepLaunchStore(home, {
    "open-dough": [
      makeMe.aLaunchRecord
        .adHoc({ title: "Separated rows" })
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
  const file = writeClaudeSession(
    claudeRoot,
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withLaunchInput({ reference, command: "report" })
      .withAssistant({
        uuid: "separated",
        messageId: "msg-separated",
        usage: { output_tokens: 11 },
        content: [{ type: "text", text: "first second third" }],
      })
      .withAssistant({
        uuid: "climbing",
        messageId: "msg-climbing",
        usage: { output_tokens: 13 },
      })
      .please(),
  );
  appendFileSync(file, '{"type":"assistant","uuid":"trunc');
  const truncatedLine = readFileSync(file, "utf8").split("\n").length;

  runImport(home, root, ["--claude-root", claudeRoot]);

  const history = readImported(home);
  const task = Object.values(history.tasks).find(
    (item) => item.kind === "launch",
  );
  assert(task);
  expect(taskUsage(history, task.id)).toEqual(
    expect.objectContaining({
      requests: 2,
      tokens: expect.objectContaining({ output: 24 }),
    }),
  );
  expect(malformedRows(history)).toEqual([
    expect.objectContaining({
      source: expect.objectContaining({ file, line: truncatedLine }),
    }),
  ]);
});

test("counts a Codex rollout whose row text holds a paragraph separator", ({
  home,
  root,
}) => {
  const session = "01a1c000-84ab-7240-a940-8a72564202cd";
  keepLaunchStore(home, { "open-dough": [launch(session, "task")] });
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession(session)
      .withDeveloperInput("before after")
      .withResponse("task", "own", { output_tokens: 17 })
      .please(),
  );

  runImport(home, root);

  const history = readImported(home);
  const task = Object.values(history.tasks).find(
    (item) => item.kind === "launch",
  );
  assert(task);
  expect(taskUsage(history, task.id).requests).toBe(1);
  expect(malformedRows(history)).toEqual([]);
});
