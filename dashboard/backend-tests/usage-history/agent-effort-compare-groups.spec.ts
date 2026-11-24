// How two groups compare: each execution stays inspectable beside its
// deduplicated per-host group, qualified like-host deltas and supplied notes.
import { writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  test,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  bytes,
  writeCursorTranscript,
} from "../../test-support/usage-history/agentEffortHarness.ts";
import { compareViews } from "../../test-support/usage-history/agentEffortCompare.ts";
import { writeCodexSession } from "../../test-support/usage-history/importHarness.ts";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";

const window = {
  from: "2026-11-14T00:00:00.000Z",
  until: "2026-11-15T00:00:00.000Z",
};
test("explicit continuation groups deduplicate overlapping selections and retain per-execution peaks, settings and supplied judgment context", ({
  home,
  root,
}) => {
  for (const [session, input, effort] of [
    ["baseline", 100, "high"],
    ["first", 30, "low"],
    ["second", 20, "low"],
  ] as const) {
    writeCodexSession(
      root,
      makeMe.aCodexRollout
        .forSession(session)
        .withTurnContext("turn", "model", effort)
        .withResponse("turn", session, {
          input_tokens: input,
          cached_input_tokens: 0,
          cache_write_input_tokens: 0,
          output_tokens: 5,
        })
        .please(),
    );
  }
  const member = (family: string) => ({
    label: family,
    host: "codex",
    family,
    ...window,
  });
  const manifest = path.join(home, "compare.json");
  writeFileSync(
    manifest,
    JSON.stringify({
      baseline: {
        notes: {
          outcome: "delivered",
          proof: "full proof",
          humanIntervention: "none",
        },
        executions: [member("baseline")],
      },
      candidate: {
        notes: {
          outcome: "linked smaller stories",
          proof: "less proof",
          humanIntervention: "manual rescue",
        },
        executions: [member("first"), member("second"), member("first")],
      },
    }),
  );
  const before = bytes(home);
  const { json: actual, readable, stated } = compareViews(home, manifest);
  expect(readable).toEqual(stated);
  expect(actual.candidate.executions).toHaveLength(3);
  expect(
    actual.candidate.executions.map((item) => item.totals.totalInput.value),
  ).toEqual([30, 20, 30]);
  expect(actual.candidate.perHost[0]?.totals.totalInput.value).toBe(50);
  expect(actual.candidate.perHost[0]?.totals.requests.value).toBe(2);
  expect(
    actual.candidate.perHost[0]?.agents
      .map((agent) => agent.peakInput.value)
      .sort(),
  ).toEqual([20, 30]);
  expect(actual.deltas[0]?.totals.totalInput?.value).toBe(-50);
  expect(actual.candidate.notes).toEqual({
    outcome: "linked smaller stories",
    proof: "less proof",
    humanIntervention: "manual rescue",
  });
  expect(actual.warnings.join(" ")).toMatch(/settings-differences/);
  expect(actual.baseline.executions[0]?.totals.totalInput.value).toBe(100);
  expect(Object.keys(actual).sort()).toEqual([
    "baseline",
    "candidate",
    "deltas",
    "format",
    "warnings",
  ]);
  expect(actual.warnings).toContain(
    "exploratory-retrospective-comparison; no automatic improvement or causal claim",
  );
  expect(readable.claim).toBe(
    "Exploratory agent effort comparison; no automatic improvement or causal claim",
  );
  expect(readable.candidate.notes).toMatchObject({
    proof: "less proof",
    humanIntervention: "manual rescue",
  });
  expect(bytes(home)).toEqual(before);
});

test("repeated stored task selections and Cursor transcript files do not double charge and mixed hosts have no token deltas", async ({
  home,
  root,
}) => {
  keepLaunchStore(home, { "open-dough": [launch("lost", "turn")] });
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("lost")
      .withResponse("turn", "own", {
        input_tokens: 20,
        cached_input_tokens: 5,
        cache_write_input_tokens: 0,
        output_tokens: 4,
      })
      .please(),
  );
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  await importUsageHistory(options);
  rmSync(root, { recursive: true });
  const cursorRoot = path.join(home, "cursor");
  writeCursorTranscript(
    path.join(cursorRoot, "family", "family.jsonl"),
    makeMe.aCursorTranscript.withToolCall("Read", { path: "PLAN.md" }).please(),
  );
  const task = {
    label: "lost",
    host: "codex",
    task: "SEED-358#reconstruct-codex-and-claude-code-usage-history",
  };
  const cursor = {
    label: "cursor",
    host: "cursor",
    family: "family",
    "cursor-root": [cursorRoot],
  };
  const manifest = path.join(home, "compare.json");
  writeFileSync(
    manifest,
    JSON.stringify({
      baseline: { executions: [task, task] },
      candidate: { executions: [cursor, cursor] },
    }),
  );
  const before = bytes(home);
  const { json: actual, readable, stated } = compareViews(home, manifest);
  expect(readable).toEqual(stated);
  expect(actual.baseline.perHost[0]?.totals.totalInput.value).toBe(20);
  expect(actual.baseline.perHost[0]?.gaps).toContain(
    "stored-cross-selection-response-dedup-unprovable",
  );
  expect(actual.candidate.perHost[0]?.workflow?.transcripts).toBe(1);
  expect(actual.candidate.perHost[0]?.workflow?.planReads).toBe(1);
  expect(actual.candidate.perHost[0]?.totals.totalInput.value).toBeNull();
  expect(actual.deltas).toEqual([]);
  expect(bytes(home)).toEqual(before);
});
