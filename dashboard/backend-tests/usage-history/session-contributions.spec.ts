// The usage history keeps each session's contribution as native evidence is
// replayed, removed or archived. Growth is covered in session-contribution-growth.spec.ts.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  usageHistoryFile,
  writeUsageHistory,
  type UsageHistory,
} from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  test,
  expect,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  sessionTotals,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";

const importOptions = (home: string, ...codexRoots: string[]) =>
  makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots,
      claudeRoots: claudeUsageRoots(home),
    })
    .please();

const used = (output: number) => ({
  input_tokens: 10,
  cached_input_tokens: 4,
  cache_write_input_tokens: 1,
  output_tokens: output,
});

test("an import stores one document with a contribution per session by model and effort, and no response or page", async ({
  home,
  root,
}) => {
  keepOperationalLaunch(home, launch("stored", "turn"));
  const file = writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("stored")
      .withTurnContext("turn", "model-a", "low")
      .withResponse("turn", "response-one", used(2))
      .withResponse("turn", "response-two", { output_tokens: 3 })
      .withTurnContext("turn", "model-b", "high")
      .withResponse("turn", "response-three", used(5), {
        timestamp: "2026-11-14T12:00:00.000Z",
      })
      .please(),
  );
  // A session whose responses name no task leaves no contribution.
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("unassigned")
      .withResponse("other-turn", "response-stray", used(9))
      .please(),
  );

  const options = importOptions(home, root);
  const report = await importUsageHistory(options);
  expect(report).toMatchObject({ tasks: 1, observations: 4 });
  const { store } = options;
  const text = fs.readFileSync(store, "utf8");
  const [task] = Object.values((await readUsageHistory(store)).tasks);
  assert(task);
  expect(fs.existsSync(`${store}.pages`)).toBe(false);
  expect(text).not.toMatch(/response-(one|two|three|stray)/);
  const document = JSON.parse(text) as UsageHistory;
  const fields = Object.keys(document);
  expect(fields).toEqual(["format", "tasks", "sessions", "gaps"]);
  expect(document.format).toBe("usage-history-v2");
  expect(document.tasks[task.id]?.sources.length).toBeGreaterThan(0);
  expect(JSON.stringify(document.sessions)).not.toContain(file);
  const tokens = { uncachedInput: 5, cacheRead: 4, cacheWrite: 1, output: 5 };
  const entry = { candidates: [task.id], tier: null, tokens };
  expect(document.sessions).toEqual({
    "codex:stored": {
      host: "codex",
      sessionId: "stored",
      entries: [
        {
          ...entry,
          model: "model-a",
          effort: "low",
          responses: 2,
          missing: { uncachedInput: 1, cacheRead: 1, cacheWrite: 1, output: 0 },
          unmeasured: 1,
          lastAt: "2026-11-14T10:00:00.000Z",
        },
        {
          ...entry,
          model: "model-b",
          effort: "high",
          responses: 1,
          missing: { uncachedInput: 0, cacheRead: 0, cacheWrite: 0, output: 0 },
          unmeasured: 0,
          lastAt: "2026-11-14T12:00:00.000Z",
        },
      ],
    },
  });
});

test("a session read again by the import or passed again by another writer replaces its contribution, changes no task total and, unchanged, leaves the file as it is", async ({
  home,
  root,
}) => {
  keepLaunchStore(home, {
    "open-dough": [launch("first", "turn"), launch("second", "turn")],
  });
  for (const [session, output] of [
    ["first", 2],
    ["second", 7],
  ] as const)
    writeCodexSession(
      root,
      makeMe.aCodexRollout
        .forSession(session)
        .withResponse("turn", `${session}-one`, used(output))
        .withResponse("turn", `${session}-two`, used(output))
        .please(),
    );
  const options = importOptions(home, root);
  const { store, responses } = options;
  await importUsageHistory(options);
  const once = await readUsageHistory(store);
  expect(sessionTotals(once)).toEqual([
    ["first", 2, 4],
    ["second", 2, 14],
  ]);

  await importUsageHistory(options);
  const twice = await readUsageHistory(store);
  expect(sessionTotals(twice)).toEqual(sessionTotals(once));

  const { observations, associations } = JSON.parse(
    fs.readFileSync(responses, "utf8"),
  ) as UsageResponses;
  // The file as it stands: a write that changes nothing replaces nothing.
  const file = () => {
    const { ino, mtimeNs } = fs.statSync(store, { bigint: true });
    return [ino, mtimeNs];
  };
  const stored = file();
  const replay = {
    observations: Object.values(observations),
    associations: Object.values(associations),
  };
  await writeUsageHistory(replay, store);
  const written = await readUsageHistory(store);
  expect(sessionTotals(written)).toEqual(sessionTotals(once));
  expect(written.sessions).toEqual(once.sessions);
  expect(file()).toEqual(stored);
});

test("a task whose rollout was deleted keeps its totals and its usage in the task summary", async ({
  home,
  root,
}) => {
  keepLaunchStore(home, {
    "open-dough": [launch("kept", "turn"), launch("removed", "turn")],
  });
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("kept")
      .withResponse("turn", "kept-one", used(2))
      .please(),
  );
  const rollout = writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("removed")
      .withTurnContext("turn", "model-a", "low")
      .withResponse("turn", "removed-one", used(3))
      .withResponse("turn", "removed-two", used(4))
      .please(),
  );
  const options = importOptions(home, root);
  const { store } = options;
  await importUsageHistory(options);
  const before = await readUsageHistory(store);
  const summary = await deriveUsageTaskSummary(store);
  expect(sessionTotals(before)).toEqual([
    ["kept", 1, 2],
    ["removed", 2, 7],
  ]);

  fs.rmSync(rollout);
  const report = await importUsageHistory(options);
  expect(report).toMatchObject({ tasks: 2, observations: 1 });

  const after = await readUsageHistory(store);
  expect(sessionTotals(after)).toEqual(sessionTotals(before));
  expect(after.sessions).toEqual(before.sessions);
  const current = await deriveUsageTaskSummary(store);
  const usage = current.tasks.map(({ id, usage }) => [id, usage]);
  expect(usage).toEqual(summary.tasks.map(({ id, usage }) => [id, usage]));
  expect(usage.map(([, groups]) => groups)).toMatchObject([
    [{ responses: 1 }],
    [{ model: "model-a", effort: "low", root: true, responses: 2 }],
  ]);
});

test("a rollout moved from the live root to the archived root is counted once", async ({
  home,
  root,
}) => {
  keepOperationalLaunch(home, launch("moved", "turn"));
  const live = path.join(root, "sessions/2026/11/14");
  const archived = path.join(root, "archived_sessions");
  const options = importOptions(home, path.join(root, "sessions"), archived);
  const rollout = writeCodexSession(
    live,
    makeMe.aCodexRollout
      .forSession("moved")
      .withResponse("turn", "moved-one", used(2))
      .withResponse("turn", "moved-two", used(3))
      .please(),
  );
  await importUsageHistory(options);
  const before = await readUsageHistory(options.store);
  expect(sessionTotals(before)).toEqual([["moved", 2, 5]]);

  fs.mkdirSync(archived, { recursive: true });
  fs.renameSync(rollout, path.join(archived, path.basename(rollout)));
  const { observations } = await importUsageHistory(options);
  expect(observations).toBe(2);

  const after = await readUsageHistory(options.store);
  expect(sessionTotals(after)).toEqual([["moved", 2, 5]]);
  expect(after.sessions).toEqual(before.sessions);
});
