import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import type { AttemptRun } from "../../server/launchAttemptSettlement.ts";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import * as hosts from "../../server/launchHosts.ts";
import { attemptRun } from "../../server/launchRun.ts";
import * as launchStart from "../../server/launchStart.ts";
import { localFolder, machineFolder } from "../../server/localFolder.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { startOf } from "../../server/startWorkflows.ts";
import {
  defaultSessionPolicy,
  type PublicationReceipt,
} from "../../src/agentLaunch.ts";

let deniedFile: string | undefined;

vi.mock(import("node:fs/promises"), async (importOriginal) => {
  const fs = await importOriginal();
  return {
    ...fs,
    rename: async (source, destination) => {
      if (destination === deniedFile) {
        throw new Error("attempt replacement denied");
      }
      await fs.rename(source, destination);
    },
  };
});

const story = { identity: "SEED-052#launch", title: "Keep this story's start" };
const request = makeMe.aLaunchRequest
  .executing(story)
  .withInstruction("Keep this exact instruction.")
  .please();
const reportingOrigin = "http://127.0.0.1:4173";

function privateMachine() {
  const home = mkdtempSync(path.join(tmpdir(), "dough-attempt-acceptance-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  const owner = new LaunchAttemptOwner();
  onTestFinished(async () => {
    try {
      await owner.drain();
    } finally {
      owner.close();
      deniedFile = undefined;
      vi.restoreAllMocks();
      vi.unstubAllEnvs();
      rmSync(home, { recursive: true, force: true });
    }
  });
  return { home, owner, file: machineDashboardPath("launch-attempts.json") };
}

function heldHandoff() {
  let release = () => {};
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { wait, release };
}

test("keeps one exact attempt before its effects and settles it after acceptance returns", async () => {
  const { owner, file } = privateMachine();
  const refinement = makeMe.aLaunchRequest.refining(story).please();
  const record = makeMe.anObservedLaunch
    .of(makeMe.aLaunchRecord.executing(story).please())
    .withSessionState(makeMe.aSessionState.unknown().please())
    .please();
  const publication: PublicationReceipt = {
    kind: "published",
    revision: "b2".repeat(20),
  };
  const publish = heldHandoff();
  const confirmNative = heldHandoff();
  let id: string | undefined;
  let atDispatch: unknown;
  let receiptWrite: Promise<void> | undefined;
  const run = vi.fn<AttemptRun>(async (own, notePublication) => {
    id = own.attempt.id;
    atDispatch = existsSync(file)
      ? (JSON.parse(readFileSync(file, "utf8")) as unknown)
      : undefined;
    receiptWrite = publish.wait.then(() => notePublication(publication));
    await receiptWrite;
    await confirmNative.wait;
    return { kind: "launched", record };
  });

  try {
    const accepted = await owner.accept(request, run, reportingOrigin);
    assert.equal(accepted.kind, "accepted");
    const { acceptedAt, worker } = accepted.attempt;
    expect(id).toBe(accepted.attempt.id);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0]?.[0].request).toEqual(request);
    expect(accepted.attempt.owned).toBe(true);
    expect(worker?.notedAt).toMatch(/\S/);
    expect(worker).toMatchObject({
      pid: process.pid,
      serverPid: process.pid,
      step: "start",
    });
    const exactKeptAttempt = {
      id,
      request,
      acceptedAt,
      reportingOrigin,
      publication: { kind: "unknown" },
      worker,
    };
    expect(atDispatch).toEqual({ [request.source]: [exactKeptAttempt] });

    for (const competitor of [request, refinement]) {
      expect(await owner.accept(competitor, run)).toMatchObject({
        kind: "failed",
        reason: "already-starting",
      });
    }

    publish.release();
    await receiptWrite;
    const [awaitingNative] = (await keptAttempts()) ?? [];
    expect(awaitingNative).toMatchObject({ id, publication });
    expect(awaitingNative?.outcome).toBeUndefined();
    expect(await owner.accept(refinement, run)).toMatchObject({
      kind: "failed",
      reason: "already-starting",
    });
    expect(await owner.accept(request, run)).toMatchObject({
      kind: "uncertain",
      reason: "unconfirmed",
    });
    expect(run).toHaveBeenCalledTimes(1);
  } finally {
    publish.release();
    confirmNative.release();
    await owner.drain();
  }

  const kept = await keptAttempts();
  const { host, sessionId } = record.session;
  const outcome = { kind: "launched", session: { host, sessionId } };
  expect(kept).toMatchObject([{ id, request, publication, outcome }]);
  expect(kept?.[0]?.worker).toBeUndefined();
  expect((await owner.attempts()).attempts).toMatchObject([
    { id, running: false, owned: false },
  ]);
});

test("refuses a launch with no dispatch when the initial attempt cannot be kept", async () => {
  const { owner, file } = privateMachine();
  deniedFile = file;
  const run = vi.fn<AttemptRun>(() => {
    throw new Error("Unexpected launch dispatch.");
  });

  expect(await owner.accept(request, run)).toMatchObject({
    kind: "failed",
    reason: "unrecorded",
  });
  expect(run).not.toHaveBeenCalled();
  expect(existsSync(file)).toBe(false);
  expect((await owner.attempts()).attempts).toEqual([]);
});

test("a failed receipt write stops native launch and keeps the publication known to its owner", async () => {
  const { home, owner, file } = privateMachine();
  const workspace = localFolder("~/story");
  const source = makeMe.aPublishedSource.openDough.please();
  onTestFinished(mountProjectConfiguration("development"));
  appendConfiguredProject(
    makeMe.aConfiguredProject.with({ ...source, localPath: home }).please(),
  );
  const { start } = makeMe.aLaunchRecord
    .executing(story)
    .onStoryBranch({
      workspace: workspace.shown,
      branch: "claude/story",
      agent: "Story agent",
    })
    .please();
  const workflow = startOf("execution");
  assert(start !== undefined && "publishedSha" in start);
  assert(workflow !== undefined);
  const publish = heldHandoff();
  vi.spyOn(launchStart, "started").mockImplementation(async () => {
    await publish.wait;
    deniedFile = file;
    return {
      kind: "established",
      workflow,
      policy: defaultSessionPolicy,
      handoff: { established: { start } },
      workspace,
    };
  });
  const native = vi.spyOn(hosts, "launchHost").mockImplementation(() => {
    throw new Error("Unexpected native launch.");
  });
  const progress = new StartProgress();
  const doneMarks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });

  try {
    const accepted = await owner.accept(
      request,
      (...args) => attemptRun(source, ...args, progress, doneMarks),
      reportingOrigin,
    );
    assert.equal(accepted.kind, "accepted");
    const beforePublication = readFileSync(file, "utf8");
    publish.release();
    await owner.drain();

    expect(native).not.toHaveBeenCalled();
    const [observed] = (await owner.attempts()).attempts;
    expect(observed).toMatchObject({
      id: accepted.attempt.id,
      owned: false,
      running: false,
      publication: { kind: "published", revision: start.publishedSha },
      outcome: { kind: "failed", reason: "unrecorded" },
    });
    expect(observed?.outcome).toHaveProperty(
      "explanation",
      expect.stringContaining("Publication succeeded (Taken by Story agent"),
    );
    expect(readFileSync(file, "utf8")).toBe(beforePublication);
  } finally {
    publish.release();
  }
});
