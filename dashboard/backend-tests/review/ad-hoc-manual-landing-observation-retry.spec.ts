// A failed verification of one Done branch's delivery leaves it to retry at
// the same revision while another Done branch's delivery settles.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { inspectManualLanding } from "../../server/manualSessionLanding.ts";
import {
  observedSessionDeliveries,
  type ObservedDelivery,
} from "../../server/observedSessionDeliveries.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  observedTrunk,
  twoDoneBranchesMergedByHand,
} from "../support/doneBranchObservation.ts";
import { review } from "../support/doneCaptureReview.ts";

test("a failed verification retries at the same revision and lets other deliveries settle", async () => {
  const { checkout, first, second, firstMerge, head } =
    await twoDoneBranchesMergedByHand("retry", "independent");
  const { record: retrying, tip: draft } = first;
  const { record: independent } = second;
  let failed = false;
  const inspect: typeof inspectManualLanding = (...inspection) => {
    if (inspection[1] === draft && !failed) {
      failed = true;
      return Promise.reject(new Error("Verification failed once."));
    }
    return inspectManualLanding(...inspection);
  };
  const observations = observedSessionDeliveries({ inspect });
  const keeping = (records: LaunchRecord[], discoveries: ObservedDelivery[]) =>
    records.map((record) => {
      const pair = discoveries.find(
        (delivery) => delivery.record === record,
      )?.pair;
      return pair === undefined
        ? record
        : {
            ...record,
            landing: makeMe.aLaunchLanding
              .capturedFrom(pair)
              .comparing(pair)
              .please(),
          };
    });

  const records = [retrying, independent];
  const firstPass = await observations.observe(observedTrunk, head, records);
  const afterFirstPass = keeping(records, firstPass);
  expect(await review(afterFirstPass, independent)).toMatchObject({
    kind: "landed",
    baseline: firstMerge,
    tree: head,
    files: [{ path: "independent.txt" }],
  });
  expect(failed).toBe(true);
  expect(await review(afterFirstPass, retrying)).toMatchObject({
    kind: "branch-result",
    tree: draft,
  });
  expect(firstPass.find(({ record }) => record === retrying)).toBeUndefined();

  const secondPass = await observations.observe(
    observedTrunk,
    head,
    afterFirstPass,
  );
  expect(
    await review(keeping(afterFirstPass, secondPass), retrying),
  ).toMatchObject({
    kind: "landed",
    baseline: checkout.base,
    tree: firstMerge,
    files: [{ path: "retry.txt" }],
  });
});
