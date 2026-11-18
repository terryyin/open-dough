import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { taskUsage } from "../../server/usageHistory.ts";
import {
  test,
  expect,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  legacyHistory,
  writeLegacyStore,
  writePagedStore,
} from "../../test-support/usage-history/earlierStores.ts";
import {
  readImported,
  runImport,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";
import { configuredRepository } from "../../test-support/usage-history/recoveryHarness.ts";

const wrapper =
  "<recommended_plugins>PRIVATE-INJECTED-CONTEXT</recommended_plugins>\n# AGENTS.md instructions\n<INSTRUCTIONS>PRIVATE-RULES</INSTRUCTIONS>\n<environment_context>private environment</environment_context>\n<system-reminder>PRIVATE-SYSTEM-CONTEXT</system-reminder>";

// The store an earlier dashboard left holds the response rows; the corrected
// import reads none of them again.
for (const format of ["legacy", "paged"]) {
  test(`${format} wrapper correction withdraws old charges while keeping the session's contribution and its candidate`, async ({
    home,
    root,
  }) => {
    const repo = await configuredRepository(
      home,
      makeMe.aRepository.withRevision("then", {}).please(),
    );
    const injectedAt =
      format === "paged"
        ? "2026-09-15T09:00:00.000Z"
        : "2026-11-14T09:00:00.000Z";
    const session = "injected";
    const rollout = () =>
      makeMe.aCodexRollout
        .forSession(session)
        .withCwd(repo.integration)
        .withTurnContext("turn");
    const file = writeCodexSession(
      root,
      rollout()
        .withRow({
          type: "response_item",
          timestamp: injectedAt,
          payload: {
            role: "user",
            content: [{ text: "Do the original task" }],
          },
        })
        .withResponse("turn", "absent-from-next-scan", {
          input_tokens: 13,
          output_tokens: 7,
        })
        .please(),
    );
    runImport(home, root);
    const old = readImported(home);
    expect(taskUsage(old, Object.keys(old.tasks)[0] ?? "").requests).toBe(1);
    const task = Object.values(old.tasks)[0];
    assert(task);
    // Exact old wire shape is the migration contract: no assignment evidence.
    delete task.assignmentEvidence;
    task.title = "Independent retained title";
    task.fieldSources = {
      ...task.fieldSources,
      title: [{ kind: "git", file: "seed.md", revision: "a".repeat(40) }],
    };
    task.fieldClaims = {
      ...task.fieldClaims,
      title: [{ value: task.title, sources: task.fieldSources.title ?? [] }],
    };
    // Exact old wire shapes with their response rows are the starting point.
    if (format === "legacy") writeLegacyStore(home, legacyHistory(old));
    else writePagedStore(home, legacyHistory(old));
    writeCodexSession(
      root,
      rollout()
        .withRow({
          type: "response_item",
          timestamp: injectedAt,
          payload: { role: "user", content: [{ text: wrapper }] },
        })
        .please(),
    );
    const bytes = readFileSync(file, "utf8");
    const report = runImport(home, root);
    const corrected = readImported(home);
    expect(corrected.tasks[task.id]).toMatchObject({
      id: task.id,
      launchedAt: null,
      title: "Independent retained title",
      gaps: expect.arrayContaining([
        "unsupported-task-assignment",
        "task-start-unknown",
      ]),
      assignmentEvidence: [
        {
          status: "rejected",
          turnId: "turn",
          at: injectedAt,
          reason: "injected-context",
          source: { kind: "native", file, line: 3 },
        },
      ],
    });
    expect(corrected.tasks[task.id]?.fieldClaims?.title).toEqual(
      task.fieldClaims.title,
    );
    expect(corrected.format).toBe("usage-history-v2");
    expect(corrected.sessions[`codex:${session}`]?.entries).toMatchObject([
      { candidates: [task.id], responses: 1, tokens: { output: 7 } },
    ]);
    expect(taskUsage(corrected, task.id).requests).toBe(0);
    // The response was not read again, so the import counts none.
    expect(report).toMatchObject({
      observations: 0,
      summary: {
        unsupportedAssignmentTasks: 1,
        configuredWork: { tasks: 0 },
        unassignedUsage: { observations: 0 },
      },
    });
    expect(readFileSync(file, "utf8")).toBe(bytes);
    expect(JSON.stringify(corrected)).not.toContain("PRIVATE-");
    runImport(home, root);
    expect(readImported(home)).toEqual(corrected);
  });
}
