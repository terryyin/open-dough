// The store adapter keeps an observed delivery on the live launch with its
// landing pins, and holds no pins for a delivery the launch did not keep.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import {
  sessionLandingObservations,
  type ObservedLandingStore,
} from "../../server/observedSessionLandings.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { branchResultAtDone } from "../../src/sessionBranchResult.ts";
import { aCheckout, source } from "../support/doneCaptureCase.ts";

const observedTrunk = { id: source, ref: "main" };
const observed = "c".repeat(40);
const trunk = { remote: "origin", target: "refs/heads/main" };

// A Done branch awaiting delivery whose inspection finds `pair`, a revision
// of a real repository so the adapter can pin it.
async function aDeliveredDoneBranch() {
  const { integration: repository, base } = await aCheckout();
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "draft" })
    .awaitingManualDelivery({ repository, base, revision: base })
    .please();
  const pair = { repository, ...trunk, base, revision: base };
  const observe = (store: ObservedLandingStore) =>
    sessionLandingObservations({
      store,
      readTrunkHead: () => Promise.resolve(observed),
      inspect: () => Promise.resolve(pair),
    }).observe(observedTrunk, observed);
  return { repository, record, pair, observe };
}

// A store holding `kept`, whose session write saves its change to `live`.
function aStore(kept: LaunchRecord, live = kept) {
  const store = {
    saved: undefined as LaunchRecord | undefined,
    keptRecords: () => Promise.resolve([kept]),
    async changeSessionRecord(
      ...[, , change]: Parameters<ObservedLandingStore["changeSessionRecord"]>
    ) {
      store.saved = await change(live);
      return store.saved;
    },
  };
  return store;
}

test("an observed delivery is kept on the live launch with its pins", async () => {
  const { repository, record, pair, observe } = await aDeliveredDoneBranch();
  const store = aStore(record);

  await observe(store);

  const landing = store.saved?.landing;
  expect(landing).toMatchObject(pair);
  const pinned = `refs/open-dough/one-shot/${landing?.reference}/${landing?.delivery}`;
  expect(await heldLandingPins(repository)).toEqual([
    { ref: `${pinned}/base`, objectId: pair.base },
    { ref: `${pinned}/revision`, objectId: pair.revision },
  ]);
});

test.each([
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
    update: (record: LaunchRecord): LaunchRecord => {
      const result = branchResultAtDone(record);
      if (result === undefined)
        throw new Error("Missing the Done branch result.");
      return { ...record, branchResult: { ...result, revision: observed } };
    },
  },
])(
  "a launch whose $field changed during inspection keeps no delivery",
  async ({ update }) => {
    const { repository, record, observe } = await aDeliveredDoneBranch();
    const live = update(record);
    const store = aStore(record, live);

    await observe(store);

    expect(store.saved).toBe(live);
    expect(await heldLandingPins(repository)).toEqual([]);
  },
);

test.each([
  { outcome: "an unsaved", saved: false, pins: 0 },
  { outcome: "a saved", saved: true, pins: 2 },
])(
  "a write that fails after pinning keeps pins only for $outcome delivery",
  async ({ saved, pins }) => {
    const { repository, record, observe } = await aDeliveredDoneBranch();
    let kept = record;
    const store: ObservedLandingStore = {
      keptRecords: () => Promise.resolve([kept]),
      async changeSessionRecord(...[, , change]) {
        const changed = await change(kept);
        if (saved) kept = changed;
        throw new Error("Could not save the launch.");
      },
    };

    await observe(store);

    expect(await heldLandingPins(repository)).toHaveLength(pins);
  },
);
