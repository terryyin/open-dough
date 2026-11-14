import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import { test, expect } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  nativeFile,
  readImported,
  runImport,
} from "../../tests/usage-history/importHarness.ts";
const wrapperAt = "2026-11-14T08:00:00.000Z";
test("failed correction publication leaves prior assignment readable before a successful retry", async ({
  home,
  root,
}) => {
  const session = "atomic-correction";
  const file = nativeFile(root, session, [
    { type: "session_meta", payload: { id: session } },
    { type: "turn_context", payload: { turn_id: "turn" } },
    {
      type: "response_item",
      timestamp: wrapperAt,
      payload: {
        role: "user",
        content: [
          { text: "<recommended_plugins>context</recommended_plugins>" },
        ],
      },
    },
  ]);
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
  const preload = `data:text/javascript,${encodeURIComponent(`import fs from 'node:fs/promises'; import { syncBuiltinESMExports } from 'node:module'; const rename = fs.rename; fs.rename = async (source, target) => { if (target.endsWith('/usage.json')) throw new Error('injected correction failure'); return rename(source, target); }; syncBuiltinESMExports();`)}`;
  expect(() => runImport(home, root, [], ["--import", preload])).toThrow(
    "injected correction failure",
  );
  expect(readImported(home)).toEqual(before);
  runImport(home, root);
  expect(readImported(home).tasks[task.id]).toMatchObject({
    launchedAt: null,
    gaps: expect.arrayContaining(["unsupported-task-assignment"]),
  });
});
