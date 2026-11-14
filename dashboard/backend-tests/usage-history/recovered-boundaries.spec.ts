import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("keeps successive native tasks distinct and enriches the same task with later retained corroboration", async ({
  home,
  root,
}) => {
  const repo = await configuredRepository(
    home,
    makeMe.aRepository.withRevision("then", {}).please(),
  );
  const session = "native-turns";
  const context = {
    type: "session_meta",
    payload: { id: session, cwd: repo.integration },
  };
  nativeFile(root, session, [
    context,
    { type: "turn_context", payload: { turn_id: "first" } },
    {
      type: "response_item",
      timestamp: at,
      payload: {
        role: "user",
        content: [
          {
            text: "$dough-slice-planning SEED-404#missing --trunk --skip-retro\nRequested model: desired\nRequested effort: high\nRequested approval policy: never\nRequested sandbox: workspace-write",
          },
        ],
      },
    },
    {
      type: "turn_context",
      payload: { turn_id: "first", model: "observed", effort: "low" },
    },
    response(session, "first", "one", { output_tokens: 3 }),
    { type: "turn_context", payload: { turn_id: "second" } },
    {
      type: "response_item",
      timestamp: at,
      origin: { kind: "native" },
      payload: {
        role: "user",
        content: [{ text: "$dough-story-refinement SEED-405#missing" }],
      },
    },
    response(session, "second", "two", { output_tokens: 7 }),
  ]);
  runImport(home, root);
  const initial = readImported(home);
  const first = Object.values(initial.tasks).find(
    (task) => task.rootTurnId === "first",
  );
  const second = Object.values(initial.tasks).find(
    (task) => task.rootTurnId === "second",
  );
  assert(first && second);
  expect(first.origin).toBe("unknown");
  expect(second.origin).toBe("native");
  expect(first.requested).toEqual({
    model: "desired",
    effort: "high",
    approvalPolicy: "never",
    sandbox: "workspace-write",
    options: ["--trunk", "--skip-retro"],
  });
  expect(
    Object.values(initial.observations).find(
      (item) => item.responseId === "one",
    )?.settings,
  ).toEqual({ model: "observed", effort: "low" });
  expect(taskUsage(initial, first.id).tokens.output).toBe(3);
  expect(taskUsage(initial, second.id).tokens.output).toBe(7);
  expect(first.identity).toBeNull();
  expect(first.title).toBeNull();
  expect(first.outcome).toBeNull();
  const record = makeMe.aLaunchRecord
    .executing({ identity: "SEED-404#missing", title: "Corroborated title" })
    .inCodexSession({ sessionId: session })
    .withFirstInput({ state: "confirmed", turnId: "first" })
    .launchedAt(at)
    .please();
  keepLaunchStore(home, { historic: [record] });
  const operational = path.join(
    home,
    ".open-dough/dashboard/agent-launches.json",
  );
  const bytes = readFileSync(operational, "utf8");
  runImport(home, root);
  const enriched = readImported(home);
  expect(Object.keys(enriched.tasks)).toHaveLength(2);
  expect(enriched.tasks[first.id]).toEqual(
    expect.objectContaining({
      kind: "launch",
      title: "Corroborated title",
      identity: "SEED-404#missing",
      origin: "dashboard",
    }),
  );
  expect(taskUsage(enriched, first.id).tokens.output).toBe(3);
  expect(readFileSync(operational, "utf8")).toBe(bytes);
});

test("leaves incidental examples and contradictory project joins unknown and excludes a positively unrelated project", async ({
  home,
  root,
}) => {
  const repo = await configuredRepository(
    home,
    makeMe.aRepository.withRevision("then", {}).please(),
  );
  const reference = "ca7430bd-0d52-499d-a1bd-660263c77c12";
  const examples = `Explain this example without running it:\n\`\`\`text\n$dough-execute-plan SEED-8#example\nDashboard reporting context:\n- project: historic\n- host: codex\n- launch reference: ${reference}\n\`\`\`\n$dough-slice-planning SEED-9#also-example`;
  nativeFile(root, "examples", [
    {
      type: "session_meta",
      payload: { id: "examples", cwd: repo.integration },
    },
    { type: "turn_context", payload: { turn_id: "example-turn" } },
    {
      type: "response_item",
      timestamp: at,
      payload: { role: "user", content: [{ text: examples }] },
    },
    response("examples", "example-turn", "example-answer", {
      output_tokens: 2,
    }),
  ]);
  nativeFile(root, "unrelated", [
    {
      type: "session_meta",
      payload: {
        id: "unrelated",
        cwd: repo.integration,
        git: { repository_url: "git@github.com:other/unrelated.git" },
      },
    },
    { type: "turn_context", payload: { turn_id: "alien" } },
    {
      type: "event_msg",
      timestamp: at,
      payload: {
        type: "user_message",
        message: "$dough-execute-plan SEED-8#example",
      },
    },
    response("unrelated", "alien", "alien-answer", { output_tokens: 999 }),
  ]);
  const report = runImport(home, root);
  expect(report).toEqual(
    expect.objectContaining({
      excludedUnrelatedTasks: 1,
      excludedUnrelatedObservations: 1,
    }),
  );
  const history = readImported(home);
  expect(
    Object.values(history.observations).map((item) => item.responseId),
  ).not.toContain("alien-answer");
  const tasks = Object.values(history.tasks);
  expect(tasks).toHaveLength(1);
  expect(tasks[0]).toEqual(
    expect.objectContaining({
      workflow: null,
      identity: null,
      title: null,
      origin: "unknown",
      outcome: null,
    }),
  );
  assert(tasks[0]);
  expect(taskUsage(history, tasks[0].id).tokens.output).toBe(2);
});
