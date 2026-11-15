import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  taskUsage,
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import { test, expect } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  readImported,
  runImport,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";
import { configuredRepository } from "../../tests/usage-history/recoveryHarness.ts";

const wrapper =
  "<recommended_plugins>PRIVATE-INJECTED-CONTEXT</recommended_plugins>\n# AGENTS.md instructions\n<INSTRUCTIONS>PRIVATE-RULES</INSTRUCTIONS>\n<environment_context>private environment</environment_context>\n<system-reminder>PRIVATE-SYSTEM-CONTEXT</system-reminder>";

for (const format of ["legacy", "paged"]) {
  test(`${format} wrapper correction withdraws old charges while preserving every observation and candidate`, async ({
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
    const task = Object.values(old.tasks)[0];
    assert(task);
    // Exact old wire shape is the migration contract: no assignment evidence.
    delete (task as typeof task & { assignmentEvidence?: unknown })
      .assignmentEvidence;
    task.title = "Independent retained title";
    task.fieldSources = {
      ...task.fieldSources,
      title: [{ kind: "git", file: "seed.md", revision: "a".repeat(40) }],
    };
    task.fieldClaims = {
      ...task.fieldClaims,
      title: [{ value: task.title, sources: task.fieldSources.title ?? [] }],
    };
    if (format === "legacy") {
      mkdirSync(path.dirname(usageHistoryFile(home)), { recursive: true });
      writeFileSync(usageHistoryFile(home), JSON.stringify(old));
    } else {
      writeFileSync(usageHistoryFile(home), JSON.stringify(old));
      await writeUsageHistory({}, usageHistoryFile(home));
    }
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
    expect(corrected.observations).toEqual(old.observations);
    for (const [id, association] of Object.entries(old.associations)) {
      expect(corrected.associations[id]).toMatchObject({
        taskId: null,
        candidates: association.candidates,
        sources: association.sources,
        gaps: expect.arrayContaining(["unsupported-task-assignment"]),
      });
    }
    expect(taskUsage(corrected, task.id).requests).toBe(0);
    expect(report).toMatchObject({
      summary: {
        unsupportedAssignmentTasks: 1,
        configuredWork: { tasks: 0 },
        unassignedUsage: { observations: 1, tokens: { output: 7 } },
      },
    });
    expect(readFileSync(file, "utf8")).toBe(bytes);
    expect(JSON.stringify(corrected)).not.toContain("PRIVATE-");
    runImport(home, root);
    expect(readImported(home)).toEqual(corrected);
  });
}
