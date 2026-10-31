// One matching contract serves both in-flight and retained-evidence lookup.
import { expect, test } from "../support/pageTest.ts";
import {
  sameLaunch,
  type AgentLaunchRequest,
} from "../../src/launchRequest.ts";

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

test("ad hoc matching includes attached image content digests", () => {
  const digestA = "a".repeat(64);
  const digestB = "b".repeat(64);
  const base: AgentLaunchRequest = {
    source: "open-dough",
    host: "claude",
    workflow: "ad-hoc",
    instruction: "Why is this card clipped?",
  };
  const withA = { ...base, attachmentDigests: [digestA] };
  const withB = { ...base, attachmentDigests: [digestB] };
  const withBoth = { ...base, attachmentDigests: [digestA, digestB] };
  expect(sameLaunch(withA, { ...withA })).toBe(true);
  expect(sameLaunch(withA, { ...withA, attachments: ["/other/1-a.png"] })).toBe(
    true,
  );
  expect(sameLaunch(withA, withB)).toBe(false);
  expect(sameLaunch(withA, withBoth)).toBe(false);
  expect(sameLaunch(withA, base)).toBe(false);
  expect(sameLaunch(base, { ...base, attachmentDigests: [] })).toBe(true);
});

test("ad hoc matching includes the Workspace and After checks choices, the default ones when none are named", () => {
  const blank: AgentLaunchRequest = {
    source: "open-dough",
    host: "codex",
    workflow: "ad-hoc",
  };
  const defaults = {
    workspace: "default-checkout",
    landing: "review",
  } as const;
  const choices = [
    undefined,
    defaults,
    { ...defaults, workspace: "isolated" },
    { ...defaults, landing: "auto-land" },
    { workspace: "isolated", landing: "auto-land" },
  ] as const;
  for (const left of choices) {
    for (const right of choices) {
      const a = left ?? defaults;
      const b = right ?? defaults;
      expect(
        sameLaunch({ ...blank, policy: left }, { ...blank, policy: right }),
        `${a.workspace}/${a.landing} versus ${b.workspace}/${b.landing}`,
      ).toBe(a.workspace === b.workspace && a.landing === b.landing);
    }
  }
});
