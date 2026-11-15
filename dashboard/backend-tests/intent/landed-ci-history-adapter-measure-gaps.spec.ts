// An adapter measure ask that answers with no job graph is a final gap; a
// failed jobs read stays pending and is asked again
// (SEED-364#chart-ci-time-without-runner-waits).

import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { buildKeyOf } from "../../src/landedCiBuildKey.ts";
import { historyMeasure } from "../../src/ciHistoryMeasureCapability.ts";
import { landedCiHistorySchema } from "../../src/landedCiHistory.ts";
import {
  keepLandedCiHistory,
  landedCiHistory,
} from "../../tests/support/landedCiHistory.ts";
import { publishedLanding } from "../../tests/support/landedCiTrunk.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { adapterProject } from "../../tests/intentCiAdapterProofProject.ts";

test.use({ serverMode: "boundary" });

async function keepAdapterPassWithoutMeasure(
  origin: Parameters<typeof publishedLanding>[0],
  facts: {
    title: string;
    receipt: string;
    at: string;
    runId: string;
    attemptId: string;
    startedAt: string;
    completedAt: string;
    delivery: string;
  },
) {
  const home = path.join(origin.machine, "home");
  const recorded = await publishedLanding(origin, {
    title: facts.title,
    receipt: facts.receipt,
    at: facts.at,
  });
  const attempt = makeMe.aCiAdapterAttempt
    .passed({
      sha: recorded.revision,
      runId: facts.runId,
      attemptId: facts.attemptId,
      branch: "main",
      startedAt: facts.startedAt,
      completedAt: facts.completedAt,
    })
    .please();
  const adapter = adapterProject(home);
  const adapterAttempt = {
    runId: attempt.runId,
    attemptId: attempt.attemptId,
  };
  const build = makeMe.aKeptBuild
    .with({
      revision: recorded.revision,
      state: "pass" as const,
      adapterAttempt,
      runBranch: "main",
      runUrl: `https://ci.invalid/builds/${facts.title}`,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      timeWithoutRunnerWaits: undefined,
    })
    .please();
  await keepLandedCiHistory(
    home,
    makeMe.aLandedCiHistory
      .inTrunkOrder([recorded.revision])
      .recording(
        makeMe.aLaunchLanding
          .comparing({ base: "b".repeat(40), revision: recorded.revision })
          .deliveredAs({ delivery: facts.delivery, receipt: recorded.receipt })
          .receivedAt(recorded.at)
          .please(),
        buildKeyOf(build),
        build,
      )
      .please(),
  );
  return { adapter, recorded, adapterAttempt, attempt };
}

test("an adapter that gives no job graph is a final measure gap naming the build", async ({
  origin,
  startServer,
}) => {
  const { adapter, recorded, adapterAttempt, attempt } =
    await keepAdapterPassWithoutMeasure(origin, {
      title: "adapter-measure",
      receipt: "ffffffff-0000-4000-8000-000000000201",
      at: "2026-11-05T09:00:00Z",
      runId: "measure/run",
      attemptId: "first:1",
      startedAt: "2026-11-05T10:01:00Z",
      completedAt: "2026-11-05T10:03:00Z",
      delivery: "adapter",
    });
  adapter.answer({
    discover: { main: [attempt] },
    proof: { unavailable: "No declared proof" },
    jobs: { unavailable: "Job history expired!" },
  });
  const server = await startServer();
  await expect
    .poll(async () => {
      const answer = await landedCiHistory(
        server,
        undefined,
        historyMeasure.value,
      );
      return landedCiHistorySchema.parse(answer.body).entries;
    })
    .toEqual([
      expect.objectContaining({
        kind: "gap",
        reason: historyMeasure.value,
        revision: recorded.revision,
        explanation: "The CI adapter gave no job graph: Job history expired!",
        build: expect.objectContaining({
          revision: recorded.revision,
          provenance: "exact",
          adapterAttempt,
        }),
      }),
    ]);
  expect(adapter.jobsRequests().length).toBeGreaterThanOrEqual(1);
  const afterFinal = adapter.jobsRequests().length;
  const proofs = adapter.proofRequests().length;
  await expect.poll(() => adapter.proofRequests().length > proofs).toBe(true);
  expect(adapter.jobsRequests().length).toBe(afterFinal);
});

test("a failed adapter jobs read stays a pending measure gap and is asked again", async ({
  origin,
  startServer,
}) => {
  const { adapter, recorded, attempt } = await keepAdapterPassWithoutMeasure(
    origin,
    {
      title: "adapter-pending",
      receipt: "ffffffff-0000-4000-8000-000000000202",
      at: "2026-11-05T09:30:00Z",
      runId: "pending/run",
      attemptId: "pending:1",
      startedAt: "2026-11-05T10:31:00Z",
      completedAt: "2026-11-05T10:33:00Z",
      delivery: "adapter-pending",
    },
  );
  adapter.answer({
    discover: { main: [attempt] },
    proof: { unavailable: "No declared proof" },
    jobsStderrByAttemptId: { "pending:1": "jobs boom\n" },
  });
  const server = await startServer();
  await expect
    .poll(() => adapter.jobsRequests().length)
    .toBeGreaterThanOrEqual(1);
  expect(
    landedCiHistorySchema.parse(
      (await landedCiHistory(server, undefined, historyMeasure.value)).body,
    ).entries,
  ).toEqual([
    expect.objectContaining({
      kind: "gap",
      reason: "pending",
      waitsFor: historyMeasure.value,
      revision: recorded.revision,
    }),
  ]);
  const afterFirst = adapter.jobsRequests().length;
  await expect
    .poll(() => adapter.jobsRequests().length > afterFirst)
    .toBe(true);
});
