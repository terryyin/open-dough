// What the usage history stores after the offline import
// (../../server/usageHistory.ts): one document of tasks, coverage gaps and
// one contribution per native session whose responses name a task, and no
// response. A session read again, by the import or another writer, replaces
// its contribution; a session whose rollout is gone keeps it; and a rollout
// moved to the archived root is still one session. What a new task adds to
// the document is ./session-contribution-growth.spec.ts.
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
  test,
  expect,
  launch,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  nodeProcess,
  readImported,
  runImport,
  sessionTotals,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";

const used = (output: number) => ({
  input_tokens: 10,
  cached_input_tokens: 4,
  cache_write_input_tokens: 1,
  output_tokens: output,
});

test("an import stores one document with a contribution per session by model and effort, and no response or page", ({
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

  expect(runImport(home, root)).toMatchObject({ tasks: 1, observations: 4 });

  const store = usageHistoryFile(home);
  const text = readFileSync(store, "utf8");
  const [task] = Object.values(readImported(home).tasks);
  assert(task);
  expect(existsSync(`${store}.pages`)).toBe(false);
  expect(text).not.toMatch(/response-(one|two|three|stray)/);
  const document = JSON.parse(text) as ReturnType<typeof readImported>;
  expect(Object.keys(document)).toEqual([
    "format",
    "tasks",
    "sessions",
    "gaps",
  ]);
  expect(document.format).toBe("usage-history-v2");
  expect(document.tasks[task.id]?.sources.length).toBeGreaterThan(0);
  expect(JSON.stringify(document.sessions)).not.toContain(file);
  expect(document.sessions).toEqual({
    "codex:stored": {
      host: "codex",
      sessionId: "stored",
      entries: [
        {
          candidates: [task.id],
          model: "model-a",
          effort: "low",
          tier: null,
          responses: 2,
          tokens: { uncachedInput: 5, cacheRead: 4, cacheWrite: 1, output: 5 },
          missing: { uncachedInput: 1, cacheRead: 1, cacheWrite: 1, output: 0 },
          unmeasured: 1,
          lastAt: "2026-11-14T10:00:00.000Z",
        },
        {
          candidates: [task.id],
          model: "model-b",
          effort: "high",
          tier: null,
          responses: 1,
          tokens: { uncachedInput: 5, cacheRead: 4, cacheWrite: 1, output: 5 },
          missing: { uncachedInput: 0, cacheRead: 0, cacheWrite: 0, output: 0 },
          unmeasured: 0,
          lastAt: "2026-11-14T12:00:00.000Z",
        },
      ],
    },
  });
});

test("a session read again by the import or passed again by another writer replaces its contribution, changes no task total and, unchanged, leaves the file as it is", ({
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
  runImport(home, root);
  const once = readImported(home);
  expect(sessionTotals(once)).toEqual([
    ["first", 2, 4],
    ["second", 2, 14],
  ]);

  runImport(home, root);
  const twice = readImported(home);
  expect(sessionTotals(twice)).toEqual(sessionTotals(once));

  const sessions = {
    observations: Object.values(twice.observations),
    associations: Object.values(twice.associations),
  };
  // The file as it stands: a write that changes nothing replaces nothing.
  const file = () => {
    const { ino, mtimeNs } = statSync(usageHistoryFile(home), { bigint: true });
    return [ino, mtimeNs];
  };
  const stored = file();
  nodeProcess(
    home,
    `const { writeUsageHistory } = await import('./dashboard/server/usageHistory.ts'); await writeUsageHistory(${JSON.stringify(sessions)});`,
  );
  const written = readImported(home);
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
  runImport(home, root);
  const before = readImported(home);
  const summary = await deriveUsageTaskSummary(usageHistoryFile(home));
  expect(sessionTotals(before)).toEqual([
    ["kept", 1, 2],
    ["removed", 2, 7],
  ]);

  rmSync(rollout);
  expect(runImport(home, root)).toMatchObject({ tasks: 2, observations: 1 });

  const after = readImported(home);
  expect(sessionTotals(after)).toEqual(sessionTotals(before));
  expect(after.sessions).toEqual(before.sessions);
  const usage = (
    await deriveUsageTaskSummary(usageHistoryFile(home))
  ).tasks.map((task) => [task.id, task.usage]);
  expect(usage).toEqual(summary.tasks.map((task) => [task.id, task.usage]));
  expect(usage.map(([, groups]) => groups)).toMatchObject([
    [{ responses: 1 }],
    [{ model: "model-a", effort: "low", root: true, responses: 2 }],
  ]);
});

test("a rollout moved from the live root to the archived root is counted once", ({
  home,
  root,
}) => {
  keepOperationalLaunch(home, launch("moved", "turn"));
  const live = path.join(root, "sessions/2026/11/14");
  const archived = path.join(root, "archived_sessions");
  const roots = ["--codex-root", archived];
  const rollout = writeCodexSession(
    live,
    makeMe.aCodexRollout
      .forSession("moved")
      .withResponse("turn", "moved-one", used(2))
      .withResponse("turn", "moved-two", used(3))
      .please(),
  );
  runImport(home, path.join(root, "sessions"), roots);
  const before = readImported(home);
  expect(sessionTotals(before)).toEqual([["moved", 2, 5]]);

  mkdirSync(archived, { recursive: true });
  renameSync(rollout, path.join(archived, path.basename(rollout)));
  expect(runImport(home, path.join(root, "sessions"), roots)).toMatchObject({
    observations: 2,
  });

  const after = readImported(home);
  expect(sessionTotals(after)).toEqual([["moved", 2, 5]]);
  expect(after.sessions).toEqual(before.sessions);
});
