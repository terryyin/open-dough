import { writeFileSync } from "node:fs";
import path from "node:path";
import {
  costViews,
  costReport,
} from "../../test-support/usage-history/agentEffortCost.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  test,
  expect,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  writeClaudeSession,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";

const familyFlags = [
  "--host",
  "claude",
  "--family",
  "family",
  "--from",
  "2026-11-14T00:00:00.000Z",
  "--until",
  "2026-11-15T00:00:00.000Z",
];

test("Codex maxima use inclusive input per agent and aggregate observed settings separately from launch requests", ({
  home,
  root,
}) => {
  keepLaunchStore(home, { "open-dough": [launch("root", "turn")] });
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("root")
      .withSpawnedAgent("absent-worker")
      .withTurnContext("turn", "observed-one", "medium")
      .withAppliedSettings({ serviceTier: "default" })
      .withResponse("turn", "one", {
        input_tokens: 100,
        cached_input_tokens: 60,
        cache_write_input_tokens: 10,
        output_tokens: 5,
      })
      .withResponse("turn", "two", {
        input_tokens: 200,
        cached_input_tokens: 150,
        cache_write_input_tokens: 20,
        output_tokens: 10,
      })
      .withTurnContext("turn", "observed-two", "low")
      .withAppliedSettings({ serviceTier: "fast" })
      .withResponse("turn", "three", {
        input_tokens: 150,
        cached_input_tokens: 30,
        cache_write_input_tokens: 10,
        output_tokens: 8,
      })
      .please(),
  );
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("worker")
      .spawnedFrom("root")
      .withResponse(
        "work",
        "work",
        {
          input_tokens: 300,
          cached_input_tokens: 10,
          cache_write_input_tokens: 0,
          output_tokens: 3,
        },
        { rootTurnId: "turn" },
      )
      .please(),
  );
  const {
    json: actual,
    readable,
    stated,
  } = costViews(home, [
    "--task",
    "SEED-358#reconstruct-codex-and-claude-code-usage-history",
  ]);
  expect(readable).toEqual(stated);
  const coordinator = actual.agents.find(
    (agent) => agent.role === "coordinator",
  );
  expect(actual.requestedSettings).toMatchObject({
    model: "requested-model",
    effort: "high",
  });
  expect(coordinator?.observedSettings).toEqual([
    {
      model: "observed-one",
      effort: "medium",
      serviceTier: "default",
      requests: 2,
    },
    { model: "observed-two", effort: "low", serviceTier: "fast", requests: 1 },
  ]);
  expect(coordinator?.peakInput).toMatchObject({
    value: 200,
    status: "observed-maximum",
  });
  expect(actual.agents.find((agent) => agent.role === "worker")).toMatchObject({
    peakInput: { value: 300, status: "observed-maximum" },
    observedSettings: [
      { model: null, effort: null, serviceTier: null, requests: 1 },
    ],
  });
  expect(actual.peakInput).toBeNull();
  expect(actual.totals.totalInput.value).toBe(750);
  expect(actual.gaps).toContain("missing-worker-evidence");
});

test("historical guidance stays unknown when an isolated current VERSION changes and optional guidance is labelled supplied", ({
  home,
}) => {
  writeClaudeSession(
    path.join(home, "claude"),
    makeMe.aClaudeTranscript
      .forSession("family")
      .withAssistant({
        uuid: "own",
        messageId: "own",
        usage: { output_tokens: 1 },
      })
      .please(),
  );
  writeFileSync(path.join(home, "VERSION"), "1.2.3\n");
  expect(costReport(home, familyFlags, home).guidanceVersion).toMatchObject({
    value: null,
    provenance: "unknown",
  });
  writeFileSync(path.join(home, "VERSION"), "9.8.7\n");
  expect(costReport(home, familyFlags, home).guidanceVersion).toMatchObject({
    value: null,
    provenance: "unknown",
  });
  expect(
    costReport(home, [...familyFlags, "--guidance-version", "0.7.8"], home)
      .guidanceVersion,
  ).toMatchObject({ value: "0.7.8", provenance: "supplied" });
});
