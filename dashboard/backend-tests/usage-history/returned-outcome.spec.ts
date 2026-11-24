import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { claudeReportingContext } from "../../../Distribution/tests/support/claudeReportingContext.mjs";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import { test } from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  keepRetainedLaunch,
  writeClaudeSession,
} from "../../test-support/usage-history/importHarness.ts";
import {
  readUsageHistory,
  usageHistoryFile,
} from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";

test("keeps a matching returned-to-backlog receipt distinct from ordinary reports and ignores a stale marker", async ({
  home,
  root,
}) => {
  const returnedReceipt = "11111111-1111-4111-8111-111111111111";
  const currentReceipt = "22222222-2222-4222-8222-222222222222";
  const returned = makeMe.aLaunchRecord
    .executing({ identity: "SEED-42#story", title: "Returned work" })
    .inCodexSession({ sessionId: "returned" })
    .completedWith({ receipt: returnedReceipt, message: "" })
    .please();
  const stale = makeMe.aLaunchRecord
    .executing({ identity: "SEED-43#story", title: "Ordinary report" })
    .inCodexSession({ sessionId: "stale-marker" })
    .completedWith({ receipt: currentReceipt, message: "" })
    .please();
  const attention = makeMe.aLaunchRecord
    .executing({ identity: "SEED-44#story", title: "Attention report" })
    .inCodexSession({ sessionId: "attention" })
    .completedWith({ message: "PRIVATE-ATTENTION-MESSAGE" })
    .please();
  // These exact incoming wire fields protect the additive supplier contract.
  keepRetainedLaunch(home, { ...returned, returnedToBacklog: returnedReceipt });
  keepLaunchStore(home, {
    "open-dough": [{ ...stale, returnedToBacklog: returnedReceipt }, attention],
  });
  const historyFile = path.join(
    home,
    ".open-dough/dashboard/launch-history/2026-11.jsonl",
  );
  const operationalFile = path.join(
    home,
    ".open-dough/dashboard/agent-launches.json",
  );
  const historyBytes = readFileSync(historyFile, "utf8");
  const operationalBytes = readFileSync(operationalFile, "utf8");
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  await importUsageHistory(options);
  const history = {
    ...(await readUsageHistory(options.store)),
    ...(JSON.parse(readFileSync(options.responses, "utf8")) as UsageResponses),
  };
  const tasks = Object.values(history.tasks);
  const returnedTask = tasks.find((task) => task.sessionId === "returned");
  const staleTask = tasks.find((task) => task.sessionId === "stale-marker");
  const attentionTask = tasks.find((task) => task.sessionId === "attention");
  assert(returnedTask && staleTask && attentionTask);
  expect(returnedTask.outcome).toEqual({
    kind: "reported-complete",
    at: "2026-11-14T10:00:00.000Z",
    attention: false,
    disposition: "returned-to-backlog",
  });
  expect(staleTask.outcome).toEqual({
    kind: "reported-complete",
    at: "2026-11-14T10:00:00.000Z",
    attention: false,
  });
  expect(attentionTask.outcome).toEqual({
    kind: "reported-complete",
    at: "2026-11-14T10:00:00.000Z",
    attention: true,
  });
  expect(returnedTask.fieldSources?.outcome).toEqual([
    expect.objectContaining({ kind: "history", file: historyFile }),
  ]);
  expect(JSON.stringify(history)).not.toContain("PRIVATE-ATTENTION-MESSAGE");
  expect(readFileSync(historyFile, "utf8")).toBe(historyBytes);
  expect(readFileSync(operationalFile, "utf8")).toBe(operationalBytes);
  await importUsageHistory(options);
  expect({
    ...(await readUsageHistory(options.store)),
    ...(JSON.parse(readFileSync(options.responses, "utf8")) as UsageResponses),
  }).toEqual(history);
});

