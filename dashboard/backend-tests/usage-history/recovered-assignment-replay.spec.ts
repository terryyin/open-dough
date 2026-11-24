import { readFileSync, rmSync } from "node:fs";
import assert from "node:assert/strict";
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
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import {
  test,
  expect,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";

const wrapperAt = "2026-11-14T08:00:00.000Z";
const launchAt = "2026-11-14T07:00:00.000Z";
const wrapper = {
  type: "response_item",
  timestamp: wrapperAt,
  payload: {
    role: "user",
    content: [
      { text: "<recommended_plugins>PRIVATE-PLUGIN</recommended_plugins>" },
    ],
  },
};

test("rejected assignment survives missing inputs, later genuine assignment restores eligibility and launch timing stays authoritative", async ({
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
  const { store, responses } = options;
  const session = "replay";
  const rejected = makeMe.aCodexRollout
    .forSession(session)
    .withTurnContext("turn")
    .withRow(wrapper)
    .withResponse("turn", "one", { output_tokens: 9 })
    .please();
  writeCodexSession(root, rejected);
  await importUsageHistory(options);
  const corrected = {
    ...(await readUsageHistory(store)),
    ...(JSON.parse(readFileSync(responses, "utf8")) as UsageResponses),
  };
  const task = Object.values(corrected.tasks)[0];
  assert(task);
  expect(task.launchedAt).toBeNull();
  expect(taskUsage(corrected, task.id).requests).toBe(0);
  rmSync(root, { recursive: true });
  expect({
    ...(await readUsageHistory(store)),
    ...(JSON.parse(readFileSync(responses, "utf8")) as UsageResponses),
  }).toEqual(corrected);
  await importUsageHistory(options);
  const missing = await readUsageHistory(store);
  expect(missing.tasks).toEqual(corrected.tasks);
  expect(missing.sessions).toEqual(corrected.sessions);
  expect(taskUsage(missing, task.id).requests).toBe(0);
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession(session)
      .withTurnContext("turn")
      .withRow(wrapper)
      .withRow({
        type: "response_item",
        payload: {
          role: "user",
          content: [
            {
              text: "<environment_context>PRIVATE-CONTEXT</environment_context>\nDo this genuine work",
            },
          ],
        },
      })
      .withResponse("turn", "one", { output_tokens: 9 })
      .please(),
  );
  await importUsageHistory(options);
  const supported = await readUsageHistory(store);
  expect(Object.keys(supported.tasks)).toEqual([task.id]);
  expect(supported.tasks[task.id]).toMatchObject({
    launchedAt: "2026-11-14T10:00:00.000Z",
    assignmentEvidence: expect.arrayContaining([
      expect.objectContaining({ status: "rejected", at: wrapperAt }),
      expect.objectContaining({
        status: "supported",
        at: "2026-11-14T10:00:00.000Z",
      }),
    ]),
  });
  expect(taskUsage(supported, task.id).tokens.output).toBe(9);
  keepOperationalLaunch(home, launch(session, "turn", launchAt));
  const operational = `${home}/.open-dough/dashboard/agent-launches.json`;
  const bytes = readFileSync(operational, "utf8");
  await importUsageHistory(options);
  const retained = await readUsageHistory(store);
  expect(retained.tasks[task.id]).toMatchObject({
    kind: "launch",
    launchedAt: launchAt,
  });
  expect(retained.tasks[task.id]?.assignmentEvidence).toEqual(
    supported.tasks[task.id]?.assignmentEvidence,
  );
  expect(taskUsage(retained, task.id).tokens.output).toBe(9);
  expect(readFileSync(operational, "utf8")).toBe(bytes);
  rmSync(root, { recursive: true });
  await importUsageHistory(options);
  const removed = await readUsageHistory(store);
  expect(removed.tasks[task.id]).toEqual(retained.tasks[task.id]);
  expect(taskUsage(removed, task.id).tokens.output).toBe(9);
});
