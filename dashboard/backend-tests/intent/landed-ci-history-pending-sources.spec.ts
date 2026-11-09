// Landed CI wall-time history collection (../../server/landedCiCollection.ts)
// of landings whose measuring build is not final, with no page open, a real
// bare origin (../../tests/support/startOrigin.ts) and the synthetic
// `claude`, each collecting server checking its pending landings again at a
// test's pace: a confirmed skip waits while the earlier build it rests on is
// running, and then is that build's reused equivalent point; a cancelled
// landing waits for a later trunk build while that build runs, and then joins
// its point; a CI adapter project's landing waits while its attempt is
// queued or running, and then is its exact point
// (SEED-285#see-landed-ci-wall-time-history examples 2, 5, 6 and 10). The
// exact landing's pending states are in ./landed-ci-history-pending.spec.ts.

import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { adapterProject } from "../../tests/intentCiAdapterProofProject.ts";
import type { CiRunAnswer } from "../../tests/support/baseCiActions.ts";
import {
  answeredLanding,
  landedCiHistory,
  minutesAgo,
  storyLandingRecord,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  passedBetween,
  publishCiWorkflow,
  publishedChange,
  publishedLanding,
  serveTrunkRuns,
  trunkRun,
  usableProofOf,
  type TrunkProofs,
} from "../../tests/support/landedCiTrunk.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

test("a skip resting on a running build and a cancelled landing whose later trunk build runs are pending gaps that become that build's reused equivalent point and later trunk build point once it completes", async ({
  origin,
  github,
  startServer,
}) => {
  const home = path.join(origin.machine, "home");
  await publishCiWorkflow(origin);
  const b = await publishedChange(origin, { title: "b", kind: "code" });
  // R changes planning only, resting on b's build.
  const r = await publishedLanding(origin, {
    title: "r",
    receipt: "eeeeeeee-0000-4000-8000-000000000001",
    at: minutesAgo(3),
    planningOnly: true,
  });
  // F's build is cancelled by the push of d6.
  const f = await publishedLanding(origin, {
    title: "f",
    receipt: "eeeeeeee-0000-4000-8000-000000000002",
    at: minutesAgo(2),
  });
  const d6 = await publishedChange(origin, { title: "d6", kind: "code" });
  const cancelled = trunkRun(f.revision, 74, {
    conclusion: "cancelled",
    createdAt: "2026-11-05T09:50:00Z",
    startedAt: "2026-11-05T09:50:00Z",
    completedAt: "2026-11-05T09:51:00Z",
  });
  // b and d6 still running.
  let runs: readonly CiRunAnswer[] = [
    trunkRun(b, 70, {
      status: "in_progress",
      createdAt: "2026-11-05T09:00:00Z",
    }),
    cancelled,
    trunkRun(d6, 76, {
      status: "in_progress",
      createdAt: "2026-11-05T10:00:00Z",
    }),
  ];
  let proofs: TrunkProofs = {};
  serveTrunkRuns(github, origin, () => runs, { proofs: () => proofs });
  keepLaunchRecords(home, [
    storyLandingRecord(r, "refinement"),
    storyLandingRecord(f, "execution"),
  ]);
  const server = await startServer();

  await expect
    .poll(() => landedCiHistory(server))
    .toEqual({
      status: 200,
      body: {
        entries: [
          {
            kind: "gap",
            reason: "pending",
            waitsFor: "build",
            ...answeredLanding(r),
            runUrl: "https://ci.invalid/runs/70",
            runId: 70,
            runAttempt: 1,
          },
          {
            kind: "gap",
            reason: "pending",
            waitsFor: "later-build",
            ...answeredLanding(f),
          },
        ],
      },
    });

  // b completes in 5 min and d6 in 7 min 10 s, each with its CI proof.
  const bBuilt = trunkRun(
    b,
    70,
    passedBetween("2026-11-05T09:00:00Z", "2026-11-05T09:05:00Z"),
  );
  const d6Built = trunkRun(
    d6,
    76,
    passedBetween("2026-11-05T10:00:00Z", "2026-11-05T10:07:10Z"),
  );
  proofs = { 70: usableProofOf(bBuilt), 76: usableProofOf(d6Built) };
  runs = [bBuilt, cancelled, d6Built];
  await expect
    .poll(() => landedCiHistory(server))
    .toEqual({
      status: 200,
      body: {
        entries: [
          {
            kind: "point",
            revision: b,
            runUrl: "https://ci.invalid/runs/70",
            runId: 70,
            runAttempt: 1,
            startedAt: "2026-11-05T09:00:00Z",
            completedAt: "2026-11-05T09:05:00Z",
            landings: [{ ...answeredLanding(r), provenance: "equivalent" }],
          },
          {
            kind: "point",
            revision: d6,
            runUrl: "https://ci.invalid/runs/76",
            runId: 76,
            runAttempt: 1,
            startedAt: "2026-11-05T10:00:00Z",
            completedAt: "2026-11-05T10:07:10Z",
            landings: [{ ...answeredLanding(f), provenance: "later" }],
          },
        ],
      },
    });
});

test("a CI adapter project's landing whose attempt is queued or running is a pending gap that becomes its exact point once the attempt passes", async ({
  origin,
  github,
  startServer,
}) => {
  const home = path.join(origin.machine, "home");
  const p = await publishedLanding(origin, {
    title: "p",
    receipt: "eeeeeeee-0000-4000-8000-000000000003",
    at: minutesAgo(1),
  });
  // The project's CI is read through its adapter from here on.
  const adapter = adapterProject(home);
  const attempt = {
    sha: p.revision,
    runId: "run-p7",
    attemptId: "attempt-p7",
    branch: "main",
  };
  const noProof = { unavailable: "no summary retained for this attempt" };
  adapter.answer({
    discover: {
      main: [
        makeMe.aCiAdapterAttempt
          .pending({ ...attempt, time: "2026-11-05T10:00:00Z" })
          .please(),
      ],
    },
    proof: noProof,
  });
  keepLaunchRecords(home, [storyLandingRecord(p, "execution")]);
  const server = await startServer();
  const landing = answeredLanding(p);
  const adapterAttempt = { runId: "run-p7", attemptId: "attempt-p7" };

  await expect
    .poll(() => landedCiHistory(server))
    .toEqual({
      status: 200,
      body: {
        entries: [
          {
            kind: "gap",
            reason: "pending",
            waitsFor: "build",
            ...landing,
            runUrl: "https://ci.invalid/builds/run-p7",
            adapterAttempt,
          },
        ],
      },
    });

  // The attempt passes in 6 min 5 s.
  adapter.answer({
    discover: {
      main: [
        makeMe.aCiAdapterAttempt
          .passed({
            ...attempt,
            startedAt: "2026-11-05T10:00:00Z",
            completedAt: "2026-11-05T10:06:05Z",
          })
          .please(),
      ],
    },
    proof: noProof,
  });
  await expect
    .poll(() => landedCiHistory(server))
    .toEqual({
      status: 200,
      body: {
        entries: [
          {
            kind: "point",
            revision: p.revision,
            runUrl: "https://ci.invalid/builds/run-p7",
            adapterAttempt,
            startedAt: "2026-11-05T10:00:00Z",
            completedAt: "2026-11-05T10:06:05Z",
            landings: [{ ...landing, provenance: "exact" }],
          },
        ],
      },
    });
  expect(
    github.calls.filter(({ request }) => request.kind.startsWith("actions-")),
  ).toEqual([]);
});
