// Landed CI collection passes (../../server/landedCiPass.ts) and the history
// read (../../server/intentCiHistoryRead.ts), with no page, of landings whose
// measuring build is not final: a confirmed skip waits while the earlier
// build it rests on is running, and then is that build's reused equivalent
// point; a cancelled landing waits for a later trunk build while that build
// runs, and then joins its point; a CI adapter project's landing waits while
// its attempt is queued, and then is its exact point
// (SEED-285#see-landed-ci-wall-time-history examples 2, 5, 6 and 10). The
// exact landing's pending states are in ./landed-ci-history-pending.spec.ts;
// a CI adapter's discovery into these attempts in the adapter specs.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { ListedRun } from "../../server/baseCiNearest.ts";
import {
  historyEntries,
  landedCiPassInputs,
} from "../support/landedCiPassInputs.ts";

const running = { status: "in_progress", conclusion: null } as const;

test("a skip resting on a running build and a cancelled landing whose later trunk build runs are pending gaps that become that build's equivalent point and the later trunk build's point", async () => {
  const b = "1".repeat(40);
  const r = "2".repeat(40);
  const f = "3".repeat(40);
  const d6 = "4".repeat(40);
  const rAt = "2026-11-05T09:57:00.000Z";
  const fAt = "2026-11-05T09:58:00.000Z";
  const cancelled = makeMe.aRevisionCiRun
    .with({
      headSha: f,
      databaseId: 74,
      conclusion: "cancelled",
      startedAt: "2026-11-05T09:50:00Z",
      completedAt: "2026-11-05T09:51:00Z",
    })
    .please();
  let runs: readonly ListedRun[] = [
    makeMe.aRevisionCiRun
      .with({ headSha: b, databaseId: 70, ...running })
      .please(),
    cancelled,
    makeMe.aRevisionCiRun
      .with({ headSha: d6, databaseId: 76, ...running })
      .please(),
  ];
  const pass = landedCiPassInputs([b, r, f, d6], {
    runs: () => runs,
    records: () => [
      makeMe.aLaunchRecord
        .executing({ identity: "SEED-9#r", title: "r" })
        .launchedAt(rAt)
        .landedAt(r, { receipt: "eeeeeeee-0000-4000-8000-000000000001" })
        .please(),
      makeMe.aLaunchRecord
        .executing({ identity: "SEED-9#f", title: "f" })
        .launchedAt(fAt)
        .landedAt(f, { receipt: "eeeeeeee-0000-4000-8000-000000000002" })
        .please(),
    ],
    skips: [r],
    proofOf: (run) => makeMe.aCiProof.summaryFor(run).please(),
  });

  await pass.collect();
  expect(await historyEntries(pass.home)).toMatchObject([
    {
      kind: "gap",
      reason: "pending",
      waitsFor: "build",
      revision: r,
      runId: 70,
    },
    { kind: "gap", reason: "pending", waitsFor: "later-build", revision: f },
  ]);

  runs = [
    makeMe.aRevisionCiRun
      .with({
        headSha: b,
        databaseId: 70,
        startedAt: "2026-11-05T09:00:00Z",
        completedAt: "2026-11-05T09:05:00Z",
      })
      .please(),
    cancelled,
    makeMe.aRevisionCiRun
      .with({
        headSha: d6,
        databaseId: 76,
        startedAt: "2026-11-05T10:00:00Z",
        completedAt: "2026-11-05T10:07:10Z",
      })
      .please(),
  ];
  await pass.collect();
  expect(await historyEntries(pass.home)).toMatchObject([
    {
      kind: "point",
      revision: b,
      runId: 70,
      completedAt: "2026-11-05T09:05:00Z",
      landings: [{ revision: r, receivedAt: rAt, provenance: "equivalent" }],
    },
    {
      kind: "point",
      revision: d6,
      runId: 76,
      completedAt: "2026-11-05T10:07:10Z",
      landings: [{ revision: f, receivedAt: fAt, provenance: "later" }],
    },
  ]);
});

test("a CI adapter project's landing whose attempt is queued is a pending gap naming that attempt that becomes its exact point once the attempt passes", async () => {
  const p = "1".repeat(40);
  const adapterAttempt = { runId: "run-p7", attemptId: "attempt-p7" };
  const attempt = {
    headSha: p,
    adapterAttempt,
    url: "https://ci.invalid/builds/run-p7",
  };
  let run = makeMe.aRevisionCiRun
    .with({ ...attempt, status: "queued", conclusion: null })
    .please();
  const pass = landedCiPassInputs([p], {
    runs: () => [run],
    records: () => [
      makeMe.aLaunchRecord
        .executing({ identity: "SEED-9#p", title: "p" })
        .launchedAt("2026-11-05T09:59:00.000Z")
        .landedAt(p)
        .please(),
    ],
  });

  await pass.collect();
  expect(await historyEntries(pass.home)).toEqual([
    expect.objectContaining({
      kind: "gap",
      reason: "pending",
      waitsFor: "build",
      revision: p,
      runUrl: attempt.url,
      adapterAttempt,
    }),
  ]);

  run = makeMe.aRevisionCiRun
    .with({
      ...attempt,
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:06:05Z",
    })
    .please();
  await pass.collect();
  expect(await historyEntries(pass.home)).toMatchObject([
    {
      kind: "point",
      revision: p,
      runUrl: attempt.url,
      adapterAttempt,
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:06:05Z",
      landings: [{ revision: p, provenance: "exact" }],
    },
  ]);
});
