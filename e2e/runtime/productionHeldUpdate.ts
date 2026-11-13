// Stage B against the published commit selected before C advances, while
// the old preview still owns a native start that must settle before B serves.
import type { APIRequestContext } from "@playwright/test";
import { readFile, rm, writeFile } from "node:fs/promises";
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  acquireWriteLock,
  releaseWriteLock,
} from "../../dashboard/server/machineJsonLock.ts";
import type { Acceptance } from "../../dashboard/src/agentLaunch.ts";
import { keptAttempts } from "../../dashboard/tests/acceptedAttempts.ts";
import {
  attempts,
  machineSessions,
} from "../../dashboard/tests/agentLaunchSessions.ts";
import {
  settledAtFirstDrain,
  waitForLaunchAdmissionClosed,
} from "../../dashboard/tests/support/launchAdmissionObservation.ts";
import { expect } from "../../dashboard/tests/support/pageTest.ts";
import {
  holdBuildPath,
  holdCompletedBuildPath,
  waitForBuild,
  waitForCompletedBuild,
} from "../../dashboard/tests/support/productionBuildGate.ts";
import {
  deploymentCheckout,
  productionBoundary,
} from "../../dashboard/tests/support/productionWatcher.ts";
import { processRunning } from "../../dashboard/tests/support/processGroup.ts";
import { waitForWatcherOutput } from "../../dashboard/tests/support/watcherEvents.ts";
import type { ProductionUpdateJourney } from "./productionUpdateJourney.ts";

export async function replaceWhileStartDrains(
  journey: ProductionUpdateJourney,
  request: APIRequestContext,
) {
  const state = journey.started();
  const { fixture, page, watcher, drainEvents } = state;
  const boundary = productionBoundary(state.served.url, fixture.home);
  const launch = makeMe.aLaunchRequest.adHoc({ host: "codex" }).please();
  const start = () =>
    request.post(`${state.served.url}/__agent-launch/accept`, {
      headers: { Origin: state.served.url },
      data: launch,
    });
  // B is selected and held in its real build while C reaches main. B is
  // served exactly; a later check then selects C.
  await writeFile(holdBuildPath(fixture.home, 2), "");
  await writeFile(holdBuildPath(fixture.home, 3), "");
  const completedBuildHold = holdCompletedBuildPath(fixture.home);
  await writeFile(completedBuildHold, "");
  const b = await fixture.publish(fixture.markerChanges("MAIN B"), "Main B");
  const heldBuild = await waitForBuild(watcher, fixture.home, 2);
  expect(await journey.builds()).toHaveLength(2);
  expect(heldBuild.checkout).toEqual(deploymentCheckout(b));
  const c = await fixture.publish(fixture.markerChanges("MAIN C"), "Main C");
  await rm(holdBuildPath(fixture.home, 2));
  expect(await waitForCompletedBuild(watcher, fixture.home)).toEqual(
    deploymentCheckout(b),
  );

  // Acceptance writes its own record. Hold the separate machine session
  // writer lock so the native launch stays pending while admission closes.
  const sessionLock = `${journey.shared().store}.lock`;
  let acceptedId: string;
  await acquireWriteLock(sessionLock);
  try {
    const accepted = (await (await start()).json()) as Extract<
      Acceptance,
      { kind: "accepted" }
    >;
    expect(accepted.kind).toBe("accepted");
    expect(accepted.attempt.outcome).toBeUndefined();
    acceptedId = accepted.attempt.id;
    await rm(completedBuildHold);
    await waitForWatcherOutput(
      watcher,
      /Waiting for accepted dashboard starts before updating\./,
    );
    await waitForLaunchAdmissionClosed(watcher, drainEvents);
    const pending = keptAttempts(boundary).find(({ id }) => id === acceptedId);
    expect(pending).toBeDefined();
    expect(pending?.outcome).toBeUndefined();
    expect(
      processRunning(state.served.pid),
      `Expected preview ${state.served.pid} to be serving at admission close. Attempt: ${JSON.stringify(pending)}\n${watcher.output()}`,
    ).toBe(true);
    expect(watcher.output()).not.toContain(`Production dashboard ${b} at`);
    const blocked = await start();
    expect(blocked.status()).toBe(503);
  } finally {
    releaseWriteLock(sessionLock);
  }
  expect(await settledAtFirstDrain(watcher, drainEvents)).toContain(acceptedId);
  await journey.replacedBy(b);
  // A settled launch no longer needs attention, so its attempt is read with
  // the history rather than the regular answer.
  const history = await attempts(boundary);
  expect(history).toHaveLength(1);
  const [attempt] = history;
  expect(attempt).toMatchObject({
    id: acceptedId,
    request: launch,
    outcome: { kind: "launched" },
    settledAt: expect.any(String),
  });
  if (attempt?.outcome?.kind !== "launched")
    throw new Error("The accepted attempt has no launched native session.");
  expect(await machineSessions(boundary)).toContainEqual(
    expect.objectContaining({
      request: expect.objectContaining(launch),
      session: expect.objectContaining(attempt.outcome.session),
    }),
  );
  // The attempt and its session settle through the real native daemon. Keep
  // the resulting document as the bytes the next replacement must preserve.
  const shared = journey.shared();
  state.shared = { ...shared, stored: await readFile(shared.store, "utf8") };
  expect(watcher.output()).toContain(`Preparing production dashboard ${b}.`);
  await page.reload();
  await expect(page).toHaveTitle("MAIN B");
  await journey.expectSharedRecord(request, state.served.url);
  return c;
}
