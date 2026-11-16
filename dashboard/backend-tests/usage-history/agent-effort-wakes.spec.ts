import { test, expect } from "../../tests/usage-history/retainedUsageTest.ts";
import { bytes, report } from "../../tests/usage-history/agentEffortHarness.ts";
import { writeWakeEvidence } from "../../tests/usage-history/agentEffortWakeFixtures.ts";

const flags = (host: string) => [
  "--host",
  host,
  "--family",
  "family",
  "--from",
  "2026-11-14T00:00:00.000Z",
  "--until",
  "2026-11-15T00:00:00.000Z",
];
const cases = [
  {
    name: "empty continuation",
    outputs: [""],
    idle: 1,
    unknown: 1,
    progress: 0,
    clock: 0,
  },
  {
    name: "explicit timeout",
    outputs: [""],
    idle: 1,
    unknown: 1,
    progress: 0,
    clock: 0,
  },
  {
    name: "useful output",
    outputs: ["progress"],
    idle: 0,
    unknown: 1,
    progress: 1,
    clock: 0,
  },
  {
    name: "mixed results",
    outputs: ["", "progress"],
    idle: null,
    unknown: 2,
    progress: 0,
    clock: 0,
  },
  {
    name: "clock only",
    outputs: ["time"],
    idle: 0,
    unknown: 1,
    progress: 0,
    clock: 1,
  },
  {
    name: "missing pairing",
    outputs: [""],
    idle: null,
    unknown: 2,
    progress: 0,
    clock: 0,
  },
  {
    name: "duplicate result",
    outputs: ["", ""],
    idle: 1,
    unknown: 1,
    progress: 0,
    clock: 0,
  },
  {
    name: "empty initial launch",
    outputs: [""],
    idle: null,
    unknown: 2,
    progress: 0,
    clock: 0,
  },
  {
    name: "incomplete result batch",
    outputs: ["", ""],
    idle: null,
    unknown: 2,
    progress: 0,
    clock: 0,
  },
  {
    name: "streamed missing result",
    outputs: ["", ""],
    idle: null,
    unknown: 2,
    progress: 0,
    clock: 0,
  },
  {
    name: "turn boundary",
    outputs: [""],
    idle: null,
    unknown: 2,
    progress: 0,
    clock: 0,
  },
  {
    name: "unsupported wrapper",
    outputs: [""],
    idle: null,
    unknown: 2,
    progress: 0,
    clock: 0,
  },
  {
    name: "conflicting replay",
    outputs: ["progress", "", ""],
    idle: null,
    unknown: 2,
    progress: 0,
    clock: 0,
  },
  {
    name: "conflicting native uuid",
    outputs: ["progress", "", ""],
    idle: null,
    unknown: 2,
    progress: 0,
    clock: 0,
  },
  {
    name: "mismatched continuation identity",
    outputs: [""],
    idle: null,
    unknown: 2,
    progress: 0,
    clock: 0,
  },
  {
    name: "empty cell continuation",
    outputs: [""],
    idle: 1,
    unknown: 1,
    progress: 0,
    clock: 0,
  },
  {
    name: "mismatched cell identity",
    outputs: [""],
    idle: null,
    unknown: 2,
    progress: 0,
    clock: 0,
  },
  {
    name: "intervening developer input",
    outputs: [""],
    idle: null,
    unknown: 2,
    progress: 0,
    clock: 0,
  },
];
for (const host of ["codex", "claude"])
  for (const scenario of cases) {
    test(`${host} wake exposure: ${scenario.name} preserves owned requests and conservative coverage`, ({
      home,
      root,
    }) => {
      writeWakeEvidence(home, root, host, scenario);
      // Claude recognizes only the historical whole-body timeout envelope:
      // https://github.com/anthropics/claude-code/issues/36532
      // Other TaskOutput formats remain uncovered, including useful output.
      const claudeUseful =
        host === "claude" && scenario.name === "useful output";
      const before = bytes(home);
      const actual = report(home, root, flags(host));
      expect(actual.totals.requests.value).toBe(2);
      expect(actual.idleWakeRequests).toMatchObject({
        value: claudeUseful ? null : scenario.idle,
        status:
          claudeUseful || scenario.idle === null ? "unavailable" : "partial",
        classifiedRequests: claudeUseful ? 0 : 2 - scenario.unknown,
        unclassifiedRequests: claudeUseful ? 2 : scenario.unknown,
        progressRequests: claudeUseful ? 0 : scenario.progress,
        clockOnlyRequests: scenario.clock,
        mixedResultRequests:
          host === "codex" && scenario.name === "mixed results" ? 1 : 0,
      });
      expect(actual.agents[0]?.idleWakeRequests).toEqual(
        actual.idleWakeRequests,
      );
      expect(actual.idleWakeRule).toContain("not waste or savings");
      expect(JSON.stringify(actual)).not.toContain('"tool_result"');
      expect(bytes(home)).toEqual(before);
    });
  }

for (const host of ["codex", "claude"])
  test(`${host} wake coverage is complete when every selected request has a supported paired result`, ({
    home,
    root,
  }) => {
    writeWakeEvidence(home, root, host, {
      name: "covered window",
      outputs: [""],
    });
    const actual = report(home, root, flags(host));
    expect(actual.totals.requests.value).toBe(1);
    expect(actual.idleWakeRequests).toMatchObject({
      value: 1,
      status: "complete",
      classifiedRequests: 1,
      unclassifiedRequests: 0,
    });
    expect(actual.gaps).not.toContain("idle-wake-evidence-unavailable");
    expect(actual.gaps).not.toContain("idle-wake-evidence-partial");
  });
