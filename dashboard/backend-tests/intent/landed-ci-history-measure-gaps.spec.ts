// Retained builds without a kept measure are supplied from their same recorded
// attempt; a measure-naming read answers a kept time as a point, a kept reason
// as a final gap, and an unanswered or not-yet-asked build as a pending gap
// (SEED-364#chart-ci-time-without-runner-waits).

import { historyMeasure } from "../../src/ciHistoryMeasureCapability.ts";
import { gapReasonWords } from "../../src/ciHistoryGapWords.ts";
import {
  landedCiHistorySchema,
  measuredHistoryOf,
  type FinalGap,
} from "../../src/landedCiHistory.ts";
import type { GhCall } from "../../tests/support/fakeGitHub.ts";
import {
  landedCiHistory,
  restartAsLandedCiReader,
} from "../../tests/support/landedCiHistory.ts";
import {
  keepRetainedMeasureGapHistory,
  retainedMeasureGapCases,
} from "../../tests/support/landedCiRetainedMeasureGapSetup.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { listedAttemptJobPages } from "../../tests/support/storyCiComparisonRequests.ts";

test.use({ serverMode: "boundary" });

const jobsReads = (calls: readonly GhCall[]) => listedAttemptJobPages(calls);

test("retained builds are supplied; answered reasons are final gaps; unanswered reads stay pending and are asked again", async ({
  origin,
  github,
  startServer,
}) => {
  const { landings, control } = await keepRetainedMeasureGapHistory(
    origin,
    github,
  );

  const beforeCollection = await startServer({ environment: "development" });
  const pendingBefore = landedCiHistorySchema.parse(
    (await landedCiHistory(beforeCollection, undefined, historyMeasure.value))
      .body,
  );
  expect(pendingBefore.entries).toEqual(
    retainedMeasureGapCases.map((entry) =>
      expect.objectContaining({
        kind: "gap",
        reason: "pending",
        waitsFor: historyMeasure.value,
        revision: landings[entry.name].revision,
        runId: entry.runId,
        ...(entry.runId === 41 ? { runAttempt: 1 } : {}),
      }),
    ),
  );
  for (const entry of pendingBefore.entries) {
    if (entry.kind === "gap")
      expect(gapReasonWords(entry)).toBe(
        "Pending · CI time without runner waits not read yet",
      );
  }
  expect(
    measuredHistoryOf(pendingBefore)?.entries.every(
      (entry) => entry.kind === "gap",
    ),
  ).toBe(true);
  expect(
    measuredHistoryOf(
      landedCiHistorySchema.parse(
        (await landedCiHistory(beforeCollection)).body,
      ),
    )?.entries.filter((entry) => entry.kind === "point"),
  ).toEqual(
    retainedMeasureGapCases.map((entry) =>
      expect.objectContaining({
        revision: landings[entry.name].revision,
        wallTimeMs: 120_000,
      }),
    ),
  );
  await beforeCollection.close();

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
        kind: "point",
        revision: landings.supplied.revision,
        runId: 41,
        runAttempt: 1,
        timeMs: 120_000,
      }),
      expect.objectContaining({
        kind: "gap",
        reason: historyMeasure.value,
        revision: landings.invalid.revision,
        explanation: "Job “check” has no valid start and completion times.",
        build: expect.objectContaining({
          revision: landings.invalid.revision,
          provenance: "exact",
          runId: 42,
          runAttempt: 1,
        }),
      }),
      expect.objectContaining({
        kind: "gap",
        reason: "pending",
        waitsFor: historyMeasure.value,
        revision: landings.unread.revision,
        runId: 43,
      }),
    ]);
  expect([...new Set(jobsReads(github.calls))].sort()).toEqual([
    "41/1/1",
    "42/1/1",
    "43/1/1",
  ]);
  expect(jobsReads(github.calls).filter((read) => read === "41/1/1")).toEqual([
    "41/1/1",
  ]);
  expect(jobsReads(github.calls).filter((read) => read === "42/1/1")).toEqual([
    "42/1/1",
  ]);
  const afterFirst = github.calls.length;
  await expect
    .poll(() => jobsReads(github.calls.slice(afterFirst)))
    .toContain("43/1/1");
  expect(
    jobsReads(github.calls.slice(afterFirst)).every(
      (read) => read === "43/1/1",
    ),
  ).toBe(true);

  control.jobsReadable = true;
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
        kind: "point",
        revision: landings.supplied.revision,
        timeMs: 120_000,
      }),
      expect.objectContaining({
        kind: "gap",
        reason: historyMeasure.value,
        revision: landings.invalid.revision,
        explanation: "Job “check” has no valid start and completion times.",
      }),
      expect.objectContaining({
        kind: "point",
        revision: landings.unread.revision,
        timeMs: 120_000,
      }),
    ]);

  const reader = await restartAsLandedCiReader(server, origin, "boundary");
  try {
    const asked = github.calls.length;
    const finalGaps = landedCiHistorySchema
      .parse(
        (await landedCiHistory(reader, undefined, historyMeasure.value)).body,
      )
      .entries.filter(
        (entry): entry is FinalGap =>
          entry.kind === "gap" && entry.reason === historyMeasure.value,
      );
    expect(finalGaps).toEqual([
      expect.objectContaining({
        revision: landings.invalid.revision,
        explanation: "Job “check” has no valid start and completion times.",
        build: expect.objectContaining({ runId: 42, provenance: "exact" }),
      }),
    ]);
    const finalGap = finalGaps[0];
    expect(finalGap).toBeDefined();
    if (finalGap === undefined) throw new Error("Missing final measure gap");
    expect(gapReasonWords(finalGap)).toBe(
      "Job “check” has no valid start and completion times.",
    );
    expect(github.calls.length).toBe(asked);
  } finally {
    await reader.close();
  }
});
