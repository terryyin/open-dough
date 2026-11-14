import assert from "node:assert/strict";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { taskUsage } from "../../server/usageHistory.ts";
import { expect, test } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  at,
  nativeFile,
  readImported,
  runImport,
} from "../../tests/usage-history/importHarness.ts";
import { configuredRepository } from "../../tests/usage-history/recoveryHarness.ts";

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
          {
            identity: "SEED-42#story",
            title: "Title at completion",
            completedAt: at,
            developer: "Terry",
            agent: "mrsn-chan",
            host: "claude",
          },
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
  const user = {
    type: "user",
    sessionId,
    cwd: repo.integration,
    timestamp: at,
  };
  const assistant = {
    type: "assistant",
    sessionId,
    cwd: repo.integration,
    timestamp: at,
  };
  const rows: object[] = [];
  for (const [turn, directive, revision, parent] of [
    [
      "renamed",
      "$dough-slice-planning .planning/seeds/SEED-42-old.md#story",
      repo.revisions.renamed,
      null,
    ],
    [
      "done",
      "$dough-story-refinement .planning/done/SEED-42_story.json",
      repo.revisions.completed,
      "answer-renamed",
    ],
    [
      "backlog",
      "$dough-execute-plan SEED-43",
      repo.revisions.backlog,
      "answer-done",
    ],
  ] as const) {
    rows.push({
      ...user,
      uuid: turn,
      parentUuid: parent,
      message: {
        content:
          directive +
          (turn === "done"
            ? `\nDashboard reporting context:\n- project: historic\n- host: claude\n- launch reference: ${reference}\n`
            : ""),
      },
    });
    rows.push({
      ...assistant,
      uuid: `git-${turn}`,
      parentUuid: turn,
      message: {
        id: `git-message-${turn}`,
        content: [
          {
            type: "tool_use",
            id: `read-${turn}`,
            name: "Bash",
            input: { command: "git rev-parse HEAD" },
          },
        ],
        usage: { output_tokens: 1 },
      },
    });
    rows.push({
      ...user,
      uuid: `result-${turn}`,
      parentUuid: `git-${turn}`,
      message: {
        content: [
          {
            type: "tool_result",
            tool_use_id: `read-${turn}`,
            content: revision,
          },
        ],
      },
    });
    rows.push({
      ...assistant,
      uuid: `answer-${turn}`,
      parentUuid: `result-${turn}`,
      message: { id: `answer-message-${turn}`, usage: { output_tokens: 2 } },
    });
    if (turn === "done")
      rows.push({
        ...user,
        uuid: "receipt",
        parentUuid: "answer-done",
        message: {
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
                receivedAt: at,
              }),
            },
          ],
        },
      });
  }
  nativeFile(claude, sessionId, rows);
  runImport(home, root, ["--claude-root", claude]);
  const history = readImported(home);
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
      outcome: { kind: "reported-incomplete", at, attention: true },
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
  runImport(home, root, ["--claude-root", claude]);
  expect(JSON.stringify(readImported(home))).toBe(saved);
});
