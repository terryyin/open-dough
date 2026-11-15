import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import { test, expect } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  failing,
  readImported,
  runImport,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";

const wrapperAt = "2026-11-14T08:00:00.000Z";

test("failed correction publication leaves prior assignment readable before a successful retry", async ({
  home,
  root,
}) => {
  const session = "atomic-correction";
  const file = writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession(session)
      .withTurnContext("turn")
      .withRow({
        type: "response_item",
        timestamp: wrapperAt,
        payload: {
          role: "user",
          content: [
            { text: "<recommended_plugins>context</recommended_plugins>" },
          ],
        },
      })
      .please(),
  );
  const task = makeMe.aUsageTask
    .with({
      id: JSON.stringify(["codex", session, "turn"]),
      sessionId: session,
      rootTurnId: "turn",
      launchedAt: wrapperAt,
      fieldSources: { launchedAt: [{ kind: "native", file, line: 3 }] },
    })
    .please();
  await writeUsageHistory({ tasks: [task] }, usageHistoryFile(home));
  const before = readImported(home);
  expect(() =>
    runImport(home, root, [], failing("rename", "/usage.json")),
  ).toThrow("injected rename failure");
  expect(readImported(home)).toEqual(before);
  runImport(home, root);
  expect(readImported(home).tasks[task.id]).toMatchObject({
    launchedAt: null,
    gaps: expect.arrayContaining(["unsupported-task-assignment"]),
  });
});
