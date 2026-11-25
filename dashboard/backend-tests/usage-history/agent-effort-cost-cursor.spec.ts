import { statSync } from "node:fs";
import path from "node:path";
import { expect } from "vitest";
import { test } from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  bytes,
  writeCursorTranscript,
} from "../../test-support/usage-history/agentEffortHarness.ts";
import {
  cursorCost,
  readableFact,
} from "../../test-support/usage-history/agentEffortCost.ts";
import {
  cursorCli,
  succeeded,
} from "../../test-support/usage-history/agentEffortSelection.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

test("Cursor reports belonging nested workers and recorded dynamic tools without charging another family", ({
  home,
  root,
}) => {
  const coordinator = path.join(root, "family/family.jsonl");
  const worker = path.join(root, "family/subagents/worker.jsonl");
  const nested = path.join(
    root,
    "family/subagents/worker/subagents/nested.jsonl",
  );
  writeCursorTranscript(
    coordinator,
    makeMe.aCursorTranscript
      .withToolCall("Read", { path: "/project/PLAN.md" }, { id: "plan" })
      .withToolResult("plan", "PRIVATE TRANSCRIPT BODY")
      .withToolCall(
        "Read",
        { path: "/project/.agents/skills/work/SKILL.md" },
        { dynamic: true },
      )
      .withToolCall("Task", {}, { dynamic: true })
      .withToolCall("Task", {})
      .withToolCall("Task", {})
      .withToolCall("AwaitShell", {}, { dynamic: true })
      .withToolCall("TodoWrite", {}, { dynamic: true })
      .please(),
  );
  writeCursorTranscript(
    worker,
    makeMe.aCursorTranscript
      .withToolCall("Read", { path: "/project/file.ts" })
      .please(),
  );
  writeCursorTranscript(
    nested,
    makeMe.aCursorTranscript.withToolCall("TodoWrite", {}).please(),
  );
  writeCursorTranscript(
    path.join(root, "other/other.jsonl"),
    makeMe.aCursorTranscript.withToolCall("TodoWrite", {}).please(),
  );
  const before = bytes(home);
  const actual = cursorCost(home, root);
  expect(actual.workflow).toMatchObject({
    transcripts: 3,
    workers: 2,
    toolCalls: 9,
    readCalls: 3,
    planReads: 1,
    skillReads: 1,
    taskCalls: 3,
    awaitShellCalls: 1,
    todoWriteCalls: 2,
    dynamicToolCalls: 4,
    missingResults: 8,
    bytes:
      statSync(coordinator).size +
      statSync(worker).size +
      statSync(nested).size,
  });
  expect(
    actual.agents.map((agent) => [agent.role, agent.workflow?.toolCalls]),
  ).toEqual([
    ["coordinator", 7],
    ["worker", 1],
    ["worker", 1],
  ]);
  expect(actual.sources.map((source) => source.file)).toEqual([
    coordinator,
    worker,
    nested,
  ]);
  expect(actual.requestedSettings).toBeNull();
  expect(actual.observedSettings).toEqual([]);
  expect(actual.observedSettingsCoverage).toMatchObject({
    model: null,
    effort: null,
    serviceTier: null,
    status: "unavailable",
  });
  for (const agent of actual.agents) {
    expect(agent.requestedSettings).toBeNull();
    expect(agent.observedSettings).toEqual([]);
    expect(agent.observedSettingsCoverage).toMatchObject({
      model: null,
      effort: null,
      serviceTier: null,
      status: "unavailable",
    });
  }
  expect(actual.gaps).toContain("observed-settings-unavailable");
  for (const metric of Object.values(actual.totals))
    expect(metric).toEqual({ value: null, status: "unavailable" });
  expect(actual.peakInput).toBeNull();
  expect(actual.idleWakeRequests).toEqual({
    value: null,
    status: "unavailable",
  });
  expect(actual.gaps).toEqual(
    expect.arrayContaining([
      "missing-worker-evidence",
      "tool-results-unavailable",
      "native-turn-boundary-unavailable",
      "token-counters-unavailable",
    ]),
  );
  expect(JSON.stringify(actual)).not.toContain("PRIVATE TRANSCRIPT BODY");
  expect(actual.accounting).toContain("not token or live-context estimates");
  expect(bytes(home)).toEqual(before);
});

test("Cursor counts consistent known tool ids once and exposes conflicts and ID-less row uncertainty", ({
  home,
  root,
}) => {
  writeCursorTranscript(
    path.join(root, "family/family.jsonl"),
    makeMe.aCursorTranscript
      .withToolCall("Read", { path: "/project/PLAN.md" }, { id: "replayed" })
      .withToolCall("Read", { path: "/project/PLAN.md" }, { id: "replayed" })
      .withToolCall("TodoWrite", {}, { id: "conflicted" })
      .withToolCall("Task", {}, { id: "conflicted" })
      // Exact ID-less wire rows deliberately preserve the native sample's shape.
      .withRow({
        role: "assistant",
        message: {
          content: [{ type: "tool_use", name: "TodoWrite", input: {} }],
        },
      })
      .withRow({
        role: "assistant",
        message: {
          content: [{ type: "tool_use", name: "TodoWrite", input: {} }],
        },
      })
      .please(),
  );
  const before = bytes(home);
  const actual = cursorCost(home, root);
  expect(actual.workflow).toMatchObject({
    toolCalls: 3,
    readCalls: 1,
    planReads: 1,
    todoWriteCalls: 2,
    taskCalls: 0,
    identifiedToolCalls: 1,
    unidentifiedToolCallRows: 2,
    conflictingToolCallIds: 1,
  });
  expect(actual.gaps).toEqual(
    expect.arrayContaining([
      "tool-call-identity-unavailable",
      "conflicting-tool-call-identity",
    ]),
  );
  expect(actual.accounting).toContain("unknown uniqueness");
  expect(bytes(home)).toEqual(before);
});

test("Cursor readable output keeps transcript bytes as bytes and token figures unavailable", ({
  home,
}) => {
  const root = path.join(home, "cursor");
  const file = path.join(root, "family", "family.jsonl");
  writeCursorTranscript(
    file,
    makeMe.aCursorTranscript.withToolCall("Read", { path: "PLAN.md" }).please(),
  );
  const readable = succeeded(cursorCli(home, [root], ["--family", "family"]));
  expect(readableFact(readable, "Workflow")).toMatchObject({
    transcripts: 1,
    bytes: statSync(file).size,
  });
  const totals = readableFact(readable, "Combined known figures") as Record<
    string,
    { value: number | null; status: string }
  >;
  for (const figure of ["totalInput", "output", "totalTokens"])
    expect(totals[figure]).toEqual({ value: null, status: "unavailable" });
  expect(Object.values(totals)).not.toContainEqual(
    expect.objectContaining({ value: statSync(file).size }),
  );
});
