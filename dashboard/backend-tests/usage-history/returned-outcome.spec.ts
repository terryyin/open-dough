import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import { expect, test } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  at,
  nativeFile,
  keepRetainedLaunch,
  readImported,
  runImport,
} from "../../tests/usage-history/importHarness.ts";

test("keeps a matching returned-to-backlog receipt distinct from ordinary reports and ignores a stale marker", ({
  home,
  root,
}) => {
  const returnedReceipt = "11111111-1111-4111-8111-111111111111";
  const currentReceipt = "22222222-2222-4222-8222-222222222222";
  const returned = makeMe.aLaunchRecord
    .executing({ identity: "SEED-42#story", title: "Returned work" })
    .inCodexSession({ sessionId: "returned" })
    .launchedAt(at)
    .completedWith({ receipt: returnedReceipt, message: "" })
    .please();
  const stale = makeMe.aLaunchRecord
    .executing({ identity: "SEED-43#story", title: "Ordinary report" })
    .inCodexSession({ sessionId: "stale-marker" })
    .launchedAt(at)
    .completedWith({ receipt: currentReceipt, message: "" })
    .please();
  const attention = makeMe.aLaunchRecord
    .executing({ identity: "SEED-44#story", title: "Attention report" })
    .inCodexSession({ sessionId: "attention" })
    .launchedAt(at)
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
  runImport(home, root);
  const history = readImported(home);
  const tasks = Object.values(history.tasks);
  const returnedTask = tasks.find((task) => task.sessionId === "returned");
  const staleTask = tasks.find((task) => task.sessionId === "stale-marker");
  const attentionTask = tasks.find((task) => task.sessionId === "attention");
  assert(returnedTask && staleTask && attentionTask);
  expect(returnedTask.outcome).toEqual({
    kind: "reported-complete",
    at,
    attention: false,
    disposition: "returned-to-backlog",
  });
  expect(staleTask.outcome).toEqual({
    kind: "reported-complete",
    at,
    attention: false,
  });
  expect(attentionTask.outcome).toEqual({
    kind: "reported-complete",
    at,
    attention: true,
  });
  expect(returnedTask.fieldSources?.outcome).toEqual([
    expect.objectContaining({ kind: "history", file: historyFile }),
  ]);
  expect(JSON.stringify(history)).not.toContain("PRIVATE-ATTENTION-MESSAGE");
  expect(readFileSync(historyFile, "utf8")).toBe(historyBytes);
  expect(readFileSync(operationalFile, "utf8")).toBe(operationalBytes);
  runImport(home, root);
  expect(readImported(home)).toEqual(history);
});

test("enriches a native report with matching retained return evidence without inventing a conflicting outcome", ({
  home,
  root,
}) => {
  const sessionId = "native-then-retained";
  const reference = "ca7430bd-0d52-499d-a1bd-660263c77c12";
  const receipt = "11111111-1111-4111-8111-111111111111";
  const claude = path.join(home, "claude");
  nativeFile(claude, sessionId, [
    {
      type: "user",
      sessionId,
      uuid: "task",
      parentUuid: null,
      timestamp: at,
      message: {
        content: `$dough-execute-plan SEED-42#story\nDashboard reporting context:\n- project: open-dough\n- host: claude\n- launch reference: ${reference}\n`,
      },
    },
    {
      type: "assistant",
      sessionId,
      uuid: "response",
      parentUuid: "task",
      timestamp: at,
      message: { id: "answer", usage: { output_tokens: 5 } },
    },
    {
      type: "user",
      sessionId,
      uuid: "receipt",
      parentUuid: "response",
      timestamp: at,
      message: {
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
              receivedAt: at,
            }),
          },
        ],
      },
    },
  ]);
  runImport(home, root, ["--claude-root", claude]);
  const initial = readImported(home);
  const task = Object.values(initial.tasks)[0];
  assert(task);
  expect(task.outcome).toEqual({
    kind: "reported-complete",
    at,
    attention: false,
  });
  const record = makeMe.aLaunchRecord
    .executing({ identity: "SEED-42#story", title: "Returned work" })
    .inClaudeSession({ sessionId })
    .launchedAt(at)
    .reportingThrough({
      reference,
      origin: "http://localhost:4318",
      command: "report",
    })
    .completedWith({ receipt, reference, message: "" })
    .please();
  keepRetainedLaunch(home, { ...record, returnedToBacklog: receipt });
  runImport(home, root, ["--claude-root", claude]);
  const enriched = readImported(home);
  expect(Object.keys(enriched.tasks)).toEqual([task.id]);
  expect(enriched.tasks[task.id]?.outcome).toEqual({
    kind: "reported-complete",
    at,
    attention: false,
    disposition: "returned-to-backlog",
  });
  expect(enriched.tasks[task.id]?.gaps).not.toContain(
    "contradictory-task-field:outcome",
  );
  runImport(home, root, ["--claude-root", claude]);
  expect(readImported(home)).toEqual(enriched);
});

test("retains conflicting report kind and time as evidence instead of selecting the newest report", ({
  home,
  root,
}) => {
  const later = "2026-11-14T11:00:00.000Z";
  const completed = makeMe.aLaunchRecord
    .executing({ identity: "SEED-42#story", title: "Reported work" })
    .inCodexSession({ sessionId: "conflicting-reports" })
    .launchedAt(at)
    .completedWith({ message: "" })
    .please();
  keepLaunchStore(home, { "open-dough": [completed] });
  runImport(home, root);
  const original = Object.values(readImported(home).tasks)[0];
  assert(original);
  const unfinished = makeMe.aLaunchRecord
    .executing({ identity: "SEED-42#story", title: "Reported work" })
    .inCodexSession({ sessionId: "conflicting-reports" })
    .launchedAt(at)
    .completedWith({ outcome: "unfinished", receivedAt: later, message: "" })
    .please();
  keepLaunchStore(home, { "open-dough": [unfinished] });
  runImport(home, root);
  const history = readImported(home);
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
      { kind: "reported-complete", at, attention: false },
      { kind: "reported-incomplete", at: later, attention: false },
    ]),
  );
});
