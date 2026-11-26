import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import type { AttemptRun } from "../../server/launchAttemptSettlement.ts";
import { keepAttempt, keptAttempts } from "../../server/launchAttemptStore.ts";
import { attemptWorker } from "../../server/launchAttemptWorker.ts";
import { preContinuationAnswer } from "../../server/launchPreAcceptance.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import {
  acquireWriteLock,
  releaseWriteLock,
} from "../../server/machineJsonLock.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import type { Acceptance, AgentLaunchRequest } from "../../src/agentLaunch.ts";
import {
  keepLaunchStore,
  keepLaunchStoreText,
  launchStoreFile,
} from "../../test-support/support/launchStore.ts";

let onBlockedWrite: { lock: string; reached: () => void } | undefined;

vi.mock(import("node:fs"), async (original) => {
  const fs = await original();
  return {
    ...fs,
    mkdirSync: (directory, options) => {
      try {
        return fs.mkdirSync(directory, options);
      } catch (error) {
        if (
          onBlockedWrite?.lock === directory &&
          (error as NodeJS.ErrnoException).code === "EEXIST"
        ) {
          onBlockedWrite.reached();
        }
        throw error;
      }
    },
  };
});

const source = makeMe.aPublishedSource.openDough.please();
const story = {
  source: source.id,
  identity: "SEED-052#open",
  title: "Open story",
};
const request = makeMe.aLaunchRequest.refining(story).please();

function continuation() {
  const home = mkdtempSync(path.join(tmpdir(), "dough-continuation-race-"));
  const owner = new LaunchAttemptOwner();
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  const unmount = mountProjectConfiguration("development");
  onTestFinished(async () => {
    owner.close();
    try {
      await owner.drain();
    } finally {
      unmount();
      vi.unstubAllEnvs();
      onBlockedWrite = undefined;
      rmSync(home, { recursive: true, force: true });
    }
  });
  appendConfiguredProject(
    makeMe.aConfiguredProject.with({ ...source, localPath: home }).please(),
  );
  const run = vi.fn<AttemptRun>(() => {
    throw new Error("Unexpected launch dispatch.");
  });
  const file = machineDashboardPath("launch-attempts.json");
  return { home, owner, file, lock: `${file}.lock`, run };
}

function waitForBlockedWrite(lock: string, pending: Promise<Acceptance>) {
  const blocked = new Promise<void>((resolve) => {
    onBlockedWrite = { lock, reached: resolve };
  });
  return Promise.race([
    blocked,
    pending.then(() => {
      throw new Error(
        "Continue answered before contending for the write lock.",
      );
    }),
  ]);
}

function ownRecordAfter(acceptedAt: string) {
  return makeMe.aLaunchRecord
    .refining(story)
    .launchedAt(new Date(Date.parse(acceptedAt) + 1).toISOString())
    .withFirstInput({ state: "confirmed" })
    .please();
}

test.each([
  {
    state: "running",
    newer: (attempt: typeof makeMe.anAcceptedAttempt) =>
      attempt.workedBy(attemptWorker("launch")).please(),
    kind: "uncertain",
    reason: "unconfirmed",
  },
  {
    state: "settled",
    newer: (attempt: typeof makeMe.anAcceptedAttempt) =>
      attempt
        .ended({
          kind: "failed",
          reason: "not-listed",
          explanation: "No native session was listed.",
        })
        .settledAt(new Date().toISOString())
        .please(),
    kind: "failed",
    reason: "refused",
  },
])(
  "Continue preserves a newer $state attempt written under the lock",
  async ({ newer, kind, reason }) => {
    const { home, owner, file, lock, run } = continuation();
    const builder = makeMe.anAcceptedAttempt
      .requesting(request)
      .acceptedAt(new Date().toISOString());
    const kept = builder.please();
    await keepAttempt(kept);
    const records = keepLaunchStore(home, {
      [source.id]: [ownRecordAfter(kept.acceptedAt)],
    });
    const before = vi.fn(() => {
      throw new Error("Unexpected pre-acceptance for newer evidence.");
    });

    await acquireWriteLock(lock);
    const pending = owner.continueAttempt(source.id, kept.id, before, run);
    const updated = JSON.stringify({ [source.id]: [newer(builder)] });
    try {
      await waitForBlockedWrite(lock, pending);
      writeFileSync(file, updated);
    } finally {
      releaseWriteLock(lock);
      await pending;
    }

    expect(await pending).toMatchObject({ kind, reason });
    expect(readFileSync(file, "utf8")).toBe(updated);
    expect(readFileSync(launchStoreFile(home), "utf8")).toBe(records);
    expect(before).not.toHaveBeenCalled();
    expect(run).not.toHaveBeenCalled();
  },
);

test("Continue sees its own confirmed record that arrived after pre-acceptance", async () => {
  const { home, owner, lock, run } = continuation();
  const attempt = makeMe.anAcceptedAttempt
    .requesting(request)
    .acceptedAt(new Date().toISOString())
    .please();
  await keepAttempt(attempt);
  keepLaunchStore(home, { [source.id]: [] });
  const record = ownRecordAfter(attempt.acceptedAt);
  let reachedPreAcceptance = () => {};
  const preAccepted = new Promise<void>((resolve) => {
    reachedPreAcceptance = resolve;
  });
  const writer = { locked: false };
  const before = vi.fn(async (kept: AgentLaunchRequest) => {
    const answer = await preContinuationAnswer(
      source,
      attempt.id,
      kept,
      new StartProgress(),
    );
    await acquireWriteLock(lock);
    writer.locked = true;
    reachedPreAcceptance();
    return answer;
  });
  const pending = owner.continueAttempt(source.id, attempt.id, before, run);
  try {
    await Promise.race([
      preAccepted,
      pending.then(() => {
        throw new Error("Continue skipped pre-acceptance.");
      }),
    ]);
    await waitForBlockedWrite(lock, pending);
    keepLaunchStore(home, { [source.id]: [record] });
  } finally {
    if (writer.locked) releaseWriteLock(lock);
    await pending;
  }

  const outcome = {
    kind: "launched",
    session: { host: record.session.host, sessionId: record.session.sessionId },
  };
  expect(await pending).toMatchObject({
    kind: "accepted",
    attempt: {
      id: attempt.id,
      acceptedAt: attempt.acceptedAt,
      outcome,
      running: false,
    },
  });
  const [settled] = (await keptAttempts()) ?? [];
  expect(settled).toMatchObject({
    id: attempt.id,
    acceptedAt: attempt.acceptedAt,
    outcome,
  });
  expect(before).toHaveBeenCalledWith(request);
  expect(run).not.toHaveBeenCalled();
});

test("Continue refuses unreadable records, preserving both stores without dispatch", async () => {
  const { home, owner, file, run } = continuation();
  const attempt = makeMe.anAcceptedAttempt.requesting(request).please();
  await keepAttempt(attempt);
  const initialAttempt = readFileSync(file, "utf8");
  const unreadable = "{ unreadable launch records";
  keepLaunchStoreText(home, unreadable);
  const before = vi.fn(() => {
    throw new Error("Unexpected pre-acceptance with unreadable records.");
  });

  expect(
    await owner.continueAttempt(source.id, attempt.id, before, run),
  ).toMatchObject({
    kind: "failed",
    reason: "unrecorded",
  });
  expect(readFileSync(file, "utf8")).toBe(initialAttempt);
  expect(readFileSync(launchStoreFile(home), "utf8")).toBe(unreadable);
  expect(before).not.toHaveBeenCalled();
  expect(run).not.toHaveBeenCalled();
});
