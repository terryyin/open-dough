import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import { expect, test } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  nodeProcess,
  readStoredRows,
  runImport,
  writeClaudeSession,
} from "../../tests/usage-history/importHarness.ts";

const sessionId = "claude-enrichment";

function assistant(uuid: string, output: number, stop?: null | string) {
  return {
    uuid,
    // Keep these rows unlinked; enrichment cases omit parentUuid.
    chain: false as const,
    ...(stop === undefined ? {} : { stopReason: stop }),
    messageId: "msg-same",
    model: "claude-model",
    usage: {
      input_tokens: 2,
      cache_read_input_tokens: 20,
      cache_creation_input_tokens: 10,
      output_tokens: output,
    },
  };
}

function keepLaunch(home: string) {
  keepLaunchStore(home, {
    "open-dough": [
      makeMe.aLaunchRecord
        .executing({
          identity: "SEED-358#reconstruct-codex-and-claude-code-usage-history",
          title: "Usage recovery",
        })
        .inClaudeSession({ sessionId })
        .please(),
    ],
  });
}

function observation(home: string) {
  const values = Object.values(readStoredRows(home).observations);
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
  writeClaudeSession(
    claudeRoot,
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withAssistant(assistant("partial", 3))
      .withAssistant(assistant("terminal", 690))
      .please(),
  );
  runImport(home, root, ["--claude-root", claudeRoot]);
  const legacy = observation(home);
  expect(legacy.tokens.output).toBeNull();
  expect(legacy.gaps).toContain("contradictory-measurements");
  writeClaudeSession(
    claudeRoot,
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withAssistant(assistant("partial", 3, null))
      .withAssistant(assistant("terminal", 690, "tool_use"))
      .please(),
  );
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
  writeClaudeSession(
    copiedRoot,
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withAssistant(assistant("partial", 3, null))
      .withAssistant(assistant("terminal", 690, "tool_use"))
      .please(),
  );
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
  const collected = readStoredRows(home);
  expect(observation(home).tokens.output).toBe(690);
  expect(observation(home).measurements).toHaveLength(6);
  rmSync(claudeRoot, { recursive: true });
  rmSync(copiedRoot, { recursive: true });
  runImport(home, root, ["--claude-root", claudeRoot]);
  expect(Object.values(readStoredRows(home).observations)).toEqual(
    Object.values(collected.observations),
  );
});

test("retains unavailable legacy conflicts and changed numeric evidence on the same native row", ({
  home,
  root,
}) => {
  keepLaunch(home);
  const claudeRoot = path.join(home, "claude");
  writeClaudeSession(
    claudeRoot,
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withAssistant(assistant("unavailable", 3))
      .withAssistant(assistant("terminal", 8))
      .please(),
  );
  runImport(home, root, ["--claude-root", claudeRoot]);
  writeClaudeSession(
    claudeRoot,
    makeMe.aClaudeTranscript
      .forSession(sessionId)
      .withRow({ type: "system", sessionId })
      .withAssistant(assistant("terminal", 690, "tool_use"))
      .please(),
  );
  runImport(home, root, ["--claude-root", claudeRoot]);
  const retained = observation(home);
  expect(retained.tokens.output).toBeNull();
  expect(retained.gaps).toContain("contradictory-measurements");
  expect(
    retained.measurements.map((item) => item.reported["output_tokens"]),
  ).toEqual([3, 8, 690]);
});
