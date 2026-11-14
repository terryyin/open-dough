import path from "node:path";
import { writeFileSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  expect,
  test,
  launch,
  response,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  at,
  nativeFile,
  readImported,
  runImport,
  keepOperationalLaunch,
} from "../../tests/usage-history/importHarness.ts";
import { configuredRepository } from "../../tests/usage-history/recoveryHarness.ts";

test("reports configured in-window work separately from retained old launches, unknown projects and unassigned usage", async ({
  home,
  root,
}) => {
  const repo = await configuredRepository(
    home,
    makeMe.aRepository
      .withRevision("then", {
        files: {
          ".planning/seeds/SEED-42-title.md":
            '---\nid: SEED-42\n---\n# Seed\n<a id="story"></a>\n### Historical title\n**Identity:** SEED-42#story\n',
        },
      })
      .please(),
  );
  writeFileSync(
    path.join(home, ".open-dough/dashboard/projects-production.json"),
    JSON.stringify([
      makeMe.aConfiguredProject
        .with({
          id: "historic",
          label: "Hidden history",
          repository: "example/historic",
          localPath: `~/${path.relative(home, repo.integration)}`,
          hidden: true,
        })
        .please(),
    ]),
  );
  const early = "2026-09-01T00:00:00.000Z";
  keepOperationalLaunch(home, launch("old-launch", "old-turn", early));
  nativeFile(root, "old-root", [
    {
      type: "session_meta",
      payload: {
        id: "old-root",
        cwd: repo.integration,
        git: { commit_hash: repo.revisions.then },
      },
    },
    { type: "turn_context", payload: { turn_id: "task" } },
    {
      type: "event_msg",
      timestamp: early,
      payload: {
        type: "user_message",
        message: "$dough-execute-plan SEED-42#story",
      },
    },
    {
      ...response("old-root", "task", "old-response", { output_tokens: 1000 }),
      timestamp: early,
    },
  ]);
  const worker = response("worker", "worker-turn", "current", {
    input_tokens: 30,
    cached_input_tokens: 20,
    cache_write_input_tokens: 0,
    output_tokens: 7,
    reasoning_output_tokens: 3,
  });
  worker.payload.root_turn_id = "task";
  nativeFile(root, "worker", [
    {
      type: "session_meta",
      payload: { id: "worker", parent_thread_id: "old-root" },
    },
    worker,
  ]);
  nativeFile(root, "unknown", [
    {
      type: "session_meta",
      payload: { id: "unknown", cwd: path.join(home, "missing") },
    },
    { type: "turn_context", payload: { turn_id: "unknown-task" } },
    {
      type: "event_msg",
      timestamp: at,
      payload: { type: "user_message", message: "private unknown assignment" },
    },
    response("unknown", "unknown-task", "unknown-response", {
      output_tokens: 2,
    }),
  ]);
  nativeFile(root, "orphan", [
    response("orphan", "unassigned", "orphan-response", { output_tokens: 3 }),
  ]);
  nativeFile(root, "unrelated", [
    {
      type: "session_meta",
      payload: {
        id: "unrelated",
        git: { repository_url: "https://github.com/elsewhere/unrelated.git" },
      },
    },
    { type: "turn_context", payload: { turn_id: "unrelated-task" } },
    {
      type: "event_msg",
      timestamp: at,
      payload: {
        type: "user_message",
        message: "private unrelated assignment",
      },
    },
    response("unrelated", "unrelated-task", "excluded", { output_tokens: 400 }),
  ]);
  const claudeRoot = path.join(home, "claude");
  nativeFile(claudeRoot, "claude-session", [
    {
      type: "user",
      sessionId: "claude-session",
      uuid: "human",
      parentUuid: null,
      cwd: repo.integration,
      timestamp: at,
      origin: { kind: "native" },
      message: { content: "/dough-slice-planning" },
    },
    {
      type: "assistant",
      sessionId: "claude-session",
      uuid: "answer",
      parentUuid: "human",
      timestamp: at,
      message: {
        id: "claude-answer",
        model: "observed",
        usage: {
          input_tokens: 4,
          cache_read_input_tokens: 5,
          cache_creation_input_tokens: 6,
          output_tokens: 8,
          cache_creation: { ephemeral_5m_input_tokens: 6 },
        },
      },
    },
  ]);
  const report = runImport(home, root, ["--claude-root", claudeRoot]);
  expect(report).toMatchObject({
    tasks: 4,
    observations: 4,
    excludedUnrelatedTasks: 1,
    excludedUnrelatedObservations: 1,
    summary: {
      configuredProjects: [{ id: "historic", hidden: true }],
      configuredWork: {
        tasks: 2,
        observations: 2,
        byHost: {
          codex: { tasks: 1, observations: 1 },
          claude: { tasks: 1, observations: 1 },
        },
        earliestTaskStart: early,
        firstInWindowActivity: at,
        earliestUsage: at,
        tokens: { uncachedInput: 14, cacheRead: 25, cacheWrite: 6, output: 15 },
        unmeasured: {
          uncachedInput: 0,
          cacheRead: 0,
          cacheWrite: 0,
          output: 0,
        },
        origins: { dashboard: 0, native: 1, unknown: 1 },
        responseCoverage: { measured: 2, partial: 0, unavailable: 0 },
        taskCoverage: { measured: 2, partial: 0, unavailable: 0 },
      },
      unknownProjectWork: {
        tasks: 1,
        observations: 1,
        tokens: { uncachedInput: null, output: 2 },
        unmeasured: { uncachedInput: 1 },
        taskCoverage: { measured: 0, partial: 1, unavailable: 0 },
      },
      unassignedUsage: { observations: 1, tokens: { output: 3 } },
      outsideWindowTasks: 1,
    },
  });
  const stored = readImported(home);
  expect(
    Object.values(stored.tasks).find((task) => task.sessionId === "old-root"),
  ).toMatchObject({
    project: "historic",
    identity: "SEED-42#story",
    title: "Historical title",
  });
  expect(
    Object.values(stored.observations)
      .map((item) => item.responseId)
      .sort(),
  ).toEqual([
    "claude-answer",
    "current",
    "orphan-response",
    "unknown-response",
  ]);
  expect(runImport(home, root, ["--claude-root", claudeRoot])).toEqual(report);
  expect(readImported(home)).toEqual(stored);
  expect(JSON.stringify(report)).not.toContain("private unknown assignment");
});
