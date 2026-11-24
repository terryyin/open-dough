import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect } from "vitest";
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
import { test } from "../../test-support/usage-history/retainedUsageTest.ts";
import { writeCodexSession } from "../../test-support/usage-history/importHarness.ts";
import { configuredRepository } from "../../test-support/usage-history/recoveryHarness.ts";

test("uses recorded repository evidence for a deleted worktree and leaves unavailable revisions and unknown projects honest", async ({
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
  const seed = ".planning/seeds/SEED-42-title.md";
  const repo = await configuredRepository(
    home,
    makeMe.aRepository
      .withRevision("then", {
        files: {
          [seed]:
            '---\nid: SEED-42\n---\n# Seed\n<a id="story"></a>\n### Historical title\n**Identity:** SEED-42#story\n',
        },
      })
      .withRevision("now", {
        files: {
          [seed]:
            '---\nid: SEED-42\n---\n# Seed\n<a id="story"></a>\n### Current misleading title\n**Identity:** SEED-42#story\n',
        },
      })
      .please(),
  );
  const early = "2026-09-01T00:00:00.000Z";
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("deleted-worktree")
      .withCwd(path.join(home, "retired/SEED-42-story"))
      .withGit({
        repository_url: "https://github.com/example/historic.git",
        commit_hash: repo.revisions.then,
      })
      .withTurnContext("old-task")
      .withRow({
        type: "event_msg",
        timestamp: early,
        payload: {
          type: "user_message",
          message: "$dough-slice-planning .planning/seeds/SEED-42-title.md",
        },
      })
      .withResponse(
        "old-task",
        "before-cutoff",
        { output_tokens: 1000 },
        {
          timestamp: early,
        },
      )
      .withRow({
        type: "event_msg",
        payload: { type: "task_complete", turn_id: "old-task" },
      })
      .please(),
  );
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("owning-worker")
      .withParent("deleted-worktree")
      .withResponse(
        "worker-turn",
        "in-window",
        { output_tokens: 7 },
        {
          rootTurnId: "old-task",
        },
      )
      .please(),
  );
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("missing-objects")
      .withCwd(repo.integration)
      .withGit({ commit_hash: "f".repeat(40) })
      .withTurnContext("unsettled")
      .withRow({
        type: "event_msg",
        payload: {
          type: "user_message",
          message: "$dough-story-refinement SEED-42#story",
        },
      })
      .withResponse("unsettled", "unknown-title", { output_tokens: 2 })
      .please(),
  );
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("unknown-project")
      .withCwd(path.join(home, "missing/historic"))
      .withTurnContext("unknown-project-task")
      .withRow({
        type: "event_msg",
        timestamp: undefined,
        payload: {
          type: "user_message",
          message: "$dough-execute-plan SEED-42#story",
        },
      })
      .withResponse("unknown-project-task", "unknown-project-answer", {
        output_tokens: 3,
      })
      .please(),
  );
  await importUsageHistory(options);
  const history = {
    ...(await readUsageHistory(store)),
    ...(JSON.parse(readFileSync(responses, "utf8")) as UsageResponses),
  };
  const tasks = Object.values(history.tasks);
  const deleted = tasks.find((task) => task.sessionId === "deleted-worktree");
  const missing = tasks.find((task) => task.sessionId === "missing-objects");
  const unknown = tasks.find((task) => task.sessionId === "unknown-project");
  assert(deleted && missing && unknown);
  expect(deleted).toEqual(
    expect.objectContaining({
      project: "historic",
      identity: "SEED-42#story",
      title: "Historical title",
      launchedAt: early,
      lastActivityAt: "2026-11-14T10:00:00.000Z",
      outcome: null,
    }),
  );
  expect(taskUsage(history, deleted.id).tokens.output).toBe(7);
  expect(missing).toEqual(
    expect.objectContaining({
      identity: null,
      title: null,
      gaps: expect.arrayContaining(["unresolved-historical-story"]) as unknown,
    }),
  );
  expect(unknown).toEqual(
    expect.objectContaining({
      project: null,
      identity: null,
      title: null,
      launchedAt: null,
      gaps: expect.arrayContaining([
        "unresolved-project",
        "task-start-unknown",
      ]) as unknown,
    }),
  );
  expect(JSON.stringify(history)).not.toContain("Current misleading title");
  expect(
    Object.values(history.observations).map((item) => item.responseId),
  ).not.toContain("before-cutoff");
});
