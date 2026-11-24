// Native rows end at newline alone: a raw U+2028 or U+2029 inside row text
// keeps the row whole.
import assert from "node:assert/strict";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  taskUsage,
  usageHistoryFile,
} from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  expect,
  test,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  writeClaudeSession,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";

test("counts a Claude Code row whose text holds line separators and the rows climbing through it", async ({
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
  writeClaudeSession(
    claudeRoot,
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withLaunchInput({ reference, command: "report" })
      .withAssistantHoldingLineSeparators()
      .withCountedAssistant()
      .please(),
  );

  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: [claudeRoot],
    })
    .please();
  await importUsageHistory(options);

  const history = await readUsageHistory(options.store);
  const task = Object.values(history.tasks).find(
    (item) => item.kind === "launch",
  );
  assert(task);
  expect(taskUsage(history, task.id).requests).toBe(2);
});

test("counts a Codex rollout whose row text holds a paragraph separator", async ({
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

  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  await importUsageHistory(options);

  const history = await readUsageHistory(options.store);
  const task = Object.values(history.tasks).find(
    (item) => item.kind === "launch",
  );
  assert(task);
  expect(taskUsage(history, task.id).requests).toBe(1);
});
