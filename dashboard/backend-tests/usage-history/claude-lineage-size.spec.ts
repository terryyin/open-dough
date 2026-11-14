import assert from "node:assert/strict";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import { taskUsage } from "../../server/usageHistory.ts";
import { expect, test } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  at,
  nativeFile,
  readImported,
  runImport,
} from "../../tests/usage-history/importHarness.ts";

test("imports a long Claude parent chain within bounded memory and retains one response charge with its provenance", ({
  home,
  root,
}) => {
  const sessionId = "long-claude";
  const reference = "ca7430bd-0d52-499d-a1bd-660263c77c12";
  const launch = makeMe.aLaunchRecord
    .executing({
      identity: "SEED-358#reconstruct-codex-and-claude-code-usage-history",
      title: "Recover long native history",
    })
    .inClaudeSession({ sessionId })
    .launchedAt(at)
    .reportingThrough({
      origin: "http://localhost:4318",
      reference,
      command: "report",
    })
    .please();
  keepLaunchStore(home, { "open-dough": [launch] });
  const claude = path.join(home, "claude");
  const rows: object[] = [
    {
      type: "user",
      sessionId,
      uuid: "human",
      parentUuid: null,
      timestamp: at,
      message: {
        content: `Dashboard reporting context:\n- project: open-dough\n- host: claude\n- launch reference: ${reference}\nprivate assignment`,
      },
    },
  ];
  for (let index = 0; index < 1500; index++)
    rows.push({
      type: "assistant",
      sessionId,
      uuid: `row-${index}`,
      parentUuid: index ? `row-${index - 1}` : "human",
      timestamp: at,
      message: {
        id: `response-${index}`,
        usage: {
          input_tokens: 1,
          cache_read_input_tokens: 0,
          cache_creation_input_tokens: 0,
          output_tokens: 1,
        },
      },
    });
  const file = nativeFile(claude, sessionId, rows);
  runImport(
    home,
    root,
    ["--claude-root", claude],
    ["--max-old-space-size=128"],
  );
  const history = readImported(home);
  const task = Object.values(history.tasks)[0];
  assert(task);
  expect(taskUsage(history, task.id)).toMatchObject({
    requests: 1500,
    tokens: { uncachedInput: 1500, output: 1500 },
  });
  const last = Object.values(history.observations).find(
    (item) => item.responseId === "response-1499",
  );
  assert(last);
  expect(last).toMatchObject({
    rootTurnId: "human",
    measurements: [
      expect.objectContaining({ source: { kind: "native", file, line: 1501 } }),
    ],
  });
  expect(history.associations[last.id]).toMatchObject({
    taskId: task.id,
    sources: expect.arrayContaining([{ kind: "native", file, line: 1 }]),
  });
  expect(JSON.stringify(history)).not.toContain("private assignment");
});
