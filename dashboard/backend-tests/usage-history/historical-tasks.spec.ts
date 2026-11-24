import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { claudeReportingContext } from "../../../Distribution/tests/support/claudeReportingContext.mjs";
import {
  readUsageHistory,
  taskUsage,
  usageHistoryFile,
} from "../../server/usageHistory.ts";
import { importUsageHistory } from "../../server/usageImport.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import { test } from "../../test-support/usage-history/retainedUsageTest.ts";
import { writeClaudeSession } from "../../test-support/usage-history/importHarness.ts";
import { configuredRepository } from "../../test-support/usage-history/recoveryHarness.ts";

test("recovers Claude historical renamed seed, backlog and completion facts from recorded Git reads with separate report outcomes", async ({
  home,
  root,
}) => {
  const old = ".planning/seeds/SEED-42-old.md";
  const renamed = ".planning/seeds/SEED-42-renamed.md";
  const source = `---\nid: SEED-42\n---\n# Seed\n<a id="story"></a>\n### Title at activity\n**Identity:** SEED-42#story\n`;
  const repo = await configuredRepository(
    home,
    makeMe.aRepository
      .withRevision("old", {
        files: { [old]: source.replace("Title at activity", "Earlier title") },
      })
      .withRevision("renamed", { remove: [old], files: { [renamed]: source } })
      .withRevision("completed", {
        remove: [renamed],
        doneRecords: [
          makeMe.aDoneRecord
            .completed({
              identity: "SEED-42#story",
              title: "Title at completion",
            })
            .please(),
        ],
      })
      .withRevision("backlog", {
        files: {
          ".planning/PRODUCT-BACKLOG.md":
            "# Product Backlog\n\n## Taken\n\n## Backlog list\n\n- [Backlog historical title](seeds/SEED-43-gone.md#story) — SEED-43#story\n",
        },
      })
      .please(),
  );
  const sessionId = "recovered-claude";
  const reference = "ca7430bd-0d52-499d-a1bd-660263c77c12";
  const claude = path.join(home, "claude");
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: [claude],
    })
    .please();
  const { store, responses } = options;
  const turns = [
    [
      "renamed",
      "$dough-slice-planning .planning/seeds/SEED-42-old.md#story",
      repo.revisions.renamed,
      null,
    ],
    [
      "done",
      `$dough-story-refinement .planning/done/SEED-42_story.json\n${claudeReportingContext({ reference, project: "historic" })}\n`,
      repo.revisions.completed,
      "answer-renamed",
    ],
    [
      "backlog",
      "$dough-execute-plan SEED-43",
      repo.revisions.backlog,
      "answer-done",
    ],
  ] as const;
  const transcript = makeMe.aClaudeTranscript
    .forSession(sessionId)
    .withCwd(repo.integration);
  for (const [turn, directive, revision, parent] of turns) {
    transcript
      .withUser({
        uuid: turn,
        parentUuid: parent,
        content: directive,
      })
      .withAssistant({
        uuid: `git-${turn}`,
        messageId: `git-message-${turn}`,
        content: [
          {
            type: "tool_use",
            id: `read-${turn}`,
            name: "Bash",
            input: { command: "git rev-parse HEAD" },
          },
        ],
        usage: { output_tokens: 1 },
      })
      .withUser({
        uuid: `result-${turn}`,
        content: [
          {
            type: "tool_result",
            tool_use_id: `read-${turn}`,
            content: revision,
          },
        ],
      })
      .withAssistant({
        uuid: `answer-${turn}`,
        messageId: `answer-message-${turn}`,
        usage: { output_tokens: 2 },
      });
    if (turn === "done")
      transcript.withUser({
        uuid: "receipt",
        content: [
          {
            type: "tool_result",
            tool_use_id: "report",
            content: JSON.stringify({
              state: "recorded",
              receipt: "2b3d62be-7ea8-4fe0-a4ce-bd38a4e0320a",
              reference,
              outcome: "unfinished",
              message: "PRIVATE-REPORT",
              receivedAt: "2026-11-14T10:00:00.000Z",
            }),
          },
        ],
      });
  }
  writeClaudeSession(claude, transcript.please());
  await importUsageHistory(options);
  const history = {
    ...(await readUsageHistory(store)),
    ...(JSON.parse(readFileSync(responses, "utf8")) as UsageResponses),
  };
  const tasks = Object.values(history.tasks);
  const renamedTask = tasks.find((task) => task.rootTurnId === "renamed");
  const done = tasks.find((task) => task.rootTurnId === "done");
  const backlog = tasks.find((task) => task.rootTurnId === "backlog");
  assert(renamedTask && done && backlog);
  expect(renamedTask).toEqual(
    expect.objectContaining({
      identity: "SEED-42#story",
      title: "Title at activity",
      origin: "unknown",
      outcome: null,
    }),
  );
  expect(renamedTask.fieldSources?.title).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        kind: "git",
        file: renamed,
        repository: "example/historic",
        revision: repo.revisions.renamed,
      }),
    ]),
  );
  expect(done).toEqual(
    expect.objectContaining({
      identity: "SEED-42#story",
      title: "Title at completion",
      origin: "dashboard",
      outcome: {
        kind: "reported-incomplete",
        at: "2026-11-14T10:00:00.000Z",
        attention: true,
      },
    }),
  );
  expect(done.fieldSources?.identity).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        kind: "git",
        file: ".planning/done/SEED-42_story.json",
        revision: repo.revisions.completed,
      }),
    ]),
  );
  expect(backlog).toEqual(
    expect.objectContaining({
      identity: "SEED-43#story",
      title: "Backlog historical title",
      origin: "unknown",
    }),
  );
  expect(backlog.fieldSources?.title).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        kind: "git",
        file: ".planning/PRODUCT-BACKLOG.md",
        revision: repo.revisions.backlog,
      }),
    ]),
  );
  for (const task of [renamedTask, done, backlog])
    expect(taskUsage(history, task.id).tokens.output).toBe(3);
  expect(JSON.stringify(history)).not.toContain("PRIVATE-REPORT");
  const saved = JSON.stringify(history);
  await importUsageHistory(options);
  expect(
    JSON.stringify({
      ...(await readUsageHistory(store)),
      ...(JSON.parse(readFileSync(responses, "utf8")) as UsageResponses),
    }),
  ).toBe(saved);
});
