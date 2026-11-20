// A failed verification of one Done branch's delivery leaves it to retry at
// the same revision while another Done branch's delivery settles.
import { expect, test } from "vitest";
import { keptSession } from "../../server/launchRecordStore.ts";
import { inspectManualLanding } from "../../server/manualSessionLanding.ts";
import { sessionLandingObservations } from "../../server/observedSessionLandings.ts";
import {
  observedTrunk,
  twoDoneBranchesMergedByHand,
} from "../support/doneBranchObservation.ts";
import { source } from "../support/doneCaptureCase.ts";
import { review } from "../support/doneCaptureReview.ts";

test("a failed verification retries at the same revision and lets other deliveries settle", async () => {
  const { checkout, first, second, firstMerge, head } =
    await twoDoneBranchesMergedByHand("retry", "independent");
  const { record: retrying, tip: draft } = first;
  const { record: independent } = second;
  let failed = false;
  const observations = sessionLandingObservations(async (...inspection) => {
    if (inspection[1] === draft && !failed) {
      failed = true;
      throw new Error("Verification failed once.");
    }
    return inspectManualLanding(...inspection);
  });

  await observations.observe(observedTrunk, head);
  expect(await review(independent)).toMatchObject({
    kind: "landed",
    baseline: firstMerge,
    tree: head,
    files: [{ path: "independent.txt" }],
  });
  expect(failed).toBe(true);
  expect(await review(retrying)).toMatchObject({
    kind: "branch-result",
    tree: draft,
  });
  expect((await keptSession(source, retrying.session))?.landing).toBe(
    undefined,
  );

  await observations.observe(observedTrunk, head);
  expect(await review(retrying)).toMatchObject({
    kind: "landed",
    baseline: checkout.base,
    tree: firstMerge,
    files: [{ path: "retry.txt" }],
  });
});
