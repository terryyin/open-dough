import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { test, expect } from "../../tests/usage-history/retainedUsageTest.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import { bytes } from "../../tests/usage-history/agentEffortHarness.ts";
import { costReport } from "../../tests/usage-history/agentEffortCost.ts";
import {
  writeCodexSession,
  writeClaudeSession,
  nativeFile,
} from "../../tests/usage-history/importHarness.ts";

test("Codex actual CLI owns later replies and failed workers once, excludes copied ancestors and a next task", ({
  home,
  root,
}) => {
  keepLaunchStore(home, {
    "open-dough": [
      makeMe.aLaunchRecord
        .executing({ identity: "SEED-7#first", title: "First" })
        .inCodexSession({ sessionId: "root" })
        .withFirstInput({ state: "confirmed", turnId: "first" })
        .please(),
    ],
  });
  const rows = makeMe.aCodexRollout
    .forSession("root")
    .withTurnContext("first")
    .withDeveloperInput("/dough-execute-plan SEED-7#first")
    .withResponse("first", "own", { output_tokens: 7 })
    .withTurnContext("reply")
    .withDeveloperInput("continue")
    .withResponse("reply", "later", { output_tokens: 11 })
    .withSpawnedAgent("worker")
    .withTurnContext("next")
    .withDeveloperInput("/dough-execute-plan SEED-8#next")
    .withResponse("next", "next", { output_tokens: 900 })
    .please();
  writeCodexSession(root, rows);
  const worker = makeMe.aCodexRollout
    .forSession("worker")
    .spawnedFrom("root")
    .withResponse("work", "work", { output_tokens: 3 }, { rootTurnId: "reply" })
    .withResponse("work", "work", { output_tokens: 3 }, { rootTurnId: "reply" })
    .withRow({
      type: "event_msg",
      payload: { type: "error", message: "failed" },
    })
    .please();
  nativeFile(root, "worker", [...rows, ...worker]);
  const before = bytes(home);
  const actual = costReport(home, ["--task", "SEED-7#first"]);
  expect(actual.totals.output.value).toBe(21);
  expect(actual.totals.requests.value).toBe(3);
  expect(actual.agents.flatMap((agent) => agent.responseIds)).toHaveLength(3);
  expect(actual.unownedResponses).toEqual([]);
  expect(bytes(home)).toEqual(before);
});

test("Claude actual CLI retains later reply and cancelled worker, deduplicates streaming rows and excludes the next task", ({
  home,
}) => {
  const reference = "ca7430bd-0d52-499d-a1bd-000000000001";
  const nextReference = "ca7430bd-0d52-499d-a1bd-000000000002";
  const record = (identity: string, ref: string) =>
    makeMe.aLaunchRecord
      .executing({ identity, title: identity })
      .inClaudeSession({ sessionId: "family" })
      .launchedAt(
        ref === reference
          ? "2026-11-14T09:00:00.000Z"
          : "2026-11-14T09:30:00.000Z",
      )
      .reportingThrough({
        origin: "http://localhost:4318",
        reference: ref,
        command: "report",
      })
      .please();
  keepLaunchStore(home, {
    "open-dough": [
      record("SEED-7#first", reference),
      record("SEED-8#next", nextReference),
    ],
  });
  const claude = path.join(home, "claude");
  writeClaudeSession(
    claude,
    makeMe.aClaudeTranscript
      .forSession("family")
      .withLaunchInput({ reference, command: "report" })
      .withAssistant({
        uuid: "own",
        messageId: "own",
        usage: { output_tokens: 7 },
      })
      .withUser({ uuid: "reply", content: "continue" })
      .withAssistant({
        uuid: "later",
        messageId: "later",
        usage: { output_tokens: 11 },
      })
      .withAssistant({
        uuid: "later-replay",
        messageId: "later",
        usage: { output_tokens: 11 },
      })
      .withUser({
        uuid: "worker-result",
        toolUseResult: { agentId: "worker" },
        content: [
          { type: "tool_result", tool_use_id: "tool-1", content: "cancelled" },
        ],
      })
      .withLaunchInput({
        uuid: "next-launch",
        reference: nextReference,
        command: "report",
      })
      .withAssistant({
        uuid: "next",
        messageId: "next",
        usage: { output_tokens: 900 },
      })
      .please(),
  );
  nativeFile(
    path.join(claude, "family", "subagents"),
    "agent-worker",
    makeMe.aClaudeTranscript
      .forSession("family")
      .asSidechain({ agentId: "worker" })
      .withUser({ uuid: "worker-input", parentUuid: null, content: "work" })
      .withAssistant({
        uuid: "work",
        messageId: "work",
        usage: { output_tokens: 3 },
      })
      .please(),
  );
  const before = bytes(home);
  const actual = costReport(home, ["--task", "SEED-7#first"]);
  expect(actual.totals.output.value).toBe(21);
  expect(actual.totals.requests.value).toBe(3);
  expect(
    actual.agents.find((agent) => agent.agentId === "worker")?.totals.output
      .value,
  ).toBe(3);
  expect(actual.unownedResponses).toEqual([]);
  expect(bytes(home)).toEqual(before);
});
