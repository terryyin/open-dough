// Follow-up reading retains the original sample and exclusions after later
// history changes. Request admission and actual repeat submission stay with
// their existing proof owners.
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { answerCiFollowUp } from "../../server/ciFollowUpBoundary.ts";
import { changeFollowUps, followUpKey } from "../../server/ciFollowUpStore.ts";
import { wallTimeReferenceOf } from "../../server/ciWallTimeReference.ts";
import {
  keptLandedCiHistory,
  updateProjectHistory,
} from "../../server/landedCiHistoryStore.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import {
  buildAt,
  endpointIdentity,
  exclusion,
  followUpGet,
  openFollowUpCheckout,
  outlierFollowUpLandings,
  outlierReason,
  recoveredRequest,
  source,
  target,
} from "../support/landedCiFollowUpReadingCase.ts";

test("later landing keeps original 120s once as slow outlier; never samples the 100s repeat", async () => {
  const checkout = await openFollowUpCheckout();
  const { landing: completion, later, trunk } = checkout.revisions;
  const stopped = new AbortController();
  onTestFinished(() => {
    stopped.abort();
  });
  const seeded = outlierFollowUpLandings(
    checkout.integration,
    completion,
    later,
    trunk,
  );
  await changeFollowUps(() => ({
    landings: {
      [followUpKey(source.id, { target, revision: completion })]:
        makeMe.aCiFollowUpEntry
          .with({
            project: source.id,
            identity: endpointIdentity,
            revision: completion,
            target,
            eligible: true,
            receipts: [seeded.storyLanding.receipt],
            request: seeded.request,
          })
          .please(),
    },
  }));
  await updateProjectHistory(source.id, () => seeded.history);

  const history = await keptLandedCiHistory(source.id);
  expect(history.landings[seeded.storyLanding.receipt]?.observed).toEqual({
    kind: "build",
    build: "run/71/1",
    selection: "exact",
  });
  expect(history.builds["run/71/1"]).toMatchObject({
    runId: 71,
    runAttempt: 1,
    startedAt: seeded.originalStarted,
  });
  expect(
    Object.values(history.landings).some(
      (entry) =>
        entry.observed.kind === "build" && entry.observed.build === "run/71/2",
    ),
  ).toBe(false);
  const reference = wallTimeReferenceOf(history, later);
  expect(reference).toMatchObject({
    endpoint: later,
    selected: { key: "run/80/1", ms: 110_000 },
    averageMs: 100_000,
  });
  const originalSamples = reference.evidence.filter(
    (sample) => sample.key === "run/71/1",
  );
  expect(originalSamples).toHaveLength(1);
  expect(originalSamples[0]).toMatchObject({
    date: seeded.originalStarted,
    ms: 120_000,
    status: "excluded",
    reason: outlierReason,
  });
  expect(
    await answerCiFollowUp(followUpGet(`id=${source.id}`), stopped.signal),
  ).toMatchObject({
    cards: [
      {
        revision: completion,
        identity: endpointIdentity,
        originalMs: 120_000,
        repeatMs: 100_000,
        averageMs: 100_000,
        kind: "recovered",
      },
    ],
  });
});

test("saved samples, exclusions and workflow survive window eviction and a newer same-identity record", async () => {
  const checkout = await openFollowUpCheckout();
  const { landing: completion, later } = checkout.revisions;
  const stopped = new AbortController();
  onTestFinished(() => {
    stopped.abort();
  });
  const original = buildAt(completion, 71, "2026-11-10T07:00:00.000Z", 120_000);
  const repeat = buildAt(
    completion,
    71,
    "2026-11-10T07:05:00.000Z",
    100_000,
    2,
  );
  const request = recoveredRequest(completion, original, repeat, [
    {
      key: "run/5/1",
      date: "2026-11-10T05:00:00.000Z",
      ms: 100_000,
      status: "included",
    },
    exclusion,
  ]);
  const originalEntry = makeMe.aCiFollowUpEntry
    .with({
      project: source.id,
      identity: endpointIdentity,
      revision: completion,
      target,
      eligible: true,
      receipts: ["71000000-0000-4000-8000-000000000071"],
      request,
    })
    .please();
  await changeFollowUps(() => ({
    landings: {
      [followUpKey(source.id, { target, revision: later })]:
        makeMe.aCiFollowUpEntry
          .with({
            ...originalEntry,
            revision: later,
            request: recoveredRequest(
              later,
              { ...original, revision: later },
              { ...repeat, revision: later },
              request.reference.evidence,
              { name: "other.yml", id: 9000, averageMs: 300_000 },
            ),
          })
          .please(),
      [followUpKey(source.id, { target, revision: completion })]: originalEntry,
    },
  }));
  await updateProjectHistory(source.id, () => makeMe.aLandedCiHistory.please());

  expect(
    await answerCiFollowUp(followUpGet(`id=${source.id}`), stopped.signal),
  ).toMatchObject({
    cards: [
      {
        revision: completion,
        identity: endpointIdentity,
        averageMs: 100_000,
        originalMs: 120_000,
        repeatMs: 100_000,
        kind: "recovered",
      },
    ],
  });
  expect(
    await answerCiFollowUp(
      followUpGet(
        `id=${source.id}&identity=${encodeURIComponent(endpointIdentity)}&revision=${completion}`,
      ),
      stopped.signal,
    ),
  ).toMatchObject({
    workflow: "ci.yml",
    workflowId: 7001,
    kind: "recovered",
    original: { runId: 71, runAttempt: 1, ms: 120_000 },
    repeat: { runId: 71, runAttempt: 2, ms: 100_000 },
    reference: {
      averageMs: 100_000,
      evidence: [
        {
          key: "run/5/1",
          date: "2026-11-10T05:00:00.000Z",
          ms: 100_000,
          status: "included",
        },
        exclusion,
      ],
    },
  });
  await expect(
    answerCiFollowUp(
      followUpGet(
        `id=${source.id}&identity=${encodeURIComponent(endpointIdentity)}&revision=${later}`,
      ),
      stopped.signal,
    ),
  ).rejects.toMatchObject({ status: 404 } satisfies Partial<RefusedRequest>);
});
