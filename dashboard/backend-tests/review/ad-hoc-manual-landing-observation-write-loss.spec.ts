import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import {
  sessionLandingObservations,
  type ObservedLandingStore,
} from "../../server/observedSessionLandings.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { sessionKey } from "../../src/sessionReference.ts";
import {
  aCheckoutWithWorktree,
  anIsolatedLaunch,
  inWorktree,
  minutesAgo,
  work,
} from "../support/doneCaptureCase.ts";
import { observedTrunk } from "../support/doneBranchObservation.ts";
import { aDoneBranch } from "../support/doneCaptureReview.ts";

async function aMergedDoneBranch() {
  const branch = "draft";
  const { checkout, workspace } = await aCheckoutWithWorktree(branch);
  const { draft } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing(branch, { at: minutesAgo(30) }),
  );
  const record = await aDoneBranch(
    anIsolatedLaunch(checkout, { workspace, branch }),
  );
  const { merge } = await work(
    checkout,
    makeMe.aCheckoutWork
      .mergingTipByHand("merge", { tip: draft, at: minutesAgo(5) })
      .pushingToTrunk("published", { at: minutesAgo(5) }),
  );
  return { checkout, record, merge };
}

test.each([
  {
    outcome: "fails",
    finish: () => Promise.reject(new Error("Could not save the launch.")),
  },
  { outcome: "loses", finish: () => Promise.resolve(undefined) },
])(
  "a write that $outcome after pinning releases the unkept delivery pins",
  async ({ finish }) => {
    const { checkout, record, merge } = await aMergedDoneBranch();
    let pinnedDuringWrite: Awaited<ReturnType<typeof heldLandingPins>> = [];
    const store: ObservedLandingStore = {
      keptRecords: () => Promise.resolve([record]),
      async changeSessionRecord(source, session, change) {
        if (
          source !== observedTrunk.id ||
          sessionKey(session) !== sessionKey(record.session)
        )
          return;
        const candidate = await change(record);
        if (candidate.landing !== undefined)
          pinnedDuringWrite = await heldLandingPins(checkout.integration);
        return finish();
      },
    };

    await sessionLandingObservations({ store }).observe(observedTrunk, merge);

    expect(pinnedDuringWrite).toEqual([
      expect.objectContaining({ objectId: checkout.base }),
      expect.objectContaining({ objectId: merge }),
    ]);
    expect(await heldLandingPins(checkout.integration)).toEqual([]);
  },
);

test("an error after saving keeps the pins of the saved delivery", async () => {
  const { checkout, record, merge } = await aMergedDoneBranch();
  let retained: LaunchRecord = record;
  const store: ObservedLandingStore = {
    keptRecords: () => Promise.resolve([retained]),
    async changeSessionRecord(source, session, change) {
      if (
        source !== observedTrunk.id ||
        sessionKey(session) !== sessionKey(retained.session)
      )
        return;
      retained = await change(retained);
      throw new Error("Could not announce the saved delivery.");
    },
  };

  await sessionLandingObservations({ store }).observe(observedTrunk, merge);

  const { landing } = retained;
  if (landing === undefined) throw new Error("Missing the retained delivery.");
  const pinned = `refs/open-dough/one-shot/${landing.reference}/${landing.delivery}`;
  expect(await heldLandingPins(checkout.integration)).toEqual([
    { ref: `${pinned}/base`, objectId: checkout.base },
    { ref: `${pinned}/revision`, objectId: merge },
  ]);
});
