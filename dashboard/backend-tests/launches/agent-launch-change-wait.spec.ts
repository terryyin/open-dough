// A wait for an accepted attempt's change (../../server/launchAttemptChanges.ts)
// names how many changes its asker's observation counted, so a change told
// while nothing waited is answered at once, and a wait naming the current
// count answers at the next change. A different live server's worker can only
// be observed after the bound; an attempt this server's own process works on
// is answered at once even before this server holds it. What the page says
// from those answers is ../../frontend-tests/launches/story-card-startup.spec.ts
// and ../../../e2e/launches/agent-launch-second-server.spec.ts.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { changedAttempt } from "../../server/launchAttemptChanges.ts";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { attemptWorker } from "../../server/launchAttemptWorker.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";

const story = { identity: "SEED-001#wait", title: "Wait for a change" };
const source = makeMe.aPublishedSource.openDough.please();
const request = makeMe.aLaunchRequest
  .executing({ ...story, source: source.id })
  .please();
// Long enough that only a wrong branch could reach it in a passing test.
const unreachedBoundMs = 60_000;

function privateMachine(): LaunchAttemptOwner {
  const home = mkdtempSync(path.join(tmpdir(), "dough-change-wait-"));
  const owner = new LaunchAttemptOwner();
  onTestFinished(async () => {
    owner.close();
    try {
      await owner.drain();
    } finally {
      vi.useRealTimers();
      vi.unstubAllEnvs();
      rmSync(home, { recursive: true, force: true });
    }
  });
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  onTestFinished(mountProjectConfiguration("development"));
  appendConfiguredProject(
    makeMe.aConfiguredProject.with({ ...source, localPath: home }).please(),
  );
  return owner;
}

function tracked<T>(promise: Promise<T>) {
  const state = { settled: false };
  void promise.finally(() => {
    state.settled = true;
  });
  return state;
}

function held() {
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  onTestFinished(release);
  return { released, release };
}

test("a stale count answers at once with the newer worker; the current count waits for the next note or settlement", async () => {
  const owner = privateMachine();
  const notedWorker = held();
  const publish = held();
  const settle = held();
  const record = makeMe.anObservedLaunch
    .of(makeMe.aLaunchRecord.executing(story).please())
    .withSessionState(makeMe.aSessionState.unknown().please())
    .please();
  const accepted = await owner.accept(request, async (...[, notes]) => {
    await notes.worker(attemptWorker("launch"));
    notedWorker.release();
    await publish.released;
    await notes.publication({ kind: "none" });
    await settle.released;
    return { kind: "launched", record };
  });
  assert.equal(accepted.kind, "accepted");
  const { id, changes: acceptedCount } = accepted.attempt;
  expect(accepted.attempt).toMatchObject({ changes: 0 });
  const nextChange = async (seen: number, cue: () => void) => {
    const answer = changedAttempt(owner, id, unreachedBoundMs, seen);
    const waiting = tracked(answer);
    await owner.attempts();
    expect(waiting.settled).toBe(false);
    cue();
    return answer;
  };

  // Nothing waits while the owner notes its move to the session launch.
  await notedWorker.released;
  const missed = await changedAttempt(
    owner,
    id,
    unreachedBoundMs,
    acceptedCount,
  );
  expect(missed).toMatchObject({
    changed: true,
    attempt: { running: true, worker: { step: "launch" } },
  });
  expect(missed.attempt?.outcome).toBeUndefined();
  const current = missed.attempt?.changes ?? 0;
  expect(current).toBeGreaterThan(acceptedCount ?? 0);

  const published = await nextChange(current, publish.release);
  expect(published).toMatchObject({
    changed: true,
    attempt: { running: true, publication: { kind: "none" } },
  });
  const counted = published.attempt?.changes ?? 0;
  expect(counted).toBeGreaterThan(current);
  // A settled attempt has no next change, so it carries no count.
  const settled = await nextChange(counted, settle.release);
  expect(settled).toMatchObject({
    changed: true,
    attempt: { running: false, outcome: { kind: "launched" } },
  });
  expect(settled.attempt?.changes).toBeUndefined();
});

test("a different live server's worker keeps the wait pending until its bound and answers unchanged", async () => {
  const owner = privateMachine();
  const other = spawn(process.execPath, ["-e", "setInterval(() => {}, 1e9)"], {
    stdio: "ignore",
  });
  onTestFinished(() => {
    other.kill();
  });
  assert(other.pid !== undefined);
  const id = "00000000-0000-4000-8000-0000000000c2";
  await keepAttempt(
    makeMe.anAcceptedAttempt
      .withId(id)
      .requesting(request)
      .workedBy({
        pid: other.pid,
        serverPid: other.pid,
        step: "start",
        notedAt: new Date().toISOString(),
      })
      .please(),
  );
  expect((await owner.attempts()).attempts).toMatchObject([
    { id, owned: false, running: true },
  ]);

  const boundMs = 500;
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  const answer = changedAttempt(owner, id, boundMs);
  const waiting = tracked(answer);
  await owner.attempts();
  await vi.advanceTimersByTimeAsync(boundMs - 1);
  expect(waiting.settled).toBe(false);
  await vi.advanceTimersByTimeAsync(1);
  expect(await answer).toEqual({ changed: false });
});

// Admission keeps an attempt with this server's worker before it holds the
// attempt in memory; a wait asked in between must not take the bound for a
// change this server is about to tell.
test("a persisted worker of this server answers at once before local ownership", async () => {
  const owner = privateMachine();
  const id = "00000000-0000-4000-8000-0000000000c1";
  await keepAttempt(
    makeMe.anAcceptedAttempt
      .withId(id)
      .requesting(request)
      .workedBy(attemptWorker("start"))
      .please(),
  );
  expect((await owner.attempts()).attempts).toMatchObject([
    { id, owned: false, running: true },
  ]);
  expect(await changedAttempt(owner, id, unreachedBoundMs)).toEqual({
    changed: true,
  });
});
