import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import { expect, test } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  at,
  nativeFile,
  nodeProcess,
  readImported,
  runImport,
} from "../../tests/usage-history/importHarness.ts";

const sessionId = "claude-enrichment";
const row = (uuid: string, output: number, stop?: null | string) => ({
  type: "assistant",
  sessionId,
  uuid,
  timestamp: at,
  message: {
    id: "msg-same",
    model: "claude-model",
    ...(stop === undefined ? {} : { stop_reason: stop }),
    usage: {
      input_tokens: 2,
      cache_read_input_tokens: 20,
      cache_creation_input_tokens: 10,
      output_tokens: output,
    },
  },
});
function keepLaunch(home: string) {
  keepLaunchStore(home, {
    "open-dough": [
      makeMe.aLaunchRecord
        .executing({
          identity: "SEED-358#reconstruct-codex-and-claude-code-usage-history",
          title: "Usage recovery",
        })
        .inClaudeSession({ sessionId })
        .launchedAt(at)
        .please(),
    ],
  });
}
function observation(home: string) {
  const values = Object.values(readImported(home).observations);
  expect(values).toHaveLength(1);
  const [value] = values;
  assert(value);
  return value;
}

test("enriches existing raw measurements in place and keeps terminal evidence across replay, collector overlap and source removal", ({
  home,
  root,
}) => {
  keepLaunch(home);
  const claudeRoot = path.join(home, "claude");
  nativeFile(claudeRoot, sessionId, [row("partial", 3), row("terminal", 690)]);
  runImport(home, root, ["--claude-root", claudeRoot]);
  const legacy = observation(home);
  expect(legacy.tokens.output).toBeNull();
  expect(legacy.gaps).toContain("contradictory-measurements");
  nativeFile(claudeRoot, sessionId, [
    row("partial", 3, null),
    row("terminal", 690, "tool_use"),
  ]);
  runImport(home, root, ["--claude-root", claudeRoot]);
  const enriched = observation(home);
  expect(enriched.tokens.output).toBe(690);
  expect(enriched.measurements).toHaveLength(2);
  expect(
    enriched.measurements.map((fact) =>
      Object.fromEntries(
        Object.entries(fact).filter(([name]) => name !== "completion"),
      ),
    ),
  ).toEqual(legacy.measurements);
  expect(enriched.gaps).not.toContain("contradictory-measurements");
  expect(enriched.gaps).not.toContain("missing-token-components");
  runImport(home, root, ["--claude-root", claudeRoot]);
  expect(observation(home)).toEqual(enriched);
  nodeProcess(
    home,
    `const { writeUsageHistory } = await import('./dashboard/server/usageHistory.ts'); await writeUsageHistory({ observations: [${JSON.stringify(legacy)}] });`,
  );
  expect(observation(home)).toEqual(enriched);
  const copiedRoot = path.join(home, "copied");
  nativeFile(copiedRoot, sessionId, [
    row("partial", 3, null),
    row("terminal", 690, "tool_use"),
  ]);
  runImport(home, root, [
    "--claude-root",
    claudeRoot,
    "--claude-root",
    copiedRoot,
  ]);
  const copied = observation(home);
  expect(copied.tokens.output).toBe(690);
  expect(copied.measurements).toHaveLength(4);
  const collector = {
    ...enriched,
    measurements: enriched.measurements.map((item) => ({
      ...item,
      source: { kind: "native", file: "collector://claude" },
    })),
  };
  nodeProcess(
    home,
    `const { writeUsageHistory } = await import('./dashboard/server/usageHistory.ts'); await writeUsageHistory({ observations: [${JSON.stringify(collector)}] });`,
  );
  const collected = readImported(home);
  expect(observation(home).tokens.output).toBe(690);
  expect(observation(home).measurements).toHaveLength(6);
  rmSync(claudeRoot, { recursive: true });
  rmSync(copiedRoot, { recursive: true });
  runImport(home, root, ["--claude-root", claudeRoot]);
  expect(Object.values(readImported(home).observations)).toEqual(
    Object.values(collected.observations),
  );
});

test("retains unavailable legacy conflicts and changed numeric evidence on the same native row", ({
  home,
  root,
}) => {
  keepLaunch(home);
  const claudeRoot = path.join(home, "claude");
  nativeFile(claudeRoot, sessionId, [
    row("unavailable", 3),
    row("terminal", 8),
  ]);
  runImport(home, root, ["--claude-root", claudeRoot]);
  nativeFile(claudeRoot, sessionId, [
    { type: "system", sessionId },
    row("terminal", 690, "tool_use"),
  ]);
  runImport(home, root, ["--claude-root", claudeRoot]);
  const retained = observation(home);
  expect(retained.tokens.output).toBeNull();
  expect(retained.gaps).toContain("contradictory-measurements");
  expect(
    retained.measurements.map((item) => item.reported["output_tokens"]),
  ).toEqual([3, 8, 690]);
});
