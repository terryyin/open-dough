import path from "node:path";
import { appendFileSync } from "node:fs";
import { costViews } from "../../tests/usage-history/agentEffortCost.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { test, expect } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  nativeFile,
  writeClaudeSession,
} from "../../tests/usage-history/importHarness.ts";

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

test("Claude maxima sum disjoint input once and keep same-session worker identities and model changes visible", ({
  home,
}) => {
  const claude = path.join(home, "claude");
  const usage = {
    input_tokens: 2,
    cache_read_input_tokens: 20,
    cache_creation_input_tokens: 10,
    output_tokens: 7,
    speed: "standard",
  };
  writeClaudeSession(
    claude,
    makeMe.aClaudeTranscript
      .forSession("family")
      .withAssistant({
        uuid: "one",
        messageId: "one",
        model: "Fable",
        effort: "medium",
        usage,
      })
      .withAssistant({
        uuid: "two",
        messageId: "two",
        model: "Fable",
        effort: "medium",
        usage,
      })
      .withAssistant({
        uuid: "three",
        messageId: "three",
        model: "Opus",
        effort: "high",
        usage: { ...usage, input_tokens: 12 },
      })
      .please(),
  );
  nativeFile(
    path.join(claude, "family", "subagents"),
    "agent-worker",
    makeMe.aClaudeTranscript
      .forSession("family")
      .asSidechain({ agentId: "worker" })
      .withAssistant({
        uuid: "worker",
        messageId: "worker",
        usage: { ...usage, input_tokens: 70 },
      })
      .please(),
  );
  const { json: actual, readable, stated } = costViews(home, familyFlags);
  expect(readable).toEqual(stated);
  expect(actual.agents.find((agent) => agent.agentId === null)).toMatchObject({
    peakInput: { value: 42, status: "observed-maximum" },
    observedSettings: [
      {
        model: "Fable",
        effort: "medium",
        serviceTier: "standard",
        requests: 2,
      },
      { model: "Opus", effort: "high", serviceTier: "standard", requests: 1 },
    ],
  });
  expect(
    actual.agents.find((agent) => agent.agentId === "worker"),
  ).toMatchObject({ peakInput: { value: 100 } });
  expect(actual.peakInput).toBeNull();
});

for (const missing of [
  "request identity",
  "input components",
  "readable row",
]) {
  test(`missing ${missing} qualifies the observed maximum as a lower bound`, ({
    home,
  }) => {
    const file = writeClaudeSession(
      path.join(home, "claude"),
      makeMe.aClaudeTranscript
        .forSession("family")
        .withAssistant({
          uuid: "known",
          messageId: "known",
          usage: {
            input_tokens: 2,
            cache_read_input_tokens: 20,
            cache_creation_input_tokens: 10,
            output_tokens: 1,
          },
        })
        .withAssistant({
          uuid: "partial",
          ...(missing !== "request identity" ? { messageId: "partial" } : {}),
          usage: {
            input_tokens: 80,
            output_tokens: 1,
            ...(missing === "readable row"
              ? { cache_read_input_tokens: 20, cache_creation_input_tokens: 10 }
              : {}),
          },
        })
        .please(),
    );
    if (missing === "readable row") appendFileSync(file, "{broken\n");
    const { json: actual, readable, stated } = costViews(home, familyFlags);
    expect(readable).toEqual(stated);
    expect(actual.agents[0]?.peakInput).toMatchObject({
      value:
        missing === "input components"
          ? 80
          : missing === "readable row"
            ? 110
            : 32,
      status: "observed-lower-bound",
      observedRequests: missing === "request identity" ? 1 : 2,
      missingInputRequests: missing === "input components" ? 1 : 0,
    });
    expect(actual.gaps).toContain(
      missing === "input components"
        ? "missing-token-components"
        : missing === "readable row"
          ? "malformed-native-row"
          : "unsupported-response-identity",
    );
  });
}
