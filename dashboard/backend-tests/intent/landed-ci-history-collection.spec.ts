// Landed CI wall-time history collection (../../server/landedCiCollection.ts)
// and its read (`intent=ci-history`, ../../server/intentCiHistoryRead.ts),
// with no page open, a real bare origin (../../tests/support/startOrigin.ts),
// the installed publication and the synthetic `claude`: once a production
// dashboard records an accepted landing the publication reports, it collects
// the landed revision's completed trunk build through the CI timing
// comparison's Landed rule, nudged by that report, and the history read
// answers that build as a point of its CI wall time naming the landing it
// measures exactly, from the collected history alone, asking CI nothing
// (SEED-285#see-landed-ci-wall-time-history example 1). A test server
// collects only when its test asks. Landings of every workflow, a story
// execution's among them, are collected in
// ./landed-ci-history-lifecycle.spec.ts and the specs beside it; how Project
// Intent shows the history is in
// ../../tests/intent/intent-ci-wall-time-history.spec.ts.

import { existsSync } from "node:fs";
import path from "node:path";
import type { GhCall } from "../../tests/support/fakeGitHub.ts";
import {
  collectingLandedCi,
  landedCiHistory,
  restartAsLandedCiReader,
  resultToLand,
} from "../../tests/support/landedCiHistory.ts";
import {
  passedBetween,
  serveTrunkRuns,
  trunkRun,
} from "../../tests/support/landedCiTrunk.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { land } from "../../tests/support/startSessionLandingContext.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

// The CI asks that list a revision's runs, as collecting a landing makes.
const runsListedAt = (calls: readonly GhCall[], revision: string) =>
  calls.filter(
    ({ request }) =>
      request.kind === "actions-runs" && request.headSha === revision,
  );

test.describe("a server that collects", () => {
  test.use({ extraEnv: collectingLandedCi });

  test("collects an accepted landing's exact successful trunk build once the publication reports it, with no page open, and its history read answers that build as a point of its CI wall time naming that landing, asking CI nothing", async ({
    dashboard,
    origin,
    github,
  }) => {
    const { record, revision } = await resultToLand(dashboard, "landed.txt");
    // The landed revision's trunk build, from 10:00 to 10:06:05.
    serveTrunkRuns(github, origin, () => [
      trunkRun(
        revision,
        41,
        passedBetween("2026-11-05T10:00:00Z", "2026-11-05T10:06:05Z"),
      ),
    ]);
    expect(await landedCiHistory(dashboard)).toEqual({
      status: 200,
      body: { entries: [] },
    });

    // The installed publication lands it and reports the accepted landing
    // to the dashboard, which records it and collects at once: this server
    // checks its landings again only every few minutes.
    const { receipt } = land(record, origin, dashboard.home).result.landing;
    expect(receipt).toMatchObject({ revision });

    // One point whose CI wall time, from its attempt's start to its
    // completion, is 6 min 5 s, naming the landing it measures exactly.
    await expect
      .poll(() => landedCiHistory(dashboard))
      .toEqual({
        status: 200,
        body: {
          entries: [
            {
              kind: "point",
              revision,
              runUrl: "https://ci.invalid/runs/41",
              runId: 41,
              runAttempt: 1,
              startedAt: "2026-11-05T10:00:00Z",
              completedAt: "2026-11-05T10:06:05Z",
              landings: [
                {
                  revision,
                  receivedAt: receipt.receivedAt,
                  provenance: "exact",
                },
              ],
            },
          ],
        },
      });
    expect(runsListedAt(github.calls, revision)).toHaveLength(1);
    // Retention keeps the first proof ask with the measured point, so a
    // history reader never observes that point while the ask is outstanding.
    expect(
      github.calls.filter(
        ({ request }) => request.kind === "actions-run-artifacts",
      ),
    ).toHaveLength(1);

    // The point is kept before collection reads its proof. Stop collection
    // before counting the reader's calls, so that work cannot race the read.
    const reader = await restartAsLandedCiReader(dashboard, origin, "boundary");
    try {
      const asked = github.calls.length;
      expect(await landedCiHistory(reader)).toMatchObject({
        status: 200,
        body: { entries: [{ kind: "point", revision }] },
      });
      expect(github.calls.slice(asked)).toEqual([]);
    } finally {
      await reader.close();
    }
  });
});

test("a test server records a landing and collects nothing of its own accord, while its history read answers no point", async ({
  dashboard,
  origin,
  github,
}) => {
  const { record, revision } = await resultToLand(dashboard, "landed.txt");
  serveTrunkRuns(github, origin, () => [
    trunkRun(
      revision,
      41,
      passedBetween("2026-11-05T10:00:00Z", "2026-11-05T10:06:05Z"),
    ),
  ]);

  const delivered = land(record, origin, dashboard.home).result;

  expect(delivered.landing.receipt).toMatchObject({ revision });
  expect(await landedCiHistory(dashboard)).toEqual({
    status: 200,
    body: { entries: [] },
  });
  expect(runsListedAt(github.calls, revision)).toEqual([]);
  expect(
    existsSync(
      path.join(dashboard.home, ".open-dough/dashboard/landed-ci-history.json"),
    ),
  ).toBe(false);
});
