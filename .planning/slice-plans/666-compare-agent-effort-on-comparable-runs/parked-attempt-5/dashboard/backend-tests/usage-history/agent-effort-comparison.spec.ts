import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { test, expect, launch } from "../../tests/usage-history/retainedUsageTest.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import { report, comparisonReport, bytes, command, writeCursorTranscript } from "../../tests/usage-history/agentEffortHarness.ts";
import { writeCodexSession, runImport } from "../../tests/usage-history/importHarness.ts";
import { rmSync } from "node:fs";

const window = { from: "2026-11-14T00:00:00.000Z", until: "2026-11-15T00:00:00.000Z" };
test("explicit continuation groups deduplicate overlapping selections and retain per-execution peaks, settings and supplied judgment context", ({ home, root }) => {
  for (const [session, input, effort] of [["baseline", 100, "high"], ["first", 30, "low"], ["second", 20, "low"]] as const) {
    writeCodexSession(root, makeMe.aCodexRollout.forSession(session).withTurnContext("turn", "model", effort).withResponse("turn", session, { input_tokens: input, cached_input_tokens: 0, cache_write_input_tokens: 0, output_tokens: 5 }).please());
  }
  const member = (family: string) => ({ label: family, host: "codex", family, ...window });
  const manifest = path.join(home, "compare.json");
  writeFileSync(manifest, JSON.stringify({
    baseline: { notes: { outcome: "delivered", proof: "full proof", humanIntervention: "none" }, executions: [member("baseline")] },
    candidate: { notes: { outcome: "linked smaller stories", proof: "less proof", humanIntervention: "manual rescue" }, executions: [member("first"), member("second"), member("first")] },
  }));
  const before = bytes(home);
  const actual = comparisonReport(home, root, manifest);
  expect(actual.candidate.executions).toHaveLength(3);
  expect(actual.candidate.executions.map((item) => item.totals.totalInput.value)).toEqual([30, 20, 30]);
  expect(actual.candidate.perHost[0]?.totals.totalInput.value).toBe(50);
  expect(actual.candidate.perHost[0]?.totals.requests.value).toBe(2);
  expect(actual.candidate.perHost[0]?.agents.map((agent) => agent.peakInput.value).sort()).toEqual([20, 30]);
  expect(actual.deltas[0]?.totals.totalInput?.value).toBe(-50);
  expect(actual.candidate.notes).toEqual({ outcome: "linked smaller stories", proof: "less proof", humanIntervention: "manual rescue" });
  expect(actual.warnings.join(" ")).toMatch(/settings-differences/);
  expect(actual).not.toHaveProperty("winner");
  const readable = execFileSync(process.execPath, [command, "--home", home, "--codex-root", root, "--claude-root", path.join(home, "claude"), "--comparison", manifest], { encoding: "utf8" });
  expect(readable).toContain("manual rescue");
  expect(readable).toContain("deduplicated group");
  expect(bytes(home)).toEqual(before);
});

test("known Codex inclusive input and peak survive missing cache breakdown", ({ home, root }) => {
  writeCodexSession(root, makeMe.aCodexRollout.forSession("inclusive").withResponse("turn", "own", { input_tokens: 123, output_tokens: 7 }).please());
  const actual = report(home, root, ["--host", "codex", "--family", "inclusive", "--from", window.from, "--until", window.until]);
  expect(actual.totals.totalInput.value).toBe(123);
  expect(actual.totals.totalTokens.value).toBe(130);
  expect(actual.totals.uncachedInput.value).toBeNull();
  expect(actual.totals.cachedInput.value).toBeNull();
  expect(actual.agents[0]?.peakInput).toMatchObject({ value: 123, status: "observed-maximum" });
  expect(actual.gaps).toContain("missing-token-components");
});

test("repeated stored task selections and Cursor transcript files do not double charge and mixed hosts have no token deltas", ({ home, root }) => {
  keepLaunchStore(home, { "open-dough": [launch("lost", "turn")] });
  writeCodexSession(root, makeMe.aCodexRollout.forSession("lost").withResponse("turn", "own", { input_tokens: 20, cached_input_tokens: 5, cache_write_input_tokens: 0, output_tokens: 4 }).please());
  runImport(home, root);
  rmSync(root, { recursive: true });
  const cursorRoot = path.join(home, "cursor");
  writeCursorTranscript(path.join(cursorRoot, "family", "family.jsonl"), makeMe.aCursorTranscript.withToolCall("Read", { path: "PLAN.md" }).please());
  const task = { label: "lost", host: "codex", task: "SEED-358#reconstruct-codex-and-claude-code-usage-history" };
  const cursor = { label: "cursor", host: "cursor", family: "family", "cursor-root": [cursorRoot] };
  const manifest = path.join(home, "compare.json");
  writeFileSync(manifest, JSON.stringify({ baseline: { executions: [task, task] }, candidate: { executions: [cursor, cursor] } }));
  const before = bytes(home);
  const actual = comparisonReport(home, root, manifest);
  expect(actual.baseline.perHost[0]?.totals.totalInput.value).toBe(20);
  expect(actual.baseline.perHost[0]?.gaps).toContain("stored-cross-selection-response-dedup-unprovable");
  expect(actual.candidate.perHost[0]?.workflow?.transcripts).toBe(1);
  expect(actual.candidate.perHost[0]?.workflow?.planReads).toBe(1);
  expect(actual.candidate.perHost[0]?.totals.totalInput.value).toBeNull();
  expect(actual.deltas).toEqual([]);
  expect(bytes(home)).toEqual(before);
});
