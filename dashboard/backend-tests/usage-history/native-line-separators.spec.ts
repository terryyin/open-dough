// Native rows end at newline alone: a raw U+2028 or U+2029 inside row text
// keeps the row whole.
import assert from "node:assert/strict";
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
  writeClaudeSession(
    path.join(home, "claude"),
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withLaunchInput({ reference, command: "report" })
      .withAssistantHoldingLineSeparators()
      .withAssistant()
      .please(),
  );

  runImport(home, root, ["--claude-root", path.join(home, "claude")]);

  const history = readImported(home);
  const task = Object.values(history.tasks).find(
    (item) => item.kind === "launch",
  );
  assert(task);
  expect(taskUsage(history, task.id).requests).toBe(2);
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
      .withDeveloperInputHoldingLineSeparators()
      .withResponse("task", "own")
      .please(),
  );

  runImport(home, root);

  const history = readImported(home);
  const task = Object.values(history.tasks).find(
    (item) => item.kind === "launch",
  );
  assert(task);
  expect(taskUsage(history, task.id).requests).toBe(1);
});
