import path from "node:path";
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  test,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import { bytes } from "../../test-support/usage-history/agentEffortHarness.ts";
import {
  effortCli,
  listedTasks,
  succeeded,
} from "../../test-support/usage-history/agentEffortSelection.ts";
import {
  costReport,
  costViews,
  readableFact,
} from "../../test-support/usage-history/agentEffortCost.ts";
import {
  nativeFile,
  writeClaudeSession,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";

test("a selected launch reports coordinator and failed/cancelled workers once, excludes another task and leaves every input byte unchanged", ({
  home,
  root,
}) => {
  keepLaunchStore(home, {
    "open-dough": [launch("root", "turn"), launch("root", "next")],
  });
  const usage = {
    input_tokens: 100,
    cached_input_tokens: 60,
    cache_write_input_tokens: 10,
    output_tokens: 7,
  };
  const rootRows = makeMe.aCodexRollout
    .forSession("root")
    .withTurnContext("turn")
    .withResponse("turn", "own", usage)
    .withResponse("turn", "own", usage)
    .withResponse("next", "another", { output_tokens: 900 })
    .please();
  writeCodexSession(root, rootRows);
  for (const worker of ["failed", "cancelled"]) {
    const workerRows = makeMe.aCodexRollout
      .forSession(worker)
      .spawnedFrom("root")
      .withResponse(
        "worker-turn",
        worker,
        {
          input_tokens: 20,
          cached_input_tokens: 5,
          cache_write_input_tokens: 0,
          output_tokens: 3,
        },
        { rootTurnId: "turn" },
      )
      .withRow({
        type: "event_msg",
        timestamp: "2026-11-14T10:00:01.000Z",
        payload: {
          type: worker === "cancelled" ? "turn_aborted" : "error",
          turn_id: "worker-turn",
          message: worker === "cancelled" ? "interrupted" : "worker failed",
        },
      })
      .please();
    // A fork's copied ancestor rows are native layout under proof.
    nativeFile(root, worker, [...rootRows, ...workerRows]);
  }
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("conflict")
      .spawnedFrom("root", { spawnParent: "other" })
      .withResponse(
        "worker",
        "stray",
        { output_tokens: 500 },
        { rootTurnId: "turn" },
      )
      .please(),
  );
  const catalog = listedTasks(succeeded(effortCli(home, ["--list", "--json"])));
  const task = catalog.selections.find((item) => item.rootTurnId === "turn");
  if (!task) throw new Error("Expected the retained root turn in the catalog");
  const before = bytes(home);
  const actual = costReport(home, ["--task", task.id]);
  expect(actual.totals).toMatchObject({
    requests: { value: 3 },
    totalInput: { value: 140 },
    uncachedInput: { value: 60 },
    cachedInput: { value: 70 },
    cacheWrite: { value: 10 },
    output: { value: 13 },
    cacheWrite5m: { value: null, status: "unavailable" },
  });
  expect(actual.agents.map((agent) => agent.role).sort()).toEqual([
    "coordinator",
    "worker",
    "worker",
  ]);
  expect(actual.agents.flatMap((agent) => agent.responseIds)).toHaveLength(3);
  expect(actual.gaps).toContain("contradictory-lineage");
  expect(actual.totals.output.status).toBe("partial");
  expect(actual.selection).toMatchObject({
    taskId: task.id,
    rootTurnId: "turn",
    boundary: "shared-Usage-task-ownership",
  });
  expect(actual.agents.some((agent) => agent.sources.length > 0)).toBe(true);
  expect(bytes(home)).toEqual(before);
  const readable = succeeded(effortCli(home, ["--task", task.id]));
  expect(readableFact(readable, "Combined known figures")).toMatchObject({
    totalInput: { value: 140 },
    output: { value: 13 },
  });
  expect(readableFact(readable, "Selection")).toMatchObject({
    taskId: task.id,
    boundary: "shared-Usage-task-ownership",
  });
  expect(readable).toContain("codex agent effort (codex-inclusive-input)");
  expect(readable).toMatch(/^Gaps: .*contradictory-lineage/m);
  expect(bytes(home)).toEqual(before);
});

test("bounded Claude family counts streaming responses once and keeps worker identity and cache lifetimes", ({
  home,
}) => {
  const claude = path.join(home, "claude");
  const usage = {
    input_tokens: 2,
    cache_read_input_tokens: 20,
    cache_creation_input_tokens: 10,
    cache_creation: {
      ephemeral_5m_input_tokens: 3,
      ephemeral_1h_input_tokens: 7,
    },
    output_tokens: 7,
  };
  writeClaudeSession(
    claude,
    makeMe.aClaudeTranscript
      .forSession("family")
      .withAssistant({ uuid: "root-a", messageId: "own", usage })
      .withAssistant({ uuid: "root-b", messageId: "own", usage })
      .withAssistant({
        uuid: "outside-row",
        messageId: "outside",
        timestamp: "2026-11-15T10:00:00.000Z",
        usage: { output_tokens: 999 },
      })
      .please(),
  );
  nativeFile(
    path.join(claude, "family", "subagents"),
    "agent-worker",
    makeMe.aClaudeTranscript
      .forSession("family")
      .asSidechain({ agentId: "worker" })
      .withAssistant({ uuid: "worker-row", messageId: "worker-own", usage })
      .please(),
  );
  const before = bytes(home);
  const actual = costReport(home, [
    "--host",
    "claude",
    "--family",
    "family",
    "--from",
    "2026-11-14T00:00:00.000Z",
    "--until",
    "2026-11-15T00:00:00.000Z",
  ]);
  expect(actual.totals).toMatchObject({
    requests: { value: 2 },
    totalInput: { value: 64 },
    cacheWrite5m: { value: 6 },
    cacheWrite1h: { value: 14 },
    output: { value: 14 },
  });
  expect(
    actual.agents.find((agent) => agent.agentId === "worker"),
  ).toMatchObject({ role: "worker", totals: { requests: { value: 1 } } });
  expect(actual.definition).toBe("claude-disjoint-input");
  expect(actual.selection).toMatchObject({
    from: "2026-11-14T00:00:00.000Z",
    until: "2026-11-15T00:00:00.000Z",
  });
  expect(actual.peakInput).toBeNull();
  expect(actual.idleWakeRequests).toMatchObject({
    value: null,
    status: "unavailable",
  });
  expect(bytes(home)).toEqual(before);
});

test("known Codex inclusive input and peak survive missing cache breakdown", ({
  home,
  root,
}) => {
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("inclusive")
      .withResponse("turn", "own", { input_tokens: 123, output_tokens: 7 })
      .please(),
  );
  const {
    json: actual,
    readable,
    stated,
  } = costViews(home, [
    "--host",
    "codex",
    "--family",
    "inclusive",
    "--from",
    "2026-11-14T00:00:00.000Z",
    "--until",
    "2026-11-15T00:00:00.000Z",
  ]);
  expect(readable).toEqual(stated);
  expect(actual.totals.totalInput.value).toBe(123);
  expect(actual.totals.totalTokens.value).toBe(130);
  expect(actual.totals.uncachedInput.value).toBeNull();
  expect(actual.totals.cachedInput.value).toBeNull();
  expect(actual.agents[0]?.peakInput).toMatchObject({
    value: 123,
    status: "observed-maximum",
  });
  expect(actual.gaps).toContain("missing-token-components");
});
