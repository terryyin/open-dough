import assert from "node:assert/strict";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { taskUsage } from "../../server/usageHistory.ts";
import {
  expect,
  test,
  response,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  at,
  nativeFile,
  readImported,
  runImport,
} from "../../tests/usage-history/importHarness.ts";
import { configuredRepository } from "../../tests/usage-history/recoveryHarness.ts";

test("uses recorded repository evidence for a deleted worktree and leaves unavailable revisions and unknown projects honest", async ({
  home,
  root,
}) => {
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
  nativeFile(root, "deleted-worktree", [
    {
      type: "session_meta",
      payload: {
        id: "deleted-worktree",
        cwd: path.join(home, "retired/SEED-42-story"),
        git: {
          repository_url: "https://github.com/example/historic.git",
          commit_hash: repo.revisions.then,
        },
      },
    },
    { type: "turn_context", payload: { turn_id: "old-task" } },
    {
      type: "event_msg",
      timestamp: early,
      payload: {
        type: "user_message",
        message: "$dough-slice-planning .planning/seeds/SEED-42-title.md",
      },
    },
    {
      ...response("deleted-worktree", "old-task", "before-cutoff", {
        output_tokens: 1000,
      }),
      timestamp: early,
    },
    {
      type: "event_msg",
      timestamp: at,
      payload: { type: "task_complete", turn_id: "old-task" },
    },
  ]);
  const worker = response("owning-worker", "worker-turn", "in-window", {
    output_tokens: 7,
  });
  worker.payload.root_turn_id = "old-task";
  nativeFile(root, "owning-worker", [
    {
      type: "session_meta",
      payload: { id: "owning-worker", parent_thread_id: "deleted-worktree" },
    },
    worker,
  ]);
  nativeFile(root, "missing-objects", [
    {
      type: "session_meta",
      payload: {
        id: "missing-objects",
        cwd: repo.integration,
        git: { commit_hash: "f".repeat(40) },
      },
    },
    { type: "turn_context", payload: { turn_id: "unsettled" } },
    {
      type: "event_msg",
      timestamp: at,
      payload: {
        type: "user_message",
        message: "$dough-story-refinement SEED-42#story",
      },
    },
    response("missing-objects", "unsettled", "unknown-title", {
      output_tokens: 2,
    }),
  ]);
  nativeFile(root, "unknown-project", [
    {
      type: "session_meta",
      payload: {
        id: "unknown-project",
        cwd: path.join(home, "missing/historic"),
      },
    },
    { type: "turn_context", payload: { turn_id: "unknown-project-task" } },
    {
      type: "event_msg",
      payload: {
        type: "user_message",
        message: "$dough-execute-plan SEED-42#story",
      },
    },
    response(
      "unknown-project",
      "unknown-project-task",
      "unknown-project-answer",
      { output_tokens: 3 },
    ),
  ]);
  runImport(home, root);
  const history = readImported(home);
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
      lastActivityAt: at,
      outcome: null,
    }),
  );
  expect(taskUsage(history, deleted.id).tokens.output).toBe(7);
  expect(missing).toEqual(
    expect.objectContaining({
      identity: null,
      title: null,
      gaps: expect.arrayContaining(["unresolved-historical-story"]),
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
      ]),
    }),
  );
  expect(JSON.stringify(history)).not.toContain("Current misleading title");
  expect(
    Object.values(history.observations).map((item) => item.responseId),
  ).not.toContain("before-cutoff");
});
