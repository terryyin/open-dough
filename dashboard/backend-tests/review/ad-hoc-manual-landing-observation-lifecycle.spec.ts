// A held observation may discover a delivery after the launch it inspected
// was removed or changed. Only a matching, retained launch can keep it.
import { expect, test } from "vitest";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import {
  keepBranchResultRefs,
  releaseExpiredRecordPins,
  sessionBranchPins,
} from "../../server/launchRecordPins.ts";
import { withinRetention } from "../../server/launchRecordRetention.ts";
import { inspectManualLanding } from "../../server/manualSessionLanding.ts";
import {
  sessionLandingObservations,
  type ObservedLandingStore,
} from "../../server/observedSessionLandings.ts";
import {
  launchRetentionDays,
  type LaunchRecord,
} from "../../src/launchRecord.ts";
import { branchResultAtDone } from "../../src/sessionBranchResult.ts";
import { sessionKey } from "../../src/sessionReference.ts";
import {
  observedTrunk,
  twoDoneBranchesMergedByHand,
} from "../support/doneBranchObservation.ts";
import { review } from "../support/doneCaptureReview.ts";

async function heldObservation() {
  const {
    checkout,
    first: { record: leaving, tip: leavingTip },
    second: { record: staying },
    head,
  } = await twoDoneBranchesMergedByHand("leaving", "staying");
  let records = [leaving, staying];
  for (const record of records) {
    const result = branchResultAtDone(record);
    if (result === undefined)
      throw new Error("Missing the Done branch result.");
    await keepBranchResultRefs(record.session, result);
  }
  expect(
    await sessionBranchPins(checkout.integration, leaving.session),
  ).toContainEqual(expect.objectContaining({ objectId: leavingTip }));

  async function discard(dropped: LaunchRecord[]) {
    records = records.filter((record) => !dropped.includes(record));
    await Promise.all(dropped.map(releaseExpiredRecordPins));
  }
  async function expire() {
    const retained = withinRetention(records, Date.now());
    await discard(records.filter((record) => !retained.includes(record)));
  }
  function replace(previous: LaunchRecord, next: LaunchRecord) {
    records = records.map((record) => (record === previous ? next : record));
    return next;
  }

  const store: ObservedLandingStore = {
    keptRecords: () => Promise.resolve(withinRetention(records, Date.now())),
    async changeSessionRecord(sourceId, session, change) {
      if (sourceId !== observedTrunk.id) throw new Error("Unexpected project.");
      await expire();
      const current = records.find(
        (record) => sessionKey(record.session) === sessionKey(session),
      );
      if (current === undefined) return undefined;
      return replace(current, await change(current));
    },
  };

  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  let reached = () => {};
  const held = new Promise<void>((resolve) => {
    reached = resolve;
  });
  const observation = sessionLandingObservations({
    store,
    async inspect(...inspection) {
      if (inspection[1] === leavingTip) {
        reached();
        await released;
      }
      return inspectManualLanding(...inspection);
    },
  }).observe(observedTrunk, head);
  await held;
  return {
    checkout,
    leaving,
    staying,
    head,
    observation,
    release,
    records: () => store.keptRecords(observedTrunk.id),
    remove: () => discard([leaving]),
    replace,
    expire,
  };
}

async function expectOnlyTheSurvivorDelivered(
  integration: string,
  records: readonly LaunchRecord[],
  removed: LaunchRecord,
  survivor: LaunchRecord,
) {
  const delivered = await review(records, survivor);
  expect(delivered).toMatchObject({
    kind: "landed",
    files: [{ path: "staying.txt" }],
  });
  if (delivered.kind !== "landed")
    throw new Error("Missing independent delivery");
  expect(records.map((record) => record.session.sessionId)).toEqual([
    survivor.session.sessionId,
  ]);
  expect(await sessionBranchPins(integration, removed.session)).toEqual([]);
  const { landing } = delivered;
  const pinned = `refs/open-dough/one-shot/${landing.reference}/${landing.delivery}`;
  expect(await heldLandingPins(integration)).toEqual([
    { ref: `${pinned}/base`, objectId: landing.base },
    { ref: `${pinned}/revision`, objectId: landing.revision },
  ]);
}

function aged(record: LaunchRecord): LaunchRecord {
  const expired = new Date(
    Date.now() - (launchRetentionDays + 1) * 86_400_000,
  ).toISOString();
  return { ...record, doneAt: expired };
}

test("deleting while the target is being inspected cannot recreate the launch or leave delivery pins", async () => {
  const { checkout, leaving, staying, observation, release, records, remove } =
    await heldObservation();

  await remove();
  expect(await records()).not.toContain(leaving);
  release();
  await observation;

  await expectOnlyTheSurvivorDelivered(
    checkout.integration,
    await records(),
    leaving,
    staying,
  );
});

test("expiry while the target is being inspected releases evidence and cannot recreate the launch", async () => {
  const {
    checkout,
    leaving,
    staying,
    observation,
    release,
    records,
    replace,
    expire,
  } = await heldObservation();

  replace(leaving, aged(leaving));
  release();
  await observation;
  await expectOnlyTheSurvivorDelivered(
    checkout.integration,
    await records(),
    leaving,
    staying,
  );

  const survivor = (await records()).find(
    (record) => sessionKey(record.session) === sessionKey(staying.session),
  );
  if (survivor === undefined) throw new Error("Missing the kept survivor.");
  replace(survivor, aged(survivor));
  await expire();
  expect(await records()).toEqual([]);
  expect(await heldLandingPins(checkout.integration)).toEqual([]);
  expect(
    await sessionBranchPins(checkout.integration, staying.session),
  ).toEqual([]);
});

const liveChanges = [
  {
    field: "launch time",
    update: (record: LaunchRecord): LaunchRecord => ({
      ...record,
      launchedAt: new Date(Date.parse(record.launchedAt) + 1_000).toISOString(),
    }),
  },
  {
    field: "branch pin owner",
    update: (record: LaunchRecord): LaunchRecord => ({
      ...record,
      branchEvidenceOwner: { ...record.session, sessionId: "recovered-branch" },
    }),
  },
  {
    field: "Done branch result",
    update: (record: LaunchRecord, revision: string): LaunchRecord => {
      const result = branchResultAtDone(record);
      if (result === undefined)
        throw new Error("Missing the Done branch result.");
      return { ...record, branchResult: { ...result, revision } };
    },
  },
];

test.each(liveChanges)(
  "a changed $field prevents the inspected delivery from being kept",
  async ({ update }) => {
    const { checkout, leaving, head, observation, release, records, replace } =
      await heldObservation();

    const live = replace(leaving, update(leaving, head));
    release();
    await observation;

    expect(
      (await records()).find(
        (record) => sessionKey(record.session) === sessionKey(leaving.session),
      ),
    ).toEqual(live);
    expect(await heldLandingPins(checkout.integration)).toHaveLength(2);
  },
);
