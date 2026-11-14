import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  taskUsage,
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import {
  test,
  expect,
  response,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  at,
  nativeFile,
  readImported,
  runImport,
} from "../../tests/usage-history/importHarness.ts";
import { configuredRepository } from "../../tests/usage-history/recoveryHarness.ts";

const injectedAt = "2026-11-14T09:00:00.000Z";
const wrapper =
  "<recommended_plugins>PRIVATE-INJECTED-CONTEXT</recommended_plugins>\n# AGENTS.md instructions\n<INSTRUCTIONS>PRIVATE-RULES</INSTRUCTIONS>\n<environment_context>private environment</environment_context>";

test("wrapper followed by genuine mixed content corrects the same old task start", async ({
  home,
  root,
}) => {
  const repo = await configuredRepository(
    home,
    makeMe.aRepository.withRevision("then", {}).please(),
  );
  const session = "mixed";
  const meta = {
    type: "session_meta",
    payload: { id: session, cwd: repo.integration },
  };
  const turn = {
    type: "event_msg",
    payload: { type: "task_started", turn_id: "turn" },
  };
  const file = nativeFile(root, session, [
    meta,
    turn,
    {
      type: "response_item",
      timestamp: injectedAt,
      payload: { role: "user", content: [{ text: wrapper }] },
    },
    {
      type: "response_item",
      timestamp: at,
      payload: {
        role: "user",
        content: [
          { text: "<skill>PRIVATE-SKILL</skill>" },
          {
            text: "$dough-slice-planning SEED-404#missing\nRequested effort: high",
          },
        ],
      },
    },
    response(session, "turn", "answer", { output_tokens: 5 }),
  ]);
  const id = JSON.stringify(["codex", session, "turn"]);
  const old = makeMe.aUsageTask
    .with({
      id,
      sessionId: session,
      rootTurnId: "turn",
      project: "historic",
      launchedAt: injectedAt,
      fieldSources: { launchedAt: [{ kind: "native", file, line: 3 }] },
    })
    .please();
  await writeUsageHistory({ tasks: [old] }, usageHistoryFile(home));
  runImport(home, root);
  const history = readImported(home);
  expect(Object.keys(history.tasks)).toEqual([id]);
  expect(history.tasks[id]).toMatchObject({
    launchedAt: at,
    workflow: "dough-slice-planning",
    requested: { effort: "high" },
    assignmentEvidence: expect.arrayContaining([
      expect.objectContaining({ status: "rejected", at: injectedAt }),
      expect.objectContaining({
        status: "supported",
        at,
        source: { kind: "native", file, line: 4 },
      }),
    ]),
  });
  expect(taskUsage(history, id).tokens.output).toBe(5);
  expect(JSON.stringify(history)).not.toContain("PRIVATE-");
});
