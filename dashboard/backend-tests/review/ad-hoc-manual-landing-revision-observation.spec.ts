// Observing a published revision delivers a Done branch merged on trunk by
// hand once: repeated and later observations, also after a restart, keep the
// same receipt and landing pins until the launch is deleted.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import {
  keepBranchResultRefs,
  releaseExpiredRecordPins,
  sessionBranchPins,
} from "../../server/launchRecordPins.ts";
import {
  sessionLandingObservations,
  type ObservedLandingStore,
} from "../../server/observedSessionLandings.ts";
import { branchResultAtDone } from "../../src/sessionBranchResult.ts";
import { sessionKey } from "../../src/sessionReference.ts";
import {
  aCheckoutWithWorktree,
  anIsolatedLaunch,
  inWorktree,
  minutesAgo,
  work,
} from "../support/doneCaptureCase.ts";
import { aDoneBranch, fileText, review } from "../support/doneCaptureReview.ts";
import { observedTrunk } from "../support/doneBranchObservation.ts";

const branch = "draft";

test("ordinary revision checks retain one delivery across repeated observations", async () => {
  const { checkout, workspace } = await aCheckoutWithWorktree(branch);
  const { integration } = checkout;
  const { draft: tip } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("draft", { at: minutesAgo(30) }),
  );
  const record = await aDoneBranch(
    anIsolatedLaunch(checkout, { workspace, branch }),
  );
  const branchResult = branchResultAtDone(record);
  if (branchResult === undefined)
    throw new Error("Missing the Done branch result.");
  await keepBranchResultRefs(record.session, branchResult);
  expect(await sessionBranchPins(integration, record.session)).toContainEqual(
    expect.objectContaining({ objectId: tip }),
  );
  let records = [record];
  const store: ObservedLandingStore = {
    keptRecords: () => Promise.resolve(records),
    async changeSessionRecord(sourceId, session, change) {
      if (sourceId !== observedTrunk.id) throw new Error("Unexpected project.");
      const [current] = records;
      if (
        current === undefined ||
        sessionKey(current.session) !== sessionKey(session)
      )
        return undefined;
      const saved = await change(current);
      records = [saved];
      return saved;
    },
  };
  const { merge } = await work(
    checkout,
    makeMe.aCheckoutWork
      .mergingTipByHand("merge", { tip, at: minutesAgo(5) })
      .pushingToTrunk("pushed", { at: minutesAgo(5) }),
  );

  await sessionLandingObservations({ store }).observe(observedTrunk, merge);
  const captured = await review(records, record);
  expect(captured).toMatchObject({
    kind: "landed",
    baseline: checkout.base,
    tree: merge,
    files: [{ path: "draft.txt" }],
  });
  if (captured.kind !== "landed") throw new Error("Missing the delivery.");
  expect(
    await fileText(records, record, {
      reference: captured.landing.reference,
      baseline: checkout.base,
      tree: merge,
      path: "draft.txt",
    }),
  ).toEqual({ kind: "text", baseline: null, tree: "draft work\n" });
  const saved = records[0]?.landing;
  const pinned = `refs/open-dough/one-shot/${captured.landing.reference}/${captured.landing.delivery}`;
  const pins = await heldLandingPins(integration, captured.landing);
  expect(pins).toEqual([
    { ref: `${pinned}/base`, objectId: checkout.base },
    { ref: `${pinned}/revision`, objectId: merge },
  ]);

  const observations = sessionLandingObservations({ store });
  await observations.observe(observedTrunk, merge);
  const { advance } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("later", { at: minutesAgo(5) })
      .pushingToTrunk("advance", { at: minutesAgo(5) }),
  );
  await observations.observe(observedTrunk, advance);
  expect(await review(records, record)).toEqual(captured);
  expect(records[0]?.landing).toEqual(saved);
  expect(await heldLandingPins(integration)).toEqual(pins);

  const [removed] = records;
  if (removed === undefined) throw new Error("Missing the kept record.");
  records = [];
  await releaseExpiredRecordPins(removed);
  expect(await sessionBranchPins(integration, record.session)).toEqual([]);
  expect(await heldLandingPins(integration)).toEqual([]);
});
