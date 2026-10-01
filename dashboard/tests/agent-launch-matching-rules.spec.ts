// One matching contract serves both in-flight and retained-evidence lookup.
import { expect, test } from "@playwright/test";
import { sameLaunch, type AgentLaunchRequest } from "../src/launchRequest.ts";

const story: AgentLaunchRequest = {
  source: "open-dough",
  host: "claude",
  workflow: "refinement",
  identity: "SEED-075#launch-gates-every-host",
  title: "Launch gates apply to every host",
};

test("story choices preserve identity while project, host, workflow and subject distinguish launches", () => {
  expect(
    sameLaunch(story, {
      ...story,
      title: "Changed title",
      instruction: "Changed instruction",
      model: "opus",
      options: ["--explore"],
      policy: {
        tracking: "one-shot",
        workspace: "default-checkout",
        landing: "auto-land",
      },
    }),
  ).toBe(true);
  for (const changed of [
    { source: "pygardon" },
    { host: "codex" as const },
    { workflow: "execution" as const },
    { identity: "SEED-075#session-record-per-host" },
  ])
    expect(sameLaunch(story, { ...story, ...changed })).toBe(false);
});

test("ad hoc matching retains exact instruction including omitted and empty text", () => {
  const blank: AgentLaunchRequest = {
    source: "open-dough",
    host: "claude",
    workflow: "ad-hoc",
  };
  for (const instruction of [undefined, "", " ", "Investigate."]) {
    const request = {
      ...blank,
      ...(instruction === undefined ? {} : { instruction }),
    };
    expect(sameLaunch(request, { ...request, model: "opus" })).toBe(true);
    expect(sameLaunch(request, { ...request, instruction: "Different." })).toBe(
      false,
    );
  }
  expect(sameLaunch(blank, { ...blank, instruction: "" })).toBe(false);
  expect(sameLaunch(blank, { ...blank, source: "pygardon" })).toBe(false);
  expect(sameLaunch(blank, { ...blank, host: "codex" })).toBe(false);
  expect(sameLaunch(blank, story)).toBe(false);
});
