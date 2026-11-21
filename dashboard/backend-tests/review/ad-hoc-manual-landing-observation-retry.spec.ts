// A failed verification of one Done branch's delivery leaves it to retry at
// the same revision while another Done branch's delivery settles.
import { retainedCommitPairFiles } from "../../server/retainedReviewPair.ts";
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
  const completed = firstPass.find(
    ({ record }) => record === independent,
  )?.pair;
  if (completed === undefined) throw new Error("Missing independent delivery.");
  expect(completed).toMatchObject({ base: firstMerge, revision: head });
  expect(
    await retainedCommitPairFiles(completed, new AbortController().signal),
  ).toMatchObject({ files: [{ path: "independent.txt" }] });
  expect(failed).toBe(true);
  expect(
    afterFirstPass.find(({ session }) => session === retrying.session),
  ).toMatchObject({ branchResult: { revision: draft } });
  expect(firstPass.find(({ record }) => record === retrying)).toBeUndefined();

  const secondPass = await observations.observe(
    observedTrunk,
    head,
    afterFirstPass,
  );
  const retried = secondPass.find(({ record }) => record === retrying)?.pair;
  if (retried === undefined) throw new Error("Missing the retried delivery.");
  expect(retried).toMatchObject({ base: checkout.base, revision: firstMerge });
  expect(
    await retainedCommitPairFiles(retried, new AbortController().signal),
  ).toMatchObject({ files: [{ path: "retry.txt" }] });
});
