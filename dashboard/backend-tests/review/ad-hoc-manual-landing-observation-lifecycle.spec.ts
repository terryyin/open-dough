// Deleting or expiring one Done branch while its delivery is being inspected
// wins: the other branch's delivery settles and only its evidence remains.
import { expect, test } from "vitest";
import { replaceRecords } from "../../server/launchRecordDocument.ts";
import { installRecordRemovalDispatch } from "../../server/launchRecordRemoval.ts";
import { deleteRecord, keptRecords } from "../../server/launchRecordStore.ts";
import { inspectManualLanding } from "../../server/manualSessionLanding.ts";
import { sessionLandingObservations } from "../../server/observedSessionLandings.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { launchRetentionDays } from "../../src/launchRecord.ts";
import {
  landingPins,
  sessionBranchPins,
} from "../../test-support/support/adHocBranchRefs.ts";
import { changeLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  observedTrunk,
  twoDoneBranchesMergedByHand,
} from "../support/doneBranchObservation.ts";
import { source } from "../support/doneCaptureCase.ts";
import { review } from "../support/doneCaptureReview.ts";

// Two kept Done branches merged by hand into published trunk, and an
// observation of that revision whose inspection of `leaving` waits until
// released.
async function heldObservation() {
  installRecordRemovalDispatch();
  const {
    checkout,
    home,
    first: { record: leaving, tip: leavingTip },
    second: { record: staying },
    head,
  } = await twoDoneBranchesMergedByHand("leaving", "staying");
  expect(
    sessionBranchPins(checkout.integration, leaving.session.sessionId),
  ).toContain(leavingTip);

  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  let reached = () => {};
  const held = new Promise<void>((resolve) => {
    reached = resolve;
  });
  const observation = sessionLandingObservations(async (...inspection) => {
    if (inspection[1] === leavingTip) {
      reached();
      await released;
    }
    return inspectManualLanding(...inspection);
  }).observe(observedTrunk, head);
  await held;
  return { checkout, home, leaving, staying, observation, release };
}

async function expectOnlyTheSurvivorDelivered(
  checkout: { integration: string },
  removed: LaunchRecord,
  survivor: LaunchRecord,
) {
  const delivered = await review(await keptRecords(source), survivor);
  expect(delivered).toMatchObject({
    kind: "landed",
    files: [{ path: "staying.txt" }],
  });
  if (delivered.kind !== "landed")
    throw new Error("Missing independent delivery");
  expect(
    (await keptRecords(source)).map((record) => record.session.sessionId),
  ).toEqual([survivor.session.sessionId]);
  expect(
    sessionBranchPins(checkout.integration, removed.session.sessionId),
  ).toEqual([]);
  const pinned = `refs/open-dough/one-shot/${delivered.landing.reference}/${delivered.landing.delivery}`;
  expect(landingPins(checkout.integration)).toEqual([
    `${pinned}/base`,
    `${pinned}/revision`,
  ]);
}

function ageDoneRecord(home: string, record: LaunchRecord) {
  const expired = new Date(
    Date.now() - (launchRetentionDays + 1) * 86_400_000,
  ).toISOString();
  changeLaunchStore(home, (kept) => ({
    ...kept,
    [source]:
      kept[source]?.map((entry) =>
        "session" in entry &&
        entry.session.sessionId === record.session.sessionId
          ? { ...entry, doneAt: expired }
          : entry,
      ) ?? [],
  }));
}

test("deleting while the target is being inspected cannot recreate the launch or leave delivery pins", async () => {
  const { checkout, leaving, staying, observation, release } =
    await heldObservation();

  expect(await deleteRecord(source, leaving.session)).toBe(true);
  release();
  await observation;

  await expectOnlyTheSurvivorDelivered(checkout, leaving, staying);
});

test("expiry while the target is being inspected releases evidence and cannot recreate the launch", async () => {
  const { checkout, home, leaving, staying, observation, release } =
    await heldObservation();

  ageDoneRecord(home, leaving);
  release();
  await observation;
  await expectOnlyTheSurvivorDelivered(checkout, leaving, staying);

  ageDoneRecord(home, staying);
  await replaceRecords((kept) => kept);
  expect(await keptRecords(source)).toEqual([]);
  expect(landingPins(checkout.integration)).toEqual([]);
  expect(
    sessionBranchPins(checkout.integration, staying.session.sessionId),
  ).toEqual([]);
});