test("enriches a native report with matching retained return evidence without inventing a conflicting outcome", async ({
  home,
  root,
}) => {
  const sessionId = "native-then-retained";
  const reference = "ca7430bd-0d52-499d-a1bd-660263c77c12";
  const receipt = "11111111-1111-4111-8111-111111111111";
  const claude = path.join(home, "claude");
  writeClaudeSession(
    claude,
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withUser({
        uuid: "task",
        parentUuid: null,
        content: `$dough-execute-plan SEED-42#story\n${claudeReportingContext({ reference })}\n`,
      })
      .withAssistant({
        uuid: "response",
        messageId: "answer",
        usage: { output_tokens: 5 },
      })
      .withUser({
        uuid: "receipt",
        content: [
          {
            type: "tool_result",
            tool_use_id: "report",
            content: JSON.stringify({
              state: "recorded",
              receipt,
              reference,
              outcome: "completed",
              message: "",
              receivedAt: "2026-11-14T10:00:00.000Z",
            }),
          },
        ],
      })
      .please(),
  );
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: [claude],
    })
    .please();
  await importUsageHistory(options);
  const initial = await readUsageHistory(options.store);
  const task = Object.values(initial.tasks)[0];
  assert(task);
  expect(task.outcome).toEqual({
    kind: "reported-complete",
    at: "2026-11-14T10:00:00.000Z",
    attention: false,
  });
  const record = makeMe.aLaunchRecord
    .executing({ identity: "SEED-42#story", title: "Returned work" })
    .inClaudeSession({ sessionId })
    .reportingThrough({
      reference,
      origin: "http://localhost:4318",
      command: "report",
    })
    .completedWith({ receipt, reference, message: "" })
    .please();
  keepRetainedLaunch(home, { ...record, returnedToBacklog: receipt });
  await importUsageHistory(options);
  const enriched = {
    ...(await readUsageHistory(options.store)),
    ...(JSON.parse(readFileSync(options.responses, "utf8")) as UsageResponses),
  };
  expect(Object.keys(enriched.tasks)).toEqual([task.id]);
  expect(enriched.tasks[task.id]?.outcome).toEqual({
    kind: "reported-complete",
    at: "2026-11-14T10:00:00.000Z",
    attention: false,
    disposition: "returned-to-backlog",
  });
  expect(enriched.tasks[task.id]?.gaps).not.toContain(
    "contradictory-task-field:outcome",
  );
  await importUsageHistory(options);
  expect({
    ...(await readUsageHistory(options.store)),
    ...(JSON.parse(readFileSync(options.responses, "utf8")) as UsageResponses),
  }).toEqual(enriched);
});

test("retains conflicting report kind and time as evidence instead of selecting the newest report", async ({
  home,
  root,
}) => {
  const later = "2026-11-14T11:00:00.000Z";
  const completed = makeMe.aLaunchRecord
    .executing({ identity: "SEED-42#story", title: "Reported work" })
    .inCodexSession({ sessionId: "conflicting-reports" })
    .completedWith({ message: "" })
    .please();
  keepLaunchStore(home, { "open-dough": [completed] });
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  await importUsageHistory(options);
  const initial = await readUsageHistory(options.store);
  const [original] = Object.values(initial.tasks);
  assert(original);
  const unfinished = makeMe.aLaunchRecord
    .executing({ identity: "SEED-42#story", title: "Reported work" })
    .inCodexSession({ sessionId: "conflicting-reports" })
    .completedWith({ outcome: "unfinished", receivedAt: later, message: "" })
    .please();
  keepLaunchStore(home, { "open-dough": [unfinished] });
  await importUsageHistory(options);
  const history = await readUsageHistory(options.store);
  expect(Object.keys(history.tasks)).toEqual([original.id]);
  expect(history.tasks[original.id]?.outcome).toBeNull();
  expect(history.tasks[original.id]?.gaps).toContain(
    "contradictory-task-field:outcome",
  );
  expect(
    history.tasks[original.id]?.fieldClaims?.outcome?.map(
      (claim) => claim.value,
    ),
  ).toEqual(
    expect.arrayContaining([
      {
        kind: "reported-complete",
        at: "2026-11-14T10:00:00.000Z",
        attention: false,
      },
      { kind: "reported-incomplete", at: later, attention: false },
    ]),
  );
});
