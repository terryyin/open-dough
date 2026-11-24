import assert from "node:assert/strict";
import { readFileSync, rmSync } from "node:fs";
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
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  legacyHistory,
  writeLegacyStore,
} from "../../test-support/usage-history/earlierStores.ts";
import { writeCodexSession } from "../../test-support/usage-history/importHarness.ts";

const wrapperAt = "2026-11-14T08:00:00.000Z";
const pluginWrapper = {
  type: "response_item",
  timestamp: wrapperAt,
  payload: {
    role: "user",
    content: [{ text: "<recommended_plugins>context</recommended_plugins>" }],
  },
};

test("legacy effective association without candidates survives beside a rejected task when neither response is rescanned", async ({
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
  for (const session of ["valid-legacy", "bad-legacy"]) {
    writeCodexSession(
      root,
      makeMe.aCodexRollout
        .forSession(session)
        .withTurnContext("turn")
        .withRow({
          type: "response_item",
          timestamp: wrapperAt,
          payload: { role: "user", content: [{ text: "Do the task" }] },
        })
        .withResponse("turn", session, { output_tokens: 6 })
        .please(),
    );
  }
  await importUsageHistory(options);
  const prior = {
    ...(await readUsageHistory(store)),
    ...(JSON.parse(readFileSync(responses, "utf8")) as UsageResponses),
  };
  for (const task of Object.values(prior.tasks)) delete task.assignmentEvidence;
  const valid = Object.values(prior.tasks).find(
    (task) => task.sessionId === "valid-legacy",
  );
  const invalid = Object.values(prior.tasks).find(
    (task) => task.sessionId === "bad-legacy",
  );
  assert(valid && invalid);
  const association = Object.values(prior.associations).find(
    (item) => item.taskId === valid.id,
  );
  assert(association);
  association.candidates = [];
  // Literal legacy effective-only association is the compatibility promise.
  writeLegacyStore(home, legacyHistory(prior));
  rmSync(`${root}/valid-legacy.jsonl`);
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("bad-legacy")
      .withTurnContext("turn")
      .withRow(pluginWrapper)
      .please(),
  );
  await importUsageHistory(options);
  const after = await readUsageHistory(store);
  const { observations } = JSON.parse(
    readFileSync(responses, "utf8"),
  ) as UsageResponses;
  expect(observations).toEqual({});
  expect(taskUsage(after, valid.id)).toMatchObject({
    requests: 1,
    tokens: { output: 6 },
  });
  expect(after.sessions["codex:valid-legacy"]?.entries).toMatchObject([
    { candidates: [valid.id], responses: 1 },
  ]);
  expect(after.sessions["codex:bad-legacy"]?.entries).toMatchObject([
    { candidates: [invalid.id], responses: 1 },
  ]);
  expect(taskUsage(after, invalid.id).requests).toBe(0);
});

test("independent retained assignment sources preserve eligibility when their native row disappears", async ({
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
  const session = "independent-assignment";
  const file = writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession(session)
      .withTurnContext("turn")
      .withRow(pluginWrapper)
      .withRow({
        type: "response_item",
        payload: { role: "user", content: [{ text: "$dough-slice-planning" }] },
      })
      .withResponse("turn", "retained", { output_tokens: 8 })
      .please(),
  );
  await importUsageHistory(options);
  const prior = {
    ...(await readUsageHistory(store)),
    ...(JSON.parse(readFileSync(responses, "utf8")) as UsageResponses),
  };
  const task = Object.values(prior.tasks)[0];
  assert(task);
  // Old decoder retained both field sources while its monotonic start kept the wrapper time.
  delete task.assignmentEvidence;
  task.launchedAt = wrapperAt;
  task.fieldSources = {
    ...task.fieldSources,
    launchedAt: [
      { kind: "native", file, line: 3 },
      { kind: "native", file, line: 4 },
    ],
  };
  writeLegacyStore(home, legacyHistory(prior));
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession(session)
      .withTurnContext("turn")
      .withRow(pluginWrapper)
      .please(),
  );
  await importUsageHistory(options);
  const after = await readUsageHistory(store);
  expect(after.tasks[task.id]).toMatchObject({
    launchedAt: null,
    workflow: "dough-slice-planning",
    fieldSources: { launchedAt: task.fieldSources.launchedAt },
  });
  expect(after.tasks[task.id]?.gaps).not.toContain(
    "unsupported-task-assignment",
  );
  expect(taskUsage(after, task.id).tokens.output).toBe(8);
  const { observations } = JSON.parse(
    readFileSync(responses, "utf8"),
  ) as UsageResponses;
  expect(observations).toEqual({});
  rmSync(root, { recursive: true });
  await importUsageHistory(options);
  const missing = await readUsageHistory(store);
  expect(missing.sessions).toEqual(after.sessions);
  expect(taskUsage(missing, task.id).tokens.output).toBe(8);
});
