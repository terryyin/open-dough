// A measure-naming project history read answers its prior-build reference from
// kept CI time without runner waits (../../server/intentCiHistoryRead.ts);
// Done and default project reads keep wall time
// (SEED-364#chart-ci-time-without-runner-waits example 2).
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { pendingWaitWords } from "../../src/ciHistoryGapWords.ts";
import { historyMeasure } from "../../src/ciHistoryMeasureCapability.ts";
import { landedCiHistorySchema } from "../../src/landedCiHistory.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import {
  keepLandedCiHistory,
  landedCiHistory,
} from "../../tests/support/landedCiHistory.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";

test.use({ serverMode: "boundary" });

const revisionOf = (n: number) => n.toString(16).padStart(40, "0");

test("a measure-naming project read averages five priors at 5 min against a 4 min landing; without the measure a prior is excluded; Done and default stay wall time", async ({
  dashboard,
  github,
}) => {
  const wallMs = 6 * 60_000;
  const fiveMin = 5 * 60_000;
  const fourMin = 4 * 60_000;
  const order = [1, 2, 3, 4, 5, 6, 7].map(revisionOf);
  const builder = makeMe.aLandedCiHistory.inTrunkOrder(order);
  for (const [index, revision] of order.entries()) {
    const startedAt = `2026-11-${String(index + 1).padStart(2, "0")}T10:00:00Z`;
    const runId = index + 1;
    const measureMs = index === 6 ? fourMin : fiveMin;
    builder.measuredLanding({
      receipt: String(index),
      revision,
      runId,
      receivedAt: startedAt,
      startedAt,
      completedAt: new Date(Date.parse(startedAt) + wallMs).toISOString(),
      ...(index === 2
        ? {}
        : { timeWithoutRunnerWaits: { milliseconds: measureMs } }),
    });
    builder.proofFor(
      `run/${runId}/1`,
      makeMe.aCiProof
        .forRun({ revision, runId })
        .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
        .please(),
    );
  }
  await keepLandedCiHistory(dashboard.home, builder.please());
  const before = github.calls.length;
  const named = landedCiHistorySchema.parse(
    (await landedCiHistory(dashboard, undefined, historyMeasure.value)).body,
  );
  expect(named.reference).toMatchObject({
    endpoint: revisionOf(7),
    selected: { key: "run/7/1", ms: fourMin },
    sampleCount: 5,
    averageMs: fiveMin,
    difference: { changeMs: -60_000, relative: -0.2, text: "−1 min" },
  });
  expect(
    named.reference?.evidence.find((sample) => sample.key === "run/3/1"),
  ).toMatchObject({
    status: "excluded",
    reason: pendingWaitWords[historyMeasure.value],
  });
  const defaultRead = landedCiHistorySchema.parse(
    (await landedCiHistory(dashboard)).body,
  );
  expect(defaultRead.reference).toMatchObject({
    selected: { key: "run/7/1", ms: wallMs },
    sampleCount: 6,
    averageMs: wallMs,
  });
  const doneQuery = new URLSearchParams({
    source: "open-dough",
    intent: "ci-history",
    revision: revisionOf(7),
    through: "2026-11-07T10:00:00Z",
  });
  const doneResponse = await rawRequest({
    url: `${dashboard.origin}/__authenticated-read?${doneQuery}`,
    headers: { Origin: dashboard.origin },
  });
  expect({
    status: doneResponse.status,
    body: JSON.parse(doneResponse.body) as unknown,
  }).toMatchObject({
    status: 200,
    body: {
      selectedRevision: revisionOf(7),
      reference: {
        selected: { key: "run/7/1", ms: wallMs },
        sampleCount: 6,
        averageMs: wallMs,
      },
    },
  });
  expect(github.calls).toHaveLength(before);
});
