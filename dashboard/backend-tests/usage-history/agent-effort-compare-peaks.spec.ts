// How two groups compare per agent: group peaks and idle wakes are
// recomputed from the deduplicated request union with their coverage.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  test,
  expect,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import { bytes } from "../../test-support/usage-history/agentEffortHarness.ts";
import { compareViews } from "../../test-support/usage-history/agentEffortCompare.ts";
import { writeCodexSession } from "../../test-support/usage-history/importHarness.ts";
import { costReport } from "../../test-support/usage-history/agentEffortCost.ts";
import { writeWakeEvidence } from "../../test-support/usage-history/agentEffortWakeFixtures.ts";

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
  const { json: actual, readable, stated } = compareViews(home, manifest);
  expect(readable).toEqual(stated);
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
  const individual = costReport(home, [
    "--host",
    host,
    "--family",
    "family",
    "--from",
    window.from,
    "--until",
    window.until,
  ]);
  const { json: comparison, readable, stated } = compareViews(home, manifest);
  expect(readable).toEqual(stated);
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
