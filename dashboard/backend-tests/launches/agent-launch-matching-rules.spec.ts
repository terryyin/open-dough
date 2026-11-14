// One matching contract serves both in-flight and retained-evidence lookup.
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  sameLaunch,
  type AgentLaunchRequest,
  type StoryLaunchRequest,
} from "../../src/launchRequest.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

const story: StoryLaunchRequest = makeMe.aLaunchRequest
  .refining({
    identity: "SEED-075#launch-gates-every-host",
    title: "Launch gates apply to every host",
  })
  .please() as StoryLaunchRequest;

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
  const blank: AgentLaunchRequest = makeMe.aLaunchRequest.adHoc().please();
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
  const base: AgentLaunchRequest = makeMe.aLaunchRequest
    .adHoc({ instruction: "Why is this card clipped?" })
    .please();
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

test("ad hoc follow-up matching includes a story's file, line and side", () => {
  const blank = makeMe.aLaunchRequest
    .adHoc({ instruction: "Continue" })
    .please() as Extract<AgentLaunchRequest, { workflow: "ad-hoc" }>;
  const revision = "ab".repeat(20);
  const completion = "cd".repeat(20);
  const baseline = "ef".repeat(20);
  const tree = "01".repeat(20);
  const story = {
    identity: "SEED-A#a",
    revision,
  };
  const file = {
    path: "new/a.ts",
    oldPath: "old/a.ts",
    baseline,
    tree,
    completion,
  };
  const withFile = {
    ...blank,
    followUp: { story: { ...story, file } },
  };
  const withLine = {
    ...blank,
    followUp: {
      story: { ...story, file: { ...file, line: 12, side: "new" as const } },
    },
  };
  const otherLine = {
    ...blank,
    followUp: {
      story: { ...story, file: { ...file, line: 11, side: "new" as const } },
    },
  };
  expect(sameLaunch(withFile, { ...withFile })).toBe(true);
  expect(sameLaunch(withLine, { ...withLine })).toBe(true);
  expect(sameLaunch(withFile, withLine)).toBe(false);
  expect(sameLaunch(withLine, otherLine)).toBe(false);
  expect(
    sameLaunch(withFile, {
      ...blank,
      followUp: { story },
    }),
  ).toBe(false);
});

test("ad hoc matching includes the Workspace and After checks choices, the default ones when none are named", () => {
  const blank = makeMe.aLaunchRequest
    .adHoc({ host: "codex" })
    .please() as Extract<AgentLaunchRequest, { workflow: "ad-hoc" }>;
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
