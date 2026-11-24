import { readFileSync } from "node:fs";
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  taskUsage,
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import { test } from "../../test-support/usage-history/retainedUsageTest.ts";
import { writeCodexSession } from "../../test-support/usage-history/importHarness.ts";
import { configuredRepository } from "../../test-support/usage-history/recoveryHarness.ts";

const injectedAt = "2026-11-14T09:00:00.000Z";
const wrapper =
  "<recommended_plugins>PRIVATE-INJECTED-CONTEXT</recommended_plugins>\n# AGENTS.md instructions\n<INSTRUCTIONS>PRIVATE-RULES</INSTRUCTIONS>\n<environment_context>private environment</environment_context>";

test("wrapper followed by genuine mixed content corrects the same old task start", async ({
  home,
  root,
}) => {
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  const { store, responses } = options;
  const repo = await configuredRepository(
    home,
    makeMe.aRepository.withRevision("then", {}).please(),
  );
  const session = "mixed";
  const file = writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession(session)
      .withCwd(repo.integration)
      .withRow({
        type: "event_msg",
        payload: { type: "task_started", turn_id: "turn" },
      })
      .withRow({
        type: "response_item",
        timestamp: injectedAt,
        payload: { role: "user", content: [{ text: wrapper }] },
      })
      .withRow({
        type: "response_item",
        payload: {
          role: "user",
          content: [
            { text: "<skill>PRIVATE-SKILL</skill>" },
            {
              text: "$dough-slice-planning SEED-404#missing\nRequested effort: high",
            },
          ],
        },
      })
      .withResponse("turn", "answer", { output_tokens: 5 })
      .please(),
  );
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
  await writeUsageHistory({ tasks: [old] }, store);
  await importUsageHistory(options);
  const history = await readUsageHistory(store);
  expect(Object.keys(history.tasks)).toEqual([id]);
  expect(history.tasks[id]).toMatchObject({
    launchedAt: "2026-11-14T10:00:00.000Z",
    workflow: "dough-slice-planning",
    requested: { effort: "high" },
    assignmentEvidence: expect.arrayContaining([
      expect.objectContaining({ status: "rejected", at: injectedAt }),
      expect.objectContaining({
        status: "supported",
        at: "2026-11-14T10:00:00.000Z",
        source: { kind: "native", file, line: 4 },
      }),
    ]) as unknown,
  });
  expect(taskUsage(history, id).tokens.output).toBe(5);
  const responseEvidence = JSON.parse(
    readFileSync(responses, "utf8"),
  ) as UsageResponses;
  expect(JSON.stringify({ ...history, ...responseEvidence })).not.toContain(
    "PRIVATE-",
  );
});
