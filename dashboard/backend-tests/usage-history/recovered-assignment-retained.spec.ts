import assert from "node:assert/strict";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { usageHistoryDefaultAt } from "../../../Distribution/tests/support/codexRolloutTestData.mjs";
import {
  taskUsage,
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import {
  test,
  expect,
  launch,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  readImported,
  runImport,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";

const wrapperAt = "2026-11-14T08:00:00.000Z";
const launchAt = "2026-11-14T07:00:00.000Z";

test("retained launch is eligible despite wrapper rejection and unavailable sources never reject independent legacy starts", async ({
  home,
  root,
}) => {
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
      launchedAt: usageHistoryDefaultAt,
      title: "Independent fact",
      sources: [{ kind: "native", file: "/unavailable.jsonl", line: 6 }],
    })
    .please();
  await writeUsageHistory({ tasks: [independent] }, usageHistoryFile(home));
  runImport(home, root);
  const history = readImported(home);
  expect(history.tasks[independent.id]?.launchedAt).toBe(usageHistoryDefaultAt);
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
  expect(runImport(home, root)).toMatchObject({
    summary: { unsupportedAssignmentTasks: 0 },
  });
});
