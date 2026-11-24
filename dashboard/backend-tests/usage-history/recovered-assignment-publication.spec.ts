import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";
import {
  test,
  expect,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import { writeCodexSession } from "../../test-support/usage-history/importHarness.ts";

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
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  const { store } = options;
  await writeUsageHistory({ tasks: [task] }, store);
  const bytes = readFileSync(store);
  const before = await readUsageHistory(store);
  const rename = fs.rename;
  fs.rename = async (source, target) => {
    if (target === store) throw new Error("injected rename failure");
    return rename(source, target);
  };
  syncBuiltinESMExports();
  try {
    await expect(importUsageHistory(options)).rejects.toThrow(
      "injected rename failure",
    );
  } finally {
    fs.rename = rename;
    syncBuiltinESMExports();
  }
  expect(readFileSync(store)).toEqual(bytes);
  expect(await readUsageHistory(store)).toEqual(before);
  await importUsageHistory(options);
  expect((await readUsageHistory(store)).tasks[task.id]).toMatchObject({
    launchedAt: null,
    gaps: expect.arrayContaining(["unsupported-task-assignment"]),
  });
});
