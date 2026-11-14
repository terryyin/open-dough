import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
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

test("recovers pruned native task facts from historical deleted stories without copying private input or mutating workflow", async ({
  home,
  root,
}) => {
  const seed = ".planning/seeds/SEED-42-old.md";
  const plan = ".planning/slice-plans/042-old/PLAN.md";
  const identity = "SEED-42#earlier-story";
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("then", {
        agentProfiles: [
          makeMe.anAgentProfile
            .executing({
              name: "Yui",
              identity,
              host: "codex",
              mode: "story-branch",
              branch: "story/historical-work",
            })
            .please(),
        ],
        files: {
          [seed]: `---\nid: SEED-42\n---\n# SEED-42\n\n<a id="earlier-story"></a>\n### Historical title\n\n**Identity:** ${identity}\n`,
          [plan]: `# Historical plan\n**Identity:** ${identity}\n**Source:** [story](../../seeds/SEED-42-old.md#earlier-story)\n`,
          ".planning/PRODUCT-BACKLOG.md": `# Backlog\n- [Historical title](seeds/SEED-42-old.md#earlier-story)\n`,
        },
      })
      .withRevision("now", {
        remove: [seed, plan],
        files: {
          ".planning/PRODUCT-BACKLOG.md": "# Backlog\n",
        },
      })
      .please(),
    { parent: home },
  );
  const projects = path.join(
    home,
    ".open-dough/dashboard/projects-production.json",
  );
  mkdirSync(path.dirname(projects), { recursive: true });
  writeFileSync(
    projects,
    JSON.stringify([
      makeMe.aConfiguredProject
        .with({
          id: "historic",
          label: "Configured hidden",
          repository: "example/historic",
          localPath: repository.integration,
          hidden: true,
        })
        .please(),
    ]),
  );
  const session = "recovered-codex";
  const file = nativeFile(root, session, [
    {
      type: "session_meta",
      payload: {
        id: session,
        cwd: repository.integration,
        git: {
          commit_hash: repository.revisions.then,
          repository_url: "git@github.com:example/historic.git",
        },
      },
    },
    { type: "turn_context", payload: { turn_id: "task-one" } },
    {
      type: "response_item",
      timestamp: at,
      payload: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: `$dough-slice-planning ${plan}\nPRIVATE-PROMPT-MARKER`,
          },
        ],
      },
    },
    response(session, "task-one", "answer", {
      input_tokens: 25,
      cached_input_tokens: 5,
      cache_write_input_tokens: 0,
      output_tokens: 4,
    }),
  ]);
  const before = readFileSync(file, "utf8");
  const assignmentFile = path.join(
    repository.integration,
    ".planning",
    agentIdentity("Yui").path,
  );
  const assignment = readFileSync(assignmentFile, "utf8");
  const repositoryHead = execFileSync(
    "git",
    ["-C", repository.integration, "rev-parse", "HEAD"],
    { encoding: "utf8", stdio: "pipe" },
  );
  const repositoryStatus = execFileSync(
    "git",
    ["-C", repository.integration, "status", "--porcelain=v1"],
    { encoding: "utf8", stdio: "pipe" },
  );
  const backlog = readFileSync(
    path.join(repository.integration, ".planning/PRODUCT-BACKLOG.md"),
    "utf8",
  );
  runImport(home, root);
  const history = readImported(home);
  const task = Object.values(history.tasks).find(
    (item) => item.sessionId === session,
  );
  assert(task, "native workflow should recover a task without a launch record");
  expect(task).toEqual(
    expect.objectContaining({
      kind: "recovered",
      project: "historic",
      workflow: "dough-slice-planning",
      identity,
      title: "Historical title",
      host: "codex",
      origin: "unknown",
      launchedAt: at,
    }),
  );
  expect(taskUsage(history, task.id).tokens.output).toBe(4);
  for (const field of [
    "project",
    "host",
    "sessionId",
    "rootTurnId",
    "workflow",
    "identity",
    "title",
    "launchedAt",
  ]) {
    expect(task.fieldSources?.[field]?.length, field).toBeGreaterThan(0);
  }
  for (const field of ["identity", "title"])
    expect(task.fieldSources?.[field]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "git",
          file: seed,
          repository: "example/historic",
          revision: repository.revisions.then,
        }),
        expect.objectContaining({
          kind: "git",
          file: plan,
          revision: repository.revisions.then,
        }),
      ]),
    );
  expect(task.outcome).toBeNull();
  expect(JSON.stringify(history)).not.toContain("PRIVATE-PROMPT-MARKER");
  expect(readFileSync(file, "utf8")).toBe(before);
  expect(readFileSync(assignmentFile, "utf8")).toBe(assignment);
  expect(
    execFileSync("git", ["-C", repository.integration, "rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: "pipe",
    }),
  ).toBe(repositoryHead);
  expect(
    execFileSync(
      "git",
      ["-C", repository.integration, "status", "--porcelain=v1"],
      { encoding: "utf8", stdio: "pipe" },
    ),
  ).toBe(repositoryStatus);
  expect(
    readFileSync(
      path.join(repository.integration, ".planning/PRODUCT-BACKLOG.md"),
      "utf8",
    ),
  ).toBe(backlog);
  expect(readFileSync(projects, "utf8")).toContain('"hidden":true');
  const saved = JSON.stringify(history);
  runImport(home, root);
  expect(JSON.stringify(readImported(home))).toBe(saved);
  rmSync(root, { recursive: true });
  expect(JSON.stringify(readImported(home))).toBe(saved);
});
