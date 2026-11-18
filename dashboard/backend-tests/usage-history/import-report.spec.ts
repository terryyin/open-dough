import assert from "node:assert/strict";
import path from "node:path";
import { writeFileSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  expect,
  test,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  nativeFile,
  readImported,
  runImport,
  keepOperationalLaunch,
  writeClaudeSession,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";
import { configuredRepository } from "../../test-support/usage-history/recoveryHarness.ts";

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
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("old-root")
      .withCwd(repo.integration)
      .withGit({ commit_hash: repo.revisions.then })
      .withTurnContext("task")
      .withRow({
        type: "event_msg",
        timestamp: early,
        payload: {
          type: "user_message",
          message: "$dough-execute-plan SEED-42#story",
        },
      })
      .withResponse(
        "task",
        "old-response",
        { output_tokens: 1000 },
        { timestamp: early },
      )
      .please(),
  );
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("worker")
      .withParent("old-root")
      .withResponse(
        "worker-turn",
        "current",
        {
          input_tokens: 30,
          cached_input_tokens: 20,
          cache_write_input_tokens: 0,
          output_tokens: 7,
          reasoning_output_tokens: 3,
        },
        { rootTurnId: "task" },
      )
      .please(),
  );
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("unknown")
      .withCwd(path.join(home, "missing"))
      .withTurnContext("unknown-task")
      .withRow({
        type: "event_msg",
        payload: {
          type: "user_message",
          message: "private unknown assignment",
        },
      })
      .withResponse("unknown-task", "unknown-response", { output_tokens: 2 })
      .please(),
  );
  // Unassigned response without session_meta: missing metadata under proof.
  const [orphan] = makeMe.aCodexRollout
    .forSession("orphan")
    .withResponse("unassigned", "orphan-response", { output_tokens: 3 })
    .rows();
  assert(orphan);
  nativeFile(root, "orphan", [orphan]);
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("unrelated")
      .withGit({
        repository_url: "https://github.com/elsewhere/unrelated.git",
      })
      .withTurnContext("unrelated-task")
      .withRow({
        type: "event_msg",
        payload: {
          type: "user_message",
          message: "private unrelated assignment",
        },
      })
      .withResponse("unrelated-task", "excluded", { output_tokens: 400 })
      .please(),
  );
  const claudeRoot = path.join(home, "claude");
  writeClaudeSession(
    claudeRoot,
    makeMe.aClaudeTranscript
      .forSession("claude-session")
      .withCwd(repo.integration)
      .withUser({
        uuid: "human",
        parentUuid: null,
        origin: { kind: "native" },
        content: "/dough-slice-planning",
      })
      .withAssistant({
        uuid: "answer",
        messageId: "claude-answer",
        model: "observed",
        usage: {
          input_tokens: 4,
          cache_read_input_tokens: 5,
          cache_creation_input_tokens: 6,
          output_tokens: 8,
          cache_creation: { ephemeral_5m_input_tokens: 6 },
        },
      })
      .please(),
  );
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
        firstInWindowActivity: "2026-11-14T10:00:00.000Z",
        earliestUsage: "2026-11-14T10:00:00.000Z",
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
