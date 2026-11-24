import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchAttemptRecord } from "../../src/agentLaunch.ts";
import type { MachineReadSource } from "../../src/machineReadSource.ts";
import type { MachineSessionsRead } from "../../src/machineSessionsRevision.ts";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import {
  mountSessionCards,
  readyStory,
  workingSession,
} from "./session-card-mount.ts";
import { cardSession } from "./session-card-page.ts";

function attemptAnswer(
  attempt: LaunchAttemptRecord,
  change: number,
  running: boolean,
) {
  return makeMe.aMachineAnswer.answeringAttempts(
    makeMe.anAttemptObservation
      .of(attempt)
      .owned(true)
      .running(running)
      .afterChanges(change)
      .please(),
  );
}

test("a pace begins only once the read that a followed attempt's change asks for is answered", async () => {
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  const attempt = makeMe.anAcceptedAttempt.adHoc();
  const running = attempt.please();
  const finished = attempt
    .launched({ host: "claude", sessionId: "followed-attempt" })
    .settledAt("2026-01-01T00:00:05.000Z")
    .please();
  const working = workingSession(
    makeMe.aLaunchRecord.executing(readyStory).please(),
  );
  const initial = {
    ...attemptAnswer(running, 1, true).please(),
    revision: "running",
  };
  const settled = {
    ...attemptAnswer(finished, 2, false).observing(working).please(),
    revision: "settled",
  };
  let tellChange = () => {};
  let settleRead = () => {};
  const changed = new Promise<boolean>((resolve) => {
    tellChange = () => {
      resolve(true);
    };
  });
  const prompted = new Promise<MachineSessionsRead>((resolve) => {
    settleRead = () => {
      resolve(settled);
    };
  });
  const waitForAttemptChange = vi.fn<MachineReadSource["waitForAttemptChange"]>(
    () => changed,
  );
  const readTimes: number[] = [];
  const readSessionsSince = vi
    .fn<MachineReadSource["readSessionsSince"]>(() => {
      readTimes.push(Date.now());
      return Promise.resolve(settled);
    })
    .mockImplementationOnce(() => {
      readTimes.push(Date.now());
      return Promise.resolve(initial);
    })
    .mockImplementationOnce(() => {
      readTimes.push(Date.now());
      return prompted;
    });
  await mountSessionCards({
    machineReads: { waitForAttemptChange, readSessionsSince },
  });
  await expect.poll(() => waitForAttemptChange.mock.calls).toHaveLength(1);
  expect(waitForAttemptChange.mock.lastCall?.[0]).toEqual({
    id: running.id,
    changes: 1,
  });

  const opened = readTimes[0];
  if (opened === undefined) throw new Error("The initial read was not asked.");
  await vi.advanceTimersByTimeAsync(opened + checkIntervalMs - Date.now() - 1);
  expect(readTimes).toEqual([opened]);
  const changedAt = Date.now();
  tellChange();
  await expect.poll(() => readTimes).toEqual([opened, changedAt]);

  await vi.advanceTimersByTimeAsync(checkIntervalMs);
  expect(readTimes).toEqual([opened, changedAt]);
  const settledAt = Date.now();
  settleRead();
  await expect.element(cardSession().state).toHaveTextContent("Working");
  await vi.advanceTimersByTimeAsync(
    settledAt + checkIntervalMs - Date.now() - 1,
  );
  expect(readTimes).toEqual([opened, changedAt]);
  await vi.advanceTimersByTimeAsync(1);
  await expect
    .poll(() => readTimes)
    .toEqual([opened, changedAt, settledAt + checkIntervalMs]);
});
