import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { usageHistoryDefaultAt } from "../../../Distribution/tests/support/codexRolloutTestData.mjs";
import { taskUsage } from "../../server/usageHistory.ts";
import { expect, test } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  readImported,
  runImport,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";
import { configuredRepository } from "../../tests/usage-history/recoveryHarness.ts";
import {
  historicalCodexTaskRows,
  recoveredTask as task,
  recordHistoricalTask as record,
} from "../../tests/usage-history/historicalReferenceHarness.ts";

const seed = ".planning/seeds/SEED-013-old.md";
const plan = ".planning/quick/050-historical-work/PLAN.md";
const otherSeed = ".planning/seeds/SEED-014-other.md";
const identity = "SEED-013#historical-work";
const otherIdentity = "SEED-014#other-work";
const description = () =>
  makeMe.aRepository
    .withRevision("then", {
      files: {
        [seed]: `---\nid: SEED-013\n---\n# Seed\n<a id="historical-work"></a>\n### Title at execution\n**Identity:** ${identity}\n`,
        [otherSeed]: `---\nid: SEED-014\n---\n# Seed\n<a id="other-work"></a>\n### Other historical story\n**Identity:** ${otherIdentity}\n`,
        [plan]:
          "# Plan\n**Source:** [story](../../seeds/SEED-013-old.md#historical-work)\n",
      },
    })
    .please();

test("uses only same-message labelled established identity and keeps conflicting explicit references unresolved with claims", async ({
  home,
  root,
}) => {
  const repo = await configuredRepository(home, description());
  const messages = {
    established: `$dough-execute-plan\n\nEstablished start:\n- identity: ${identity}\n- branch: example`,
    surrounding: `$dough-execute-plan\n<environment_context>\nEstablished start:\n- identity: ${otherIdentity}\n</environment_context>\nEstablished start:\n- identity: ${identity}`,
    preparation: `$dough-story-refinement\n\nEstablished preparation:\n- identity: ${identity}`,
    longerCloser: `$dough-execute-plan\n\n\`\`\`text\nAn example\n\`\`\`\`\nEstablished start:\n- identity: ${identity}`,
    agreeing: `$dough-execute-plan 50\n\nEstablished start:\n- identity: ${identity}`,
    conflicting: `$dough-execute-plan 50\n\nEstablished start:\n- identity: ${otherIdentity}`,
    unavailable: `$dough-execute-plan 51\n\nEstablished start:\n- identity: ${identity}`,
    fenced: `$dough-execute-plan\n\n\`\`\`text\nEstablished start:\n- identity: ${identity}\n\`\`\``,
    tildeFenced: `$dough-execute-plan\n\n~~~text\nEstablished start:\n- identity: ${identity}\n~~~`,
    injected: `$dough-execute-plan\n\n<INSTRUCTIONS>\nEstablished start:\n- identity: ${identity}\n</INSTRUCTIONS>`,
    incidental: `$dough-execute-plan\nRead ${seed} and ${plan}; ${identity} is an example.`,
  };
  for (const [turn, text] of Object.entries(messages))
    record(root, repo.integration, repo.revisions.then, turn, text);
  runImport(home, root);
  const history = readImported(home);
  for (const turn of [
    "established",
    "preparation",
    "agreeing",
    "longerCloser",
    "surrounding",
  ])
    expect(task(history, turn)).toEqual(
      expect.objectContaining({
        identity,
        title: "Title at execution",
        origin: "unknown",
      }),
    );
  for (const turn of [
    "conflicting",
    "unavailable",
    "fenced",
    "tildeFenced",
    "injected",
    "incidental",
  ])
    expect(task(history, turn)).toEqual(
      expect.objectContaining({ identity: null, title: null }),
    );
  expect(task(history, "injected")).toMatchObject({
    workflow: "dough-execute-plan",
    launchedAt: usageHistoryDefaultAt,
    assignmentEvidence: [expect.objectContaining({ status: "supported" })],
  });
  const conflict = task(history, "conflicting");
  expect(conflict.gaps).toContain("contradictory-task-field:identity");
  expect(conflict.fieldClaims?.identity).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        value: identity,
        sources: expect.arrayContaining([
          expect.objectContaining({
            kind: "git",
            file: plan,
            revision: repo.revisions.then,
          }),
        ]),
      }),
      expect.objectContaining({
        value: otherIdentity,
        sources: expect.arrayContaining([
          expect.objectContaining({
            kind: "git",
            file: otherSeed,
            revision: repo.revisions.then,
          }),
        ]),
      }),
    ]),
  );
});

test("later argumentless workflow does not inherit prior established intent or incidental orchestration reads", async ({
  home,
  root,
}) => {
  const repo = await configuredRepository(home, description());
  const session = "successive";
  writeCodexSession(root, [
    ...historicalCodexTaskRows(
      repo.integration,
      repo.revisions.then,
      session,
      `$dough-execute-plan\n\nEstablished start:\n- identity: ${identity}`,
    ),
    ...makeMe.aCodexRollout
      .forSession(session)
      .withTurnContext("later")
      .withRow({
        type: "response_item",
        timestamp: usageHistoryDefaultAt,
        payload: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: "$dough-execute-plan" }],
        },
      })
      .withRow({
        type: "response_item",
        payload: {
          type: "custom_tool_call",
          name: "functions.exec",
          call_id: "read",
          input: `await tools.exec_command({cmd: 'cat ${seed} ${plan}'})`,
        },
      })
      .withRow({
        type: "response_item",
        payload: {
          type: "custom_tool_call_output",
          call_id: "read",
          output: `**Identity:** ${identity}\n${plan}`,
        },
      })
      .withResponse("later", "later-answer", { output_tokens: 3 })
      .rows(),
  ]);
  runImport(home, root);
  const history = readImported(home);
  expect(task(history, session).identity).toBe(identity);
  const later = task(history, "later");
  expect(later).toEqual(
    expect.objectContaining({
      workflow: "dough-execute-plan",
      identity: null,
      title: null,
      origin: "unknown",
    }),
  );
  expect(taskUsage(history, later.id).tokens.output).toBe(3);
});
