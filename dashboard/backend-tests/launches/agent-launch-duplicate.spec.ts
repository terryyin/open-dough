// Competing starts at the Claude startup boundary.
import { rmSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  queuedReadyRepository,
  storyA,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { claudeHost } from "../../server/claudeHost.ts";
import { admitLaunchSettings } from "../../server/launchSettingsAdmission.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { withSelectedOptions } from "../../server/launchOptions.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { localFolder, machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const repository = queuedReadyRepository().please();
const source = makeMe.aPublishedSource.openDough.please();
const duplicate = {
  kind: "uncertain",
  reason: "unconfirmed",
  explanation:
    "This launch is already being reconciled or submitted. Wait for its result; no duplicate input or conversation was created.",
};
const instructed = makeMe.aLaunchRequest
  .adHoc({ host: "claude", instruction: "Investigate." })
  .please();
const blank = makeMe.aLaunchRequest
  .adHoc({ host: "claude", instruction: "" })
  .please();
const story = { ...storyA, host: "claude" as const };

let origin: StartOrigin;
let native: FakeClaudeControls;
let launches: AgentLaunches;
let marks: NativeDoneMarks;
let unmount: () => void;

beforeAll(async () => {
  const prepared = await startOrigin(repository, { host: "claude" });
  try {
    keepStartedOrigin("claude", repository, prepared);
  } finally {
    prepared.cleanup();
  }
});

beforeEach(async () => {
  origin = await startOrigin(repository, { host: "claude" });
  const fixture = installFakeClaude(
    origin.machine,
    { binDir: origin.machine, path: process.env.PATH ?? "" },
    {},
  );
  native = fixture.controls;
  for (const [key, value] of Object.entries(fixture.env))
    vi.stubEnv(key, value);
  vi.stubEnv("HOME", path.join(origin.machine, "home"));
  unmount = mountProjectConfiguration("production");
  marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  launches = new AgentLaunches(marks);
});

afterEach(async () => {
  launches.close();
  native.releaseHeldClaude();
  await launches.drain();
  await marks.close();
  unmount();
  vi.unstubAllEnvs();
  origin.cleanup();
});

const accept = (request: AgentLaunchRequest) =>
  launches.accept(source, request, "http://127.0.0.1:4173");
const records = () => keptRecords(source.id);

async function started(request: AgentLaunchRequest) {
  const accepted = await accept(request);
  if (accepted.kind !== "accepted")
    throw new Error(`Expected acceptance: ${JSON.stringify(accepted)}`);
  return accepted.attempt;
}

// A loaded machine takes many seconds to start an ad hoc launch, so the cases
// that wait on one allow 30 s per start step.
async function settled(id: string) {
  let seen: number | undefined;
  for (;;) {
    const { attempt } = await launches.changed(id, 30_000, seen);
    if (attempt?.running === false) return attempt.outcome;
    if (attempt === undefined || attempt.changes === seen)
      throw new Error("The accepted launch did not settle.");
    seen = attempt.changes;
  }
}

async function held(request: AgentLaunchRequest, count = 1) {
  const attempt = await started(request);
  await expect
    .poll(() => native.claudeLaunches(), { timeout: 30_000 })
    .toHaveLength(count);
  return attempt;
}

async function expectSingleLaunch(request: AgentLaunchRequest) {
  native.claudeScenario("held");
  const first = await held(request);

  expect(await accept(request)).toEqual(duplicate);
  expect(native.claudeLaunches()).toHaveLength(1);

  native.releaseHeldClaude();
  expect(await settled(first.id)).toMatchObject({ kind: "launched" });
  expect(native.claudeLaunches()).toHaveLength(1);
  const kept = await records();
  expect(kept).toHaveLength(1);
  expect(kept[0]).not.toHaveProperty("preparation");
}

test("overlapping Claude instruction starts dispatch only once", async () => {
  await expectSingleLaunch(instructed);
  expect(native.claudeLaunches()[0]?.instruction).toContain("Investigate.");
}, 60_000);

test("overlapping Claude blank starts dispatch only once without input", async () => {
  await expectSingleLaunch(blank);
  expect(native.claudeLaunches()[0]).not.toHaveProperty("instruction");
}, 60_000);

test("an overlapping start-less Claude story dispatches only once", async () => {
  const scripts = installedSkillPath(
    "claude",
    localFolder(origin.project),
    "dough-story-refinement",
    "scripts",
  );
  rmSync(path.join(scripts, "preparation-assignment.mjs"));

  await expectSingleLaunch(makeMe.aLaunchRequest.refining(story).please());
});

test("changed Claude story choices cannot bypass an in-flight launch", async () => {
  const instruction = "Original intent.";
  const request = makeMe.aLaunchRequest
    .refining(story)
    .withInstruction(instruction)
    .please();
  const changed = makeMe.aLaunchRequest
    .refining({ ...story, title: "Changed title" })
    .withInstruction("Changed intent.")
    .withOptions(["--explore"])
    .requestingModel("opus")
    .please();
  await admitLaunchSettings(changed, claudeHost);
  native.claudeScenario("held");
  const selected = await withSelectedOptions(
    changed,
    localFolder(origin.project),
  );

  const first = await held(request);
  expect(await accept(selected)).toEqual(duplicate);
  native.releaseHeldClaude();

  expect(await settled(first.id)).toMatchObject({ kind: "launched" });
  expect(native.claudeLaunches()).toHaveLength(1);
  expect(native.claudeLaunches()[0]?.instruction).toContain(instruction);
  expect(await records()).toMatchObject([
    { request, preparation: { identity: storyA.identity } },
  ]);
}, 60_000);

test("Claude keeps the gate after acceptance and releases it while native work continues", async () => {
  native.claudeScenario("held");
  const first = await held(instructed);

  expect(await accept(instructed)).toEqual(duplicate);
  native.releaseHeldClaude();
  expect(await settled(first.id)).toMatchObject({
    kind: "launched",
    session: { host: "claude" },
  });
  expect(await records()).toMatchObject([{ session: { host: "claude" } }]);

  expect(native.claudeListing()[0]).toMatchObject({ state: "working" });
  expect(await settled((await started(instructed)).id)).toMatchObject({
    kind: "launched",
  });
  expect(await records()).toHaveLength(2);
  expect(native.claudeLaunches()).toHaveLength(2);
}, 60_000);

test("Claude native refusal releases the gate for a retry", async () => {
  native.claudeScenario("refused");

  expect(await settled((await started(instructed)).id)).toMatchObject({
    kind: "failed",
    reason: "refused",
  });
  native.claudeScenario("launched");
  expect(await settled((await started(instructed)).id)).toMatchObject({
    kind: "launched",
  });

  expect(await records()).toHaveLength(1);
  expect(native.claudeLaunches()).toHaveLength(2);
}, 60_000);

test("distinct Claude instructions remain independent while both launches are held", async () => {
  const first = makeMe.aLaunchRequest
    .adHoc({ instruction: "First subject." })
    .please();
  const second = makeMe.aLaunchRequest
    .adHoc({ instruction: "Second subject." })
    .please();
  native.claudeScenario("held");

  const firstAttempt = await held(first);
  const secondAttempt = await held(second, 2);
  expect(native.claudeLaunches()).toMatchObject([
    { instruction: expect.stringContaining("First subject.") as unknown },
    { instruction: expect.stringContaining("Second subject.") as unknown },
  ]);
  native.releaseHeldClaude();

  expect(await settled(firstAttempt.id)).toMatchObject({ kind: "launched" });
  expect(await settled(secondAttempt.id)).toMatchObject({ kind: "launched" });
  expect(await records()).toHaveLength(2);
}, 60_000);
