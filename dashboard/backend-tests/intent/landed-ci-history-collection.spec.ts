// Landed CI wall-time history collection (../../server/landedCiCollection.ts)
// and its read (`intent=ci-history`, ../../server/intentCiHistoryRead.ts),
// with no page open, a real bare origin (../../tests/support/startOrigin.ts),
// the installed publication and the synthetic `claude`: once a production
// dashboard records a story execution's accepted landing, it collects the
// landed revision's completed trunk build through the CI timing comparison's
// Landed rule, and the history read answers that build as an exact point of
// its CI wall time from the collected history alone, asking CI nothing
// (SEED-285#see-landed-ci-wall-time-history example 1). A test server
// collects only when its test asks. How Project Intent shows the history is
// in ../../tests/intent/intent-ci-wall-time-history.spec.ts.

import { existsSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { GhCall } from "../../tests/support/fakeGitHub.ts";
import { capturedPublicationSchema } from "../../tests/support/launchLanding.ts";
import {
  collectingLandedCi,
  landedCiHistory,
  resultToLand,
  serveTrunkRuns,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { land } from "../../tests/support/startSessionLandingContext.ts";
import { claimedLaunchWithStoryCommit } from "../../tests/support/storyBranchIntegration.ts";

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

  test("collects a story execution's recorded landing's exact successful trunk build with no page open, and its history read answers that build as an exact point of its CI wall time, asking CI nothing", async ({
    dashboard,
    origin,
    github,
  }) => {
    const execution = await claimedLaunchWithStoryCommit(origin, dashboard);
    // Trunk's build of whatever main is, from 10:00 to 10:06:05.
    serveTrunkRuns(github, origin, (main) => [
      makeMe.aCiRun
        .with({
          headSha: main,
          id: 41,
          attempt: 1,
          conclusion: "success",
          url: "https://ci.invalid/runs/41",
          createdAt: "2026-11-05T10:00:00Z",
          startedAt: "2026-11-05T10:00:00Z",
          completedAt: "2026-11-05T10:06:05Z",
        })
        .please(),
    ]);
    expect(await landedCiHistory(dashboard)).toEqual({
      status: 200,
      body: { entries: [] },
    });

    const { landing } = capturedPublicationSchema.parse(
      await execution.integrated(),
    );
    const { revision, identity } = landing.receipt;
    expect(identity).toBe(execution.identity);

    // One exact point whose CI wall time, from its attempt's start to its
    // completion, is 6 min 5 s.
    await expect
      .poll(() => landedCiHistory(dashboard))
      .toEqual({
        status: 200,
        body: {
          entries: [
            {
              kind: "point",
              revision,
              provenance: "exact",
              runUrl: "https://ci.invalid/runs/41",
              runId: 41,
              runAttempt: 1,
              startedAt: "2026-11-05T10:00:00Z",
              completedAt: "2026-11-05T10:06:05Z",
            },
          ],
        },
      });
    expect(runsListedAt(github.calls, revision)).toHaveLength(1);

    // Reading the history again asks CI nothing.
    const asked = github.calls.length;
    expect(await landedCiHistory(dashboard)).toMatchObject({
      status: 200,
      body: { entries: [{ kind: "point", revision }] },
    });
    expect(github.calls.slice(asked)).toEqual([]);
  });
});

test("a test server records a landing and collects nothing of its own accord, while its history read answers no point", async ({
  dashboard,
  origin,
  github,
}) => {
  const { record, revision } = await resultToLand(dashboard, "landed.txt");
  serveTrunkRuns(github, origin, () => [
    makeMe.aCiRun
      .with({
        headSha: revision,
        id: 41,
        attempt: 1,
        conclusion: "success",
        url: "https://ci.invalid/runs/41",
        createdAt: "2026-11-05T10:00:00Z",
        startedAt: "2026-11-05T10:00:00Z",
        completedAt: "2026-11-05T10:06:05Z",
      })
      .please(),
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
