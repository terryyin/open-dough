import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { taskUsage } from "../../server/usageHistory.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
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

test("joins later Claude retained timestamp identity to one recovered task and preserves facts after source removal", async ({
  home,
  root,
}) => {
  const repo = await configuredRepository(
    home,
    makeMe.aRepository.withRevision("then", {}).please(),
  );
  const sessionId = "claude-later-retained";
  const reference = "ca7430bd-0d52-499d-a1bd-660263c77c12";
  const claude = path.join(home, "claude");
  nativeFile(claude, sessionId, [
    {
      type: "user",
      sessionId,
      cwd: repo.integration,
      uuid: "native-input",
      parentUuid: null,
      timestamp: at,
      message: {
        content: `$dough-execute-plan SEED-42#story\nDashboard reporting context:\n- project: historic\n- host: claude\n- launch reference: ${reference}\n`,
      },
    },
    {
      type: "assistant",
      sessionId,
      uuid: "answer",
      parentUuid: "native-input",
      timestamp: at,
      message: { id: "one", usage: { output_tokens: 8 } },
    },
    {
      type: "user",
      sessionId,
      cwd: repo.integration,
      uuid: "unknown-followup",
      parentUuid: "answer",
      timestamp: at,
      message: { content: "Thanks, tell me more" },
    },
    {
      type: "assistant",
      sessionId,
      uuid: "unclassified",
      parentUuid: "unknown-followup",
      timestamp: at,
      message: { id: "unclassified", usage: { output_tokens: 100 } },
    },
  ]);
  runImport(home, root, ["--claude-root", claude]);
  const initial = readImported(home);
  const task = Object.values(initial.tasks)[0];
  assert(task);
  expect(task.origin).toBe("dashboard");
  expect(taskUsage(initial, task.id).tokens.output).toBe(8);
  expect(Object.values(initial.tasks)).toHaveLength(1);
  const retained = makeMe.aLaunchRecord
    .executing({ identity: "SEED-42#story", title: "Retained title" })
    .inClaudeSession({ sessionId })
    .launchedAt(at)
    .reportingThrough({
      reference,
      origin: "http://localhost:4318",
      command: "report",
    })
    .please();
  keepLaunchStore(home, { historic: [retained] });
  runImport(home, root, ["--claude-root", claude]);
  const enriched = readImported(home);
  expect(Object.keys(enriched.tasks)).toEqual([task.id]);
  expect(enriched.tasks[task.id]).toEqual(
    expect.objectContaining({
      kind: "launch",
      workflow: "dough-execute-plan",
      title: "Retained title",
      identity: "SEED-42#story",
    }),
  );
  expect(taskUsage(enriched, task.id).tokens.output).toBe(8);
  rmSync(claude, { recursive: true });
  runImport(home, root, ["--claude-root", claude]);
  expect(readImported(home).tasks[task.id]?.title).toBe("Retained title");
  expect(taskUsage(readImported(home), task.id).tokens.output).toBe(8);
});

test("retains contradictory historical facts and reporting project joins without selecting a current title", async ({
  home,
  root,
}) => {
  const seed = ".planning/seeds/SEED-42-old.md";
  const story = (title: string, identity: string) =>
    `---\nid: SEED-42\n---\n# Seed\n<a id="story"></a>\n### ${title}\n**Identity:** ${identity}\n`;
  const repo = await configuredRepository(
    home,
    makeMe.aRepository
      .withRevision("first", {
        files: { [seed]: story("First historical title", "SEED-42#story") },
      })
      .withRevision("other", {
        files: { [seed]: story("Different historical title", "SEED-42#other") },
      })
      .please(),
  );
  const session = "contradictory";
  const rows = (
    revision: string,
    input = `$dough-slice-planning ${seed}#story`,
  ) => [
    {
      type: "session_meta",
      payload: {
        id: session,
        cwd: repo.integration,
        git: { commit_hash: revision },
      },
    },
    { type: "turn_context", payload: { turn_id: "same-turn" } },
    {
      type: "response_item",
      timestamp: at,
      payload: { role: "user", content: [{ text: input }] },
    },
    response(session, "same-turn", "answer", { output_tokens: 5 }),
  ];
  nativeFile(root, session, rows(repo.revisions.first));
  runImport(home, root);
  const initial = Object.values(readImported(home).tasks)[0];
  assert(initial);
  nativeFile(root, session, rows(repo.revisions.other));
  runImport(home, root);
  const history = readImported(home);
  const task = history.tasks[initial.id];
  assert(task);
  expect(Object.keys(history.tasks)).toEqual([initial.id]);
  expect(task.identity).toBeNull();
  expect(task.title).toBeNull();
  expect(task.gaps).toEqual(
    expect.arrayContaining([
      "contradictory-task-field:identity",
      "contradictory-task-field:title",
    ]),
  );
  expect(task.fieldClaims?.title?.map((claim) => claim.value)).toEqual(
    expect.arrayContaining([
      "First historical title",
      "Different historical title",
    ]),
  );
  expect(taskUsage(history, task.id).tokens.output).toBe(5);
  nativeFile(
    root,
    "project-conflict",
    rows(
      repo.revisions.first,
      "$dough-slice-planning SEED-42#story\nDashboard reporting context:\n- project: wrong-project\n- host: codex\n- launch reference: ca7430bd-0d52-499d-a1bd-660263c77c12\n",
    ).map((row) =>
      row.type === "session_meta"
        ? { ...row, payload: { id: "project-conflict", cwd: repo.integration } }
        : row.type === "token_usage_record"
          ? response("project-conflict", "same-turn", "conflict-answer", {
              output_tokens: 900,
            })
          : row,
    ),
  );
  runImport(home, root);
  const joined = readImported(home);
  const conflict = Object.values(joined.tasks).find(
    (item) => item.sessionId === "project-conflict",
  );
  assert(conflict);
  expect(conflict).toEqual(
    expect.objectContaining({
      project: null,
      origin: "unknown",
      gaps: expect.arrayContaining(["contradictory-project-evidence"]),
    }),
  );
  expect(taskUsage(joined, conflict.id).requests).toBe(0);
});
