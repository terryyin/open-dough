import assert from "node:assert/strict";
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  taskUsage,
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";
import {
  test,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";

const wrapperAt = "2026-11-14T08:00:00.000Z";
const launchAt = "2026-11-14T07:00:00.000Z";

test("retained launch is eligible despite wrapper rejection and unavailable sources never reject independent legacy starts", async ({
  home,
  root,
}) => {
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  const { store } = options;
  keepOperationalLaunch(home, launch("retained", "retained-turn", launchAt));
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("retained")
      .withTurnContext("retained-turn")
      .withRow({
        type: "response_item",
        timestamp: wrapperAt,
        payload: {
          role: "user",
          content: [
            { text: "<recommended_plugins>plugin list</recommended_plugins>" },
          ],
        },
      })
      .withResponse("retained-turn", "answer", { output_tokens: 4 })
      .please(),
  );
  const independent = makeMe.aUsageTask
    .with({
      id: "legacy-independent",
      sessionId: "unavailable",
      title: "Independent fact",
      sources: [{ kind: "native", file: "/unavailable.jsonl", line: 6 }],
    })
    .please();
  await writeUsageHistory({ tasks: [independent] }, store);
  await importUsageHistory(options);
  const history = await readUsageHistory(store);
  expect(history.tasks[independent.id]?.launchedAt).toBe(
    "2026-11-14T10:00:00.000Z",
  );
  expect(history.tasks[independent.id]?.gaps).not.toContain(
    "unsupported-task-assignment",
  );
  const retained = Object.values(history.tasks).find(
    (task) => task.sessionId === "retained",
  );
  assert(retained);
  expect(retained).toMatchObject({
    kind: "launch",
    launchedAt: launchAt,
    assignmentEvidence: [expect.objectContaining({ status: "rejected" })],
  });
  expect(taskUsage(history, retained.id).tokens.output).toBe(4);
  expect(await importUsageHistory(options)).toMatchObject({
    summary: { unsupportedAssignmentTasks: 0 },
  });
});
