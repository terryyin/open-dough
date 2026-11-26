// Competing starts at the Codex startup boundary.
import { rmSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  queuedReadyRepository,
  storyA,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { withSelectedOptions } from "../../server/launchOptions.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { localFolder, machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";
import {
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
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
  .adHoc({ host: "codex", instruction: "Investigate." })
  .please();
const blank = makeMe.aLaunchRequest
  .adHoc({ host: "codex", instruction: "" })
  .please();
const story = { ...storyA, host: "codex" as const };

let origin: StartOrigin;
let native: FakeCodex;
let launches: AgentLaunches;
let marks: NativeDoneMarks;
let unmount: () => void;

beforeAll(async () => {
  const prepared = await startOrigin(repository, { host: "codex" });
  try {
    keepStartedOrigin("codex", repository, prepared);
  } finally {
    prepared.cleanup();
  }
});

beforeEach(async () => {
  origin = await startOrigin(repository, { host: "codex" });
  native = await installFakeCodex(origin.machine, process.env.PATH ?? "", true);
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
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
  native.release();
  await launches.drain();
  await marks.close();
  await native.close();
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

async function settled(id: string) {
  let seen: number | undefined;
  for (;;) {
    const { attempt } = await launches.changed(id, 4_000, seen);
    if (attempt?.running === false) return attempt.outcome;
    if (attempt === undefined || attempt.changes === seen)
      throw new Error("The accepted launch did not settle.");
    seen = attempt.changes;
  }
}

const creations = () =>
  native.calls.filter(({ method }) => method === "thread/start");
const turns = () =>
  native.calls.filter(({ method }) => method === "turn/start");

async function held(request: AgentLaunchRequest, turnCount = 1) {
  native.hold = true;
  native.holdCreation = turnCount === 0;
  const attempt = await started(request);
  await expect
    .poll(turnCount === 0 ? creations : turns, { timeout: 3_000 })
    .toHaveLength(1);
  return attempt;
}

async function expectSingleLaunch(
  request: AgentLaunchRequest,
  turnCount: 0 | 1,
) {
  const first = await held(request, turnCount);

  expect(await accept(request)).toEqual(duplicate);
  expect(creations()).toHaveLength(1);
  expect(turns()).toHaveLength(turnCount);

  native.release();
  expect(await settled(first.id)).toMatchObject({ kind: "launched" });
  expect(creations()).toHaveLength(1);
  expect(turns()).toHaveLength(turnCount);
  const kept = await records();
  expect(kept).toHaveLength(1);
  expect(kept[0]).not.toHaveProperty("preparation");
}

test.each([
  { subject: "instruction", request: instructed, turnCount: 1 },
  { subject: "blank", request: blank, turnCount: 0 },
] as const)(
  "overlapping Codex $subject starts dispatch only once",
  async ({ request, turnCount }) => {
    await expectSingleLaunch(request, turnCount);
  },
);

test("an overlapping start-less Codex story dispatches only once", async () => {
  const scripts = installedSkillPath(
    "codex",
    localFolder(origin.project),
    "dough-story-refinement",
    "scripts",
  );
  rmSync(path.join(scripts, "preparation-assignment.mjs"));

  await expectSingleLaunch(makeMe.aLaunchRequest.refining(story).please(), 1);
});

test("changed Codex story choices cannot bypass an in-flight launch", async () => {
  const instruction = "Original intent.";
  const request = makeMe.aLaunchRequest
    .refining(story)
    .withInstruction(instruction)
    .please();
  const changed = makeMe.aLaunchRequest
    .refining({ ...story, title: "Changed title" })
    .withInstruction("Changed intent.")
    .withOptions(["--explore"])
    .please();
  const selected = await withSelectedOptions(
    changed,
    localFolder(origin.project),
  );

  const first = await held(request);
  expect(await accept(selected)).toEqual(duplicate);
  native.release();

  expect(await settled(first.id)).toMatchObject({ kind: "launched" });
  expect(creations()).toHaveLength(1);
  expect(turns()).toHaveLength(1);
  expect(turns()[0]?.params.input).toContainEqual(
    expect.objectContaining({
      text: expect.stringContaining(instruction) as unknown,
    }),
  );
  expect(await records()).toMatchObject([
    { request, preparation: { identity: storyA.identity } },
  ]);
});

test("Codex keeps the gate after acceptance and releases it while native work continues", async () => {
  const first = await held(instructed);

  expect(await accept(instructed)).toEqual(duplicate);
  native.release();
  expect(await settled(first.id)).toMatchObject({
    kind: "launched",
    session: { host: "codex" },
  });
  expect(await records()).toMatchObject([
    { firstInput: { state: "confirmed" } },
  ]);

  expect(native.sockets.size).toBeGreaterThan(0);
  native.hold = false;
  native.threadId = "second-native-thread";
  expect(await settled((await started(instructed)).id)).toMatchObject({
    kind: "launched",
  });
  expect(await records()).toHaveLength(2);
  expect(creations()).toHaveLength(2);
  expect(turns()).toHaveLength(2);
});

test("Codex native refusal releases the gate for a retry", async () => {
  native.refuseCreation = true;

  expect(await settled((await started(instructed)).id)).toMatchObject({
    kind: "failed",
    reason: "refused",
  });
  native.refuseCreation = false;
  expect(await settled((await started(instructed)).id)).toMatchObject({
    kind: "launched",
  });

  expect(await records()).toHaveLength(1);
  expect(creations()).toHaveLength(2);
  expect(turns()).toHaveLength(1);
});
