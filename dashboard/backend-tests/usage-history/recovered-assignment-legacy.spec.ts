import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { taskUsage, usageHistoryFile } from "../../server/usageHistory.ts";
import {
  test,
  expect,
  response,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  at,
  nativeFile,
  readImported,
  runImport,
} from "../../tests/usage-history/importHarness.ts";
const wrapperAt = "2026-11-14T08:00:00.000Z";
test("legacy effective association without candidates survives beside a rejected task when neither response is rescanned", ({
  home,
  root,
}) => {
  for (const session of ["valid-legacy", "bad-legacy"]) {
    nativeFile(root, session, [
      { type: "session_meta", payload: { id: session } },
      { type: "turn_context", payload: { turn_id: "turn" } },
      {
        type: "response_item",
        timestamp: wrapperAt,
        payload: { role: "user", content: [{ text: "Do the task" }] },
      },
      response(session, "turn", session, { output_tokens: 6 }),
    ]);
  }
  runImport(home, root);
  const prior = readImported(home);
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
  const store = usageHistoryFile(home);
  writeFileSync(store, JSON.stringify(prior));
  rmSync(`${root}/valid-legacy.jsonl`);
  nativeFile(root, "bad-legacy", [
    { type: "session_meta", payload: { id: "bad-legacy" } },
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
  runImport(home, root);
  const after = readImported(home);
  expect(after.observations).toEqual(prior.observations);
  expect(taskUsage(after, valid.id).tokens.output).toBe(6);
  expect(after.associations[association.observationId]).toMatchObject({
    taskId: valid.id,
    candidates: [valid.id],
    sources: association.sources,
  });
  expect(taskUsage(after, invalid.id).requests).toBe(0);
});

test("independent retained assignment sources preserve eligibility when their native row disappears", ({
  home,
  root,
}) => {
  const session = "independent-assignment";
  const meta = { type: "session_meta", payload: { id: session } };
  const turn = { type: "turn_context", payload: { turn_id: "turn" } };
  const wrapper = {
    type: "response_item",
    timestamp: wrapperAt,
    payload: {
      role: "user",
      content: [{ text: "<recommended_plugins>context</recommended_plugins>" }],
    },
  };
  const file = nativeFile(root, session, [
    meta,
    turn,
    wrapper,
    {
      type: "response_item",
      timestamp: at,
      payload: { role: "user", content: [{ text: "$dough-slice-planning" }] },
    },
    response(session, "turn", "retained", { output_tokens: 8 }),
  ]);
  runImport(home, root);
  const prior = readImported(home);
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
  writeFileSync(usageHistoryFile(home), JSON.stringify(prior));
  nativeFile(root, session, [meta, turn, wrapper]);
  runImport(home, root);
  const after = readImported(home);
  expect(after.tasks[task.id]).toMatchObject({
    launchedAt: null,
    workflow: "dough-slice-planning",
    fieldSources: { launchedAt: task.fieldSources.launchedAt },
  });
  expect(after.tasks[task.id]?.gaps).not.toContain(
    "unsupported-task-assignment",
  );
  expect(taskUsage(after, task.id).tokens.output).toBe(8);
  expect(after.observations).toEqual(prior.observations);
  rmSync(root, { recursive: true });
  runImport(home, root);
  expect(readImported(home).associations).toEqual(after.associations);
});
