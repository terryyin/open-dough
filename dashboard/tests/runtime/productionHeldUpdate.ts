// Stage B against the published commit selected before C advances, while
// the old preview still owns a native start that must settle before B serves.
import type { APIRequestContext } from "@playwright/test";
import { readFile, rm, writeFile } from "node:fs/promises";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { Acceptance } from "../../src/agentLaunch.ts";
import { attempts, machineSessions } from "../agentLaunchSessions.ts";
import {
  settledAtFirstDrain,
  waitForLaunchAdmissionClosed,
} from "../support/launchAdmissionObservation.ts";
import { expect } from "../support/pageTest.ts";
import { holdBuildPath, waitForBuild } from "../support/productionBuildGate.ts";
import {
  deploymentCheckout,
  productionBoundary,
} from "../support/productionWatcher.ts";
import { processRunning } from "../support/processGroup.ts";
import type { ProductionUpdateJourney } from "./productionUpdateJourney.ts";

export async function replaceWhileStartDrains(
  journey: ProductionUpdateJourney,
  request: APIRequestContext,
) {
  const state = journey.started();
  const { fixture, page, watcher, native, drainEvents } = state;
  const launch = makeMe.aLaunchRequest.adHoc({ host: "codex" }).please();
  const start = (data = launch) =>
    request.post(`${state.served.url}/__agent-launch/accept`, {
      headers: { Origin: state.served.url },
      data,
    });
  // B is selected and held in its real build while C reaches main. B is
  // served exactly; a later check then selects C.
  await writeFile(holdBuildPath(fixture.home, 2), "");
  await writeFile(holdBuildPath(fixture.home, 3), "");
  const b = await fixture.publish(fixture.markerChanges("MAIN B"), "Main B");
  const heldBuild = await waitForBuild(watcher, fixture.home, 2);
  expect(await journey.builds()).toHaveLength(2);
  expect(heldBuild.checkout).toEqual(deploymentCheckout(b));
  const c = await fixture.publish(fixture.markerChanges("MAIN C"), "Main C");
  native.hold();
  const accepted = (await (await start()).json()) as Extract<
    Acceptance,
    { kind: "accepted" }
  >;
  expect(accepted.kind).toBe("accepted");
  expect(accepted.attempt.outcome).toBeUndefined();
  await rm(holdBuildPath(fixture.home, 2));
  await waitForLaunchAdmissionClosed(watcher, drainEvents);
  expect(watcher.output()).toContain(
    "Waiting for accepted dashboard starts before updating.",
  );
  expect(processRunning(state.served.pid)).toBe(true);
  expect(watcher.output()).not.toContain(`Production dashboard ${b} at`);
  const blocked = await start();
  expect(blocked.status()).toBe(503);
  native.release();
  expect(await settledAtFirstDrain(watcher, drainEvents)).toContain(
    accepted.attempt.id,
  );
  await journey.replacedBy(b);
  const boundary = productionBoundary(state.served.url, fixture.home);
  // A settled launch no longer needs attention, so its attempt is read with
  // the history rather than the regular answer.
  const history = await attempts(boundary);
  expect(history).toHaveLength(1);
  const [attempt] = history;
  expect(attempt).toMatchObject({
    id: accepted.attempt.id,
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
