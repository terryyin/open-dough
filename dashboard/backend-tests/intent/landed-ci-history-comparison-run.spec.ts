// Matching facts through both actual entry points: collection's persisted
// observations and comparison's production read/memory, with no page open.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  keptLandedCiHistory,
  landedCiHistory,
  observedKinds,
} from "../../tests/support/landedCiHistory.ts";
import {
  capturedComparisonLanding,
  missingLandedRun,
} from "../../tests/support/missingLandedRun.ts";
import { readLandedComparison } from "../../tests/support/pendingLandedComparison.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { serveTrunkRuns, trunkRun } from "../../tests/support/landedCiTrunk.ts";
import type { CiRunAnswer } from "../../tests/support/baseCiActions.ts";

test.use({ serverMode: "boundary" });

test("matching capture makes history and comparison wait for no run and queued run, then agree on the completed exact build", async ({
  origin,
  github,
  startServer,
}) => {
  const setup = await missingLandedRun(origin);
  const home = path.join(origin.machine, "home");
  const landing = capturedComparisonLanding(setup, new Date().toISOString());
  keepLaunchRecords(home, [
    makeMe.aLaunchRecord
      .executing({ identity: setup.identity, title: "Story A" })
      .withCapturedLanding(landing)
      .please(),
  ]);
  let runs: readonly CiRunAnswer[] = setup.runs;
  serveTrunkRuns(github, origin, () => runs, { proofs: () => setup.proofs });
  const server = await startServer();
  await expect
    .poll(() => landedCiHistory(server))
    .toMatchObject({
      body: {
        entries: [
          {
            kind: "gap",
            reason: "pending",
            waitsFor: "run",
            revision: setup.landingMerge,
          },
        ],
      },
    });
  expect(
    (await readLandedComparison(server, setup.identity)).landed,
  ).toMatchObject({ kind: "none", requestedStatus: { kind: "no-build" } });
  runs = [
    ...setup.runs,
    trunkRun(setup.landingMerge, 103, {
      status: "queued",
      createdAt: "2026-11-05T14:00:00Z",
    }),
  ];
  await expect
    .poll(() => landedCiHistory(server))
    .toMatchObject({
      body: {
        entries: [
          {
            kind: "gap",
            reason: "pending",
            waitsFor: "build",
            revision: setup.landingMerge,
            runId: 103,
          },
        ],
      },
    });
  expect(
    (await readLandedComparison(server, setup.identity)).landed,
  ).toMatchObject({
    kind: "running",
    revision: setup.landingMerge,
    runId: 103,
  });
  runs = [...setup.runs, setup.exact];
  await expect
    .poll(() => landedCiHistory(server))
    .toMatchObject({
      body: {
        entries: [
          {
            kind: "point",
            revision: setup.landingMerge,
            runId: 103,
            runAttempt: 1,
            landings: [{ revision: setup.landingMerge, provenance: "exact" }],
          },
        ],
      },
    });
  const final = await readLandedComparison(server, setup.identity);
  expect(final.landed).toMatchObject({
    kind: "build",
    selection: "exact",
    revision: setup.landingMerge,
    runId: 103,
    runAttempt: 1,
  });
  const requests = github.calls.length;
  expect(await readLandedComparison(server, setup.identity)).toEqual(final);
  expect(github.calls.length).toBe(requests);
});

test("collection retains the actual target and receipt after launch disappearance, and both readers settle at its original hour", async ({
  origin,
  github,
  startServer,
}) => {
  const setup = await missingLandedRun(origin);
  const home = path.join(origin.machine, "home");
  const at = new Date().toISOString();
  const landing = capturedComparisonLanding(setup, at);
  keepLaunchRecords(home, [
    makeMe.aLaunchRecord
      .executing({ identity: setup.identity, title: "Story A" })
      .withCapturedLanding(landing)
      .please(),
  ]);
  serveTrunkRuns(github, origin, () => setup.runs, {
    proofs: () => setup.proofs,
  });
  const server = await startServer({ observationClock: true });
  server.setObservationClock(
    new Date(Date.parse(at) + 3_600_000 - 1).toISOString(),
  );
  await expect
    .poll(() => keptLandedCiHistory(home).landings[landing.receipt])
    .toMatchObject({
      revision: setup.landingMerge,
      receivedAt: at,
      target: "refs/heads/main",
      identity: setup.identity,
      observed: { kind: "pending", waitsFor: "run" },
    });
  expect((await readLandedComparison(server, setup.identity)).landed.kind).toBe(
    "none",
  );
  keepLaunchRecords(home, []);
  // Fixed and advanced clock controls compose: this is exactly the deadline.
  server.advanceObservationClock(1);
  const final = await readLandedComparison(server, setup.identity);
  expect(final.landed).toMatchObject({
    kind: "none",
    requestedStatus: { kind: "no-build" },
  });
  await expect
    .poll(() => observedKinds(keptLandedCiHistory(home)))
    .toEqual({ [landing.receipt]: "gap" });
  expect(await landedCiHistory(server)).toMatchObject({
    body: {
      entries: [
        {
          kind: "gap",
          reason: "no-build",
          revision: setup.landingMerge,
          receivedAt: at,
        },
      ],
    },
  });
  const requests = github.calls.length;
  expect(await readLandedComparison(server, setup.identity)).toEqual(final);
  expect(github.calls.length).toBe(requests);
});
