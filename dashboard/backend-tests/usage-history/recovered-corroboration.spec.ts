import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { usageHistoryDefaultAt } from "../../../Distribution/tests/support/codexRolloutTestData.mjs";
import { claudeReportingContext } from "../../../Distribution/tests/support/claudeReportingContext.mjs";
import { taskUsage } from "../../server/usageHistory.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import { expect, test } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  readImported,
  runImport,
  writeClaudeSession,
  writeCodexSession,
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
  writeClaudeSession(
    claude,
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withCwd(repo.integration)
      .withUser({
        uuid: "native-input",
        parentUuid: null,
        content: `$dough-execute-plan SEED-42#story\n${claudeReportingContext({ reference, project: "historic" })}\n`,
      })
      .withAssistant({
        uuid: "answer",
        messageId: "one",
        usage: { output_tokens: 8 },
      })
      .withUser({
        uuid: "unknown-followup",
        content: "Thanks, tell me more",
      })
      .withAssistant({
        uuid: "unclassified",
        messageId: "unclassified",
        usage: { output_tokens: 100 },
      })
      .please(),
  );
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
    .launchedAt(usageHistoryDefaultAt)
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
  const rollout = (
    revision: string,
    input = `$dough-slice-planning ${seed}#story`,
  ) =>
    makeMe.aCodexRollout
      .forSession(session)
      .withCwd(repo.integration)
      .withGit({ commit_hash: revision })
      .withTurnContext("same-turn")
      .withRow({
        type: "response_item",
        timestamp: usageHistoryDefaultAt,
        payload: { role: "user", content: [{ text: input }] },
      })
      .withResponse("same-turn", "answer", { output_tokens: 5 })
      .please();
  writeCodexSession(root, rollout(repo.revisions.first));
  runImport(home, root);
  const initial = Object.values(readImported(home).tasks)[0];
  assert(initial);
  writeCodexSession(root, rollout(repo.revisions.other));
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
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("project-conflict")
      .withCwd(repo.integration)
      .withTurnContext("same-turn")
      .withRow({
        type: "response_item",
        timestamp: usageHistoryDefaultAt,
        payload: {
          role: "user",
          content: [
            {
              text: "$dough-slice-planning SEED-42#story\nDashboard reporting context:\n- project: wrong-project\n- host: codex\n- launch reference: ca7430bd-0d52-499d-a1bd-660263c77c12\n",
            },
          ],
        },
      })
      .withResponse("same-turn", "conflict-answer", { output_tokens: 900 })
      .please(),
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
