import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import type { AttemptRun } from "../../server/launchAttemptSettlement.ts";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { preContinuationAnswer } from "../../server/launchPreAcceptance.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";

const source = makeMe.aPublishedSource.openDough.please();
const story = {
  source: source.id,
  identity: "SEED-052#continue",
  title: "Continue this story",
};
const refining = makeMe.aLaunchRequest
  .refining(story)
  .withPolicy({
    tracking: "one-shot",
    workspace: "isolated",
    landing: "review",
  })
  .withEffort("max")
  .please();
const executing = makeMe.aLaunchRequest.executing(story).please();
const timedOut = {
  kind: "uncertain",
  reason: "timed-out",
  explanation: "The native launch wait expired.",
} as const;
const alreadyStarting = { kind: "failed", reason: "already-starting" };

function machine() {
  const home = mkdtempSync(path.join(tmpdir(), "dough-uncertain-attempt-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  const unmount = mountProjectConfiguration("development");
  const owner = new LaunchAttemptOwner();
  onTestFinished(async () => {
    owner.close();
    try {
      await owner.drain();
    } finally {
      unmount();
      vi.unstubAllEnvs();
      rmSync(home, { recursive: true, force: true });
    }
  });
  appendConfiguredProject(
    makeMe.aConfiguredProject.with({ ...source, localPath: home }).please(),
  );
  const progress = new StartProgress();
  return {
    owner,
    file: machineDashboardPath("launch-attempts.json"),
    continueAttempt: (id: string, run: AttemptRun) =>
      owner.continueAttempt(
        source.id,
        id,
        (request) => preContinuationAnswer(source, id, request, progress),
        run,
      ),
  };
}

test("only Continue retries a timed-out start with its kept request and effort", async () => {
  const { owner, file, continueAttempt } = machine();
  const record = makeMe.anObservedLaunch
    .of(makeMe.aLaunchRecord.refining(story).please())
    .withSessionState(makeMe.aSessionState.unknown().please())
    .please();
  // The one-shot prepares its workspace without publishing, then times out.
  const run = vi
    .fn<AttemptRun>()
    .mockImplementationOnce(async (...[, notes]) => {
      await notes.publication({ kind: "none" });
      return timedOut;
    })
    .mockResolvedValueOnce({ kind: "launched", record });
  const accepted = await owner.accept(refining, run);
  assert.equal(accepted.kind, "accepted");
  const { id, acceptedAt } = accepted.attempt;
  await owner.drain();
  const [uncertain] = (await owner.attempts()).attempts;
  expect(uncertain).toMatchObject({
    id,
    running: false,
    publication: { kind: "none" },
    outcome: timedOut,
  });
  expect(uncertain?.worker).toBeUndefined();
  expect(uncertain?.slowSince).toBeUndefined();
  const before = readFileSync(file, "utf8");

  for (const request of [refining, executing])
    expect(await owner.accept(request, run)).toMatchObject({
      ...alreadyStarting,
      explanation: expect.stringContaining(
        "Recheck or continue it from Startup recovery.",
      ) as unknown,
    });
  expect(readFileSync(file, "utf8")).toBe(before);
  expect(run).toHaveBeenCalledOnce();

  expect(await continueAttempt(id, run)).toMatchObject({
    kind: "accepted",
    attempt: { id, acceptedAt, request: refining },
  });
  await owner.drain();
  expect(await keptAttempts()).toMatchObject([
    { id, acceptedAt, outcome: { kind: "launched" } },
  ]);
  expect(await continueAttempt(id, run)).toMatchObject({
    kind: "failed",
    reason: "refused",
  });
  expect(run.mock.calls.map(([own]) => own.request)).toEqual([
    refining,
    refining,
  ]);
});

test("a slow live start refuses Start and Continue until it settles", async () => {
  const { owner, file, continueAttempt } = machine();
  const slow = new Date().toISOString();
  let warn = () => {};
  const warned = new Promise<void>((resolve) => {
    warn = resolve;
  });
  let complete = () => {};
  const completed = new Promise<void>((resolve) => {
    complete = resolve;
  });
  const record = makeMe.anObservedLaunch
    .of(makeMe.aLaunchRecord.executing(story).please())
    .withSessionState(makeMe.aSessionState.unknown().please())
    .please();
  const publication = { kind: "published", revision: "b2".repeat(20) } as const;
  const run = vi.fn<AttemptRun>(async (...[, notes]) => {
    await notes.slow(slow);
    warn();
    await completed;
    await notes.publication(publication);
    return { kind: "launched", record };
  });

  const accepted = await owner.accept(executing, run);
  assert.equal(accepted.kind, "accepted");
  const { id, acceptedAt } = accepted.attempt;
  try {
    await warned;
    const held = readFileSync(file, "utf8");
    expect((await owner.attempts()).attempts).toMatchObject([
      { id, owned: true, slowSince: slow, publication: { kind: "unknown" } },
    ]);
    for (const request of [executing, refining])
      expect(await owner.accept(request, run)).toMatchObject(alreadyStarting);
    expect(await continueAttempt(id, run)).toMatchObject({
      kind: "uncertain",
      explanation: expect.stringContaining("already running") as unknown,
    });
    expect(readFileSync(file, "utf8")).toBe(held);
    expect(run).toHaveBeenCalledOnce();
  } finally {
    complete();
  }

  await owner.drain();
  const [launched] = (await keptAttempts()) ?? [];
  expect(launched).toMatchObject({
    id,
    acceptedAt,
    publication,
    outcome: { kind: "launched" },
  });
  expect(launched?.slowSince).toBeUndefined();
  expect(launched?.worker).toBeUndefined();
  expect(run).toHaveBeenCalledOnce();
});
