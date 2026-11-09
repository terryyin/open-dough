// Real read/memory recovery and CI/walk finality without a receipt clock.
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { readLandedComparison } from "../../tests/support/pendingLandedComparison.ts";
import { missingLandedRun } from "../../tests/support/missingLandedRun.ts";
import {
  serveTrunkRuns,
  trunkRun,
  passedFrom,
} from "../../tests/support/landedCiTrunk.ts";
import {
  commitAll,
  git,
  writeAt,
} from "../../tests/support/storyReviewWorktree.ts";
import { push } from "../../tests/support/storyReviewTrunkCommits.ts";
import type { CiRunAnswer } from "../../tests/support/baseCiActions.ts";

test.use({ serverMode: "boundary" });

test("a published-only landing recovers no run, queued, running and exact completion in one reader, then remembers its answer", async ({
  origin,
  github,
  startServer,
}) => {
  const setup = await missingLandedRun(origin);
  let runs: readonly CiRunAnswer[] = setup.runs;
  serveTrunkRuns(github, origin, () => runs, { proofs: () => setup.proofs });
  const server = await startServer({
    environment: "development",
    observationClock: true,
  });
  // Completion and commit dates have passed by hours, but do not prove the
  // missing receipt's hour expired. Repeated reads cannot start a new age.
  server.setObservationClock(
    new Date(Date.now() + 3 * 3_600_000).toISOString(),
  );
  const absent = await readLandedComparison(server, setup.identity);
  expect(absent.landed).toMatchObject({
    kind: "none",
    requestedStatus: { kind: "no-build" },
  });
  expect(absent.landed).not.toHaveProperty("timeWithoutRunnerWaits");
  const initial = github.calls.length;
  await readLandedComparison(server, setup.identity);
  expect(github.calls.length).toBeGreaterThan(initial);
  for (const status of ["queued", "in_progress"] as const) {
    runs = [
      ...setup.runs,
      trunkRun(setup.landingMerge, 103, {
        status,
        createdAt: "2026-11-05T14:00:00Z",
      }),
    ];
    expect(
      (await readLandedComparison(server, setup.identity)).landed,
    ).toMatchObject({
      kind: "running",
      revision: setup.landingMerge,
      runId: 103,
    });
  }
  runs = [...setup.runs, setup.exact];
  const final = await readLandedComparison(server, setup.identity);
  expect(final.landed).toMatchObject({
    kind: "build",
    selection: "exact",
    revision: setup.landingMerge,
    runId: 103,
    runAttempt: 1,
    startedAt: "2026-11-05T14:00:00Z",
    completedAt: "2026-11-05T14:04:00.000Z",
  });
  expect(final.branch).toMatchObject({
    kind: "build",
    revision: setup.branchSide,
  });
  const answered = github.calls.length;
  expect(await readLandedComparison(server, setup.identity)).toEqual(final);
  expect(github.calls.length).toBe(answered);
});

for (const bound of ["later run", "walk limit"] as const) {
  test(`unknown receipt age is final when CI reaches the ${bound}, without selecting a later build`, async ({
    origin,
    github,
    startServer,
  }) => {
    const setup = await missingLandedRun(origin);
    if (bound === "walk limit") {
      for (let index = 0; index < 31; index += 1) {
        writeAt(
          origin.project,
          `.planning/bound-${String(index)}.md`,
          "later\n",
        );
        commitAll(origin.project, "advance no-run wait to first-parent bound");
      }
      push(origin.project);
    }
    const later = git(origin.origin, "rev-parse", "main");
    const runs =
      bound === "later run"
        ? [
            ...setup.runs,
            trunkRun(later, 299, passedFrom("2026-11-05T15:00:00Z", 60_000)),
          ]
        : setup.runs;
    serveTrunkRuns(github, origin, () => runs, { proofs: () => setup.proofs });
    const server = await startServer({ environment: "development" });
    const final = await readLandedComparison(server, setup.identity);
    expect(final.landed).toMatchObject({
      kind: "none",
      requestedStatus: { kind: "no-build" },
    });
    expect(final.landed).not.toHaveProperty("revision");
    const asked = github.calls.length;
    expect(await readLandedComparison(server, setup.identity)).toEqual(final);
    expect(github.calls.length).toBe(asked);
  });
}
