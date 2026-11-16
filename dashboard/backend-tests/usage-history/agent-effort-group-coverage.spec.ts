import { writeFileSync, symlinkSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  test,
  expect,
  launch,
} from "../../tests/usage-history/retainedUsageTest.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
  comparisonReport,
  report,
  bytes,
  writeCursorTranscript,
} from "../../tests/usage-history/agentEffortHarness.ts";
import {
  writeCodexSession,
  runImport,
} from "../../tests/usage-history/importHarness.ts";

import { writeWakeEvidence } from "../../tests/usage-history/agentEffortWakeFixtures.ts";

const window = {
  from: "2026-11-14T00:00:00.000Z",
  until: "2026-11-15T00:00:00.000Z",
};
test("group peaks qualify the deduplicated request union when a second selection lacks input", ({
  home,
  root,
}) => {
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("family")
      .withResponse("turn", "known", {
        input_tokens: 100,
        cached_input_tokens: 0,
        cache_write_input_tokens: 0,
        output_tokens: 2,
      })
      .withResponse(
        "turn",
        "unknown",
        { output_tokens: 3 },
        { timestamp: "2026-11-14T11:00:00.000Z" },
      )
      .please(),
  );
  const narrow = {
    label: "complete narrow",
    host: "codex",
    family: "family",
    ...window,
    until: "2026-11-14T10:30:00.000Z",
  };
  const wide = {
    label: "missing input",
    host: "codex",
    family: "family",
    ...window,
  };
  const manifest = path.join(home, "comparison.json");
  writeFileSync(
    manifest,
    JSON.stringify({
      baseline: { executions: [narrow] },
      candidate: { executions: [narrow, wide, narrow] },
    }),
  );
  const before = bytes(home);
  const actual = comparisonReport(home, root, manifest);
  expect(actual.baseline.perHost[0]?.agents[0]?.peakInput).toMatchObject({
    value: 100,
    status: "observed-maximum",
    observedRequests: 1,
    missingInputRequests: 0,
  });
  expect(actual.candidate.perHost[0]?.agents[0]?.peakInput).toMatchObject({
    value: 100,
    status: "observed-lower-bound",
    observedRequests: 2,
    missingInputRequests: 1,
  });
  expect(actual.candidate.perHost[0]?.totals.requests.value).toBe(2);
  expect(actual.warnings.join()).toContain("coverage-differences;");
  expect(bytes(home)).toEqual(before);
});

test("same-session stored counters cannot double-charge native evidence and disjoint stored workers survive", ({
  home,
  root,
}) => {
  keepLaunchStore(home, { "open-dough": [launch("family", "turn")] });
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("family")
      .withResponse("turn", "own", {
        input_tokens: 20,
        cached_input_tokens: 0,
        cache_write_input_tokens: 0,
        output_tokens: 4,
      })
      .please(),
  );
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("stored-worker")
      .spawnedFrom("family")
      .withResponse(
        "work",
        "work",
        {
          input_tokens: 30,
          cached_input_tokens: 0,
          cache_write_input_tokens: 0,
          output_tokens: 5,
        },
        { rootTurnId: "turn" },
      )
      .please(),
  );
  runImport(home, root);
  const task = {
    label: "native and stored worker",
    host: "codex",
    task: "SEED-358#reconstruct-codex-and-claude-code-usage-history",
    "codex-root": [],
    "codex-file": [path.join(root, "family.jsonl")],
  };
  const stored = {
    ...task,
    label: "stored only",
    "codex-file": [],
    "codex-root": [path.join(home, "absent")],
  };
  const manifest = path.join(home, "comparison.json");
  writeFileSync(
    manifest,
    JSON.stringify({
      baseline: { executions: [task] },
      candidate: { executions: [stored, task, stored] },
    }),
  );
  const before = bytes(home);
  const actual = comparisonReport(home, root, manifest);
  expect(
    actual.candidate.executions.map(
      (execution) => execution.totals.totalInput.value,
    ),
  ).toEqual([50, 50, 50]);
  expect(actual.candidate.perHost[0]?.totals.totalInput).toMatchObject({
    value: 50,
    status: "partial",
  });
  expect(actual.candidate.perHost[0]?.totals.requests.value).toBe(2);
  expect(actual.candidate.perHost[0]?.gaps).toContain(
    "stored-native-response-overlap-unprovable:family",
  );
  expect(bytes(home)).toEqual(before);
});

test("Cursor group canonicalizes symlink aliases while retaining both selected executions", ({
  home,
  root,
}) => {
  const real = path.join(home, "cursor");
  const alias = path.join(home, "alias");
  writeCursorTranscript(
    path.join(real, "family", "family.jsonl"),
    makeMe.aCursorTranscript.withToolCall("TodoWrite", {}).please(),
  );
  symlinkSync(real, alias, "dir");
  const member = (source: string) => ({
    label: source,
    host: "cursor",
    family: "family",
    "cursor-root": [source],
  });
  const manifest = path.join(home, "comparison.json");
  writeFileSync(
    manifest,
    JSON.stringify({
      baseline: { executions: [member(real)] },
      candidate: { executions: [member(real), member(alias)] },
    }),
  );
  const actual = comparisonReport(home, root, manifest);
  expect(actual.candidate.executions).toHaveLength(2);
  expect(actual.candidate.perHost[0]?.workflow).toMatchObject({
    transcripts: 1,
    todoWriteCalls: 1,
  });
  expect(actual.candidate.perHost[0]?.agents).toHaveLength(1);
});

test("grouped input peak stays complete when only wake evidence is partial", ({
  home,
  root,
}) => {
  const host = "codex";
  writeWakeEvidence(home, root, host, {
    name: "empty continuation",
    outputs: [""],
  });
  const member = {
    label: "known input, partial wakes",
    host,
    family: "family",
    ...window,
  };
  const manifest = path.join(home, "comparison.json");
  writeFileSync(
    manifest,
    JSON.stringify({
      baseline: { executions: [member] },
      candidate: { executions: [member] },
    }),
  );
  const before = bytes(home);
  const individual = report(home, root, [
    "--host",
    host,
    "--family",
    "family",
    "--from",
    window.from,
    "--until",
    window.until,
  ]);
  const comparison = comparisonReport(home, root, manifest);
  expect(individual.agents[0]?.peakInput).toMatchObject({
    value: 10,
    status: "observed-maximum",
  });
  for (const side of [comparison.baseline, comparison.candidate]) {
    expect(side.perHost[0]?.agents[0]?.peakInput).toEqual(
      individual.agents[0]?.peakInput,
    );
    expect(side.perHost[0]?.idleWakeRequests).toMatchObject({
      value: 1,
      status: "partial",
      classifiedRequests: 1,
      unclassifiedRequests: 1,
    });
    expect(side.perHost[0]?.gaps).toContain("idle-wake-evidence-partial");
  }
  expect(bytes(home)).toEqual(before);
});
