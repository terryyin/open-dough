// A session read again while its task's assignment does not hold keeps the
// task as its contribution's candidate, so the task regains the usage from
// later launch evidence after the rollout is gone.
import { readFileSync, rmSync } from "node:fs";
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
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import {
  test,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";

const wrapperAt = "2026-11-14T08:00:00.000Z";

test("usage charged to a task, withdrawn by a rejection whose import reads the rollout again, returns with a launch record after the rollout is removed", async ({
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
  const session = "rescanned";
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
      .withResponse("turn", "one", { output_tokens: 9 })
      .please(),
  );
  // An earlier decoder took the wrapper for the task's start and charged it.
  const task = makeMe.aUsageTask
    .with({
      id: JSON.stringify(["codex", session, "turn"]),
      sessionId: session,
      rootTurnId: "turn",
      launchedAt: wrapperAt,
      fieldSources: { launchedAt: [{ kind: "native", file, line: 3 }] },
    })
    .please();
  const observation = makeMe.aUsageObservation
    .with({ sessionId: session, responseId: "one", tokens: { output: 9 } })
    .please();
  const response = observation.id;
  await writeUsageHistory(
    {
      tasks: [task],
      observations: [observation],
      associations: [
        makeMe.aUsageAssociation.with({ observation, task }).please(),
      ],
    },
    store,
  );
  expect(taskUsage(await readUsageHistory(store), task.id).requests).toBe(1);

  await importUsageHistory(options);

  const withdrawn = await readUsageHistory(store);
  const { associations } = JSON.parse(
    readFileSync(responses, "utf8"),
  ) as UsageResponses;
  expect(withdrawn.tasks[task.id]?.gaps).toContain(
    "unsupported-task-assignment",
  );
  expect(taskUsage(withdrawn, task.id).requests).toBe(0);
  expect(associations[response]).toMatchObject({
    taskId: null,
    candidates: [task.id],
    gaps: expect.arrayContaining(["unsupported-task-assignment"]) as unknown,
  });
  expect(withdrawn.sessions[`codex:${session}`]?.entries).toMatchObject([
    { candidates: [task.id], responses: 1, tokens: { output: 9 } },
  ]);

  rmSync(root, { recursive: true });
  keepOperationalLaunch(
    home,
    launch(session, "turn", "2026-11-14T07:00:00.000Z"),
  );
  await importUsageHistory(options);

  const regained = await readUsageHistory(store);
  const { observations } = JSON.parse(
    readFileSync(responses, "utf8"),
  ) as UsageResponses;
  expect(regained.tasks[task.id]).toMatchObject({ kind: "launch" });
  expect(regained.tasks[task.id]?.gaps).not.toContain(
    "unsupported-task-assignment",
  );
  expect(observations).toEqual({});
  expect(taskUsage(regained, task.id)).toMatchObject({
    requests: 1,
    tokens: { output: 9 },
  });
});
