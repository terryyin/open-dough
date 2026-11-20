// Observing a published revision delivers a Done branch merged on trunk by
// hand once: repeated and later observations, also after a restart, keep the
// same receipt and landing pins until the launch is deleted.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import { sessionBranchPins } from "../../server/launchRecordPins.ts";
import { deleteRecord, keptSession } from "../../server/launchRecordStore.ts";
import { sessionLandingObservations } from "../../server/observedSessionLandings.ts";
import {
  anIsolatedBranch,
  inWorktree,
  markDone,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";
import { fileText, review } from "../support/doneCaptureReview.ts";
import { observedTrunk } from "../support/doneBranchObservation.ts";

const branch = "draft";

test("ordinary revision checks retain one delivery across repeated observations", async () => {
  const { checkout, workspace, record } = await anIsolatedBranch(branch);
  const { integration } = checkout;
  const { draft: tip } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("draft", { at: minutesAgo(30) }),
  );
  await markDone(record);
  const { merge } = await work(
    checkout,
    makeMe.aCheckoutWork
      .mergingTipByHand("merge", { tip, at: minutesAgo(5) })
      .pushingToTrunk("pushed", { at: minutesAgo(5) }),
  );

  await sessionLandingObservations().observe(observedTrunk, merge);
  const captured = await review(record);
  expect(captured).toMatchObject({
    kind: "landed",
    baseline: checkout.base,
    tree: merge,
    files: [{ path: "draft.txt" }],
  });
  if (captured.kind !== "landed") throw new Error("Missing the delivery.");
  expect(
    await fileText(record, {
      reference: captured.landing.reference,
      baseline: checkout.base,
      tree: merge,
      path: "draft.txt",
    }),
  ).toEqual({ kind: "text", baseline: null, tree: "draft work\n" });
  const saved = (await keptSession(source, record.session))?.landing;
  const pinned = `refs/open-dough/one-shot/${captured.landing.reference}/${captured.landing.delivery}`;
  const pins = await heldLandingPins(integration, captured.landing);
  expect(pins).toEqual([
    { ref: `${pinned}/base`, objectId: checkout.base },
    { ref: `${pinned}/revision`, objectId: merge },
  ]);

  const observations = sessionLandingObservations();
  await observations.observe(observedTrunk, merge);
  const { advance } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("later", { at: minutesAgo(5) })
      .pushingToTrunk("advance", { at: minutesAgo(5) }),
  );
  await observations.observe(observedTrunk, advance);
  expect(await review(record)).toEqual(captured);
  expect((await keptSession(source, record.session))?.landing).toEqual(saved);
  expect(await heldLandingPins(integration)).toEqual(pins);

  await deleteRecord(source, record.session);
  expect(await sessionBranchPins(integration, record.session)).toEqual([]);
  expect(await heldLandingPins(integration)).toEqual([]);
});
