// Actual Landed resolution and artifact acquisition through a local scoped read.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  collectedSummary,
  playwrightRecord,
  summaryTextZipAnswer,
} from "../../tests/support/ciProofCollected.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  collectingLandedCi,
  restartAsLandedCiReader,
  resultToLand,
} from "../../tests/support/landedCiHistory.ts";
import {
  retainedHistory,
  collectedScopeHistory,
} from "../../tests/support/collectedScopeHistory.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { land } from "../../tests/support/startSessionLandingContext.ts";
import { commonGitDir } from "../../tests/support/launchLanding.ts";
import { keepMoreLaunchRecords } from "../../tests/support/launchStore.ts";
import { publishSkippedPlanningLanding } from "../../tests/support/storyCiComparisonSkippedLandingFixture.ts";
import { git } from "../../tests/support/storyReviewWorktree.ts";

test.use({ serverMode: "boundary", extraEnv: collectingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});
const retainedProof = (home: string, key: string) =>
  retainedHistory(home)?.builds[key]?.proof;
const scopedHistory = (origin: string, revision: string) =>
  collectedScopeHistory(
    origin,
    "dashboard/tests",
    revision,
    "2026-11-05T14:00:00.000Z",
  );

test("an exact landing and a skipped landing share one collected attempt and retain each represented landing's role through the selected endpoint", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const setup = await publishSkippedPlanningLanding(page, origin);
  const recorded = [
    {
      revision: setup.trunkSide,
      receipt: "20000000-0000-4000-8000-000000000001",
      at: "2026-11-05T13:35:00.000Z",
    },
    {
      revision: setup.landingMerge,
      receipt: "20000000-0000-4000-8000-000000000002",
      at: "2026-11-05T14:00:00.000Z",
    },
  ];
  keepMoreLaunchRecords(
    dashboard,
    recorded.map(({ revision, receipt, at }) =>
      makeMe.aLaunchRecord
        .executing({ identity: setup.identity, title: "Story A" })
        .inClaudeSession({ sessionId: receipt })
        .launchedAt(at)
        .completedWith({ message: "", receivedAt: at })
        .markedDoneAt(at)
        .withCapturedLanding(
          makeMe.aLaunchLanding
            .capturedFrom({
              repository: commonGitDir(origin.project),
              identity: setup.identity,
            })
            .forLaunch(receipt)
            .deliveredAs({ delivery: receipt, receipt })
            .comparing({
              base: git(origin.project, "rev-parse", `${revision}^`),
              revision,
            })
            .receivedAt(at)
            .please(),
        )
        .please(),
    ),
  );
  const trigger = await resultToLand(
    dashboard,
    "trigger-shared-scope-proof.txt",
  );
  setup.serveRuns({
    [setup.trunkSide]: [
      makeMe.aCiRun
        .with({
          headSha: setup.trunkSide,
          id: 201,
          attempt: 1,
          conclusion: "success",
          url: "https://ci.invalid/runs/201",
          createdAt: "2026-11-05T13:30:00Z",
          startedAt: "2026-11-05T13:30:00Z",
          completedAt: "2026-11-05T13:35:00Z",
        })
        .please(),
    ],
    [setup.landingMerge]: [],
    [trigger.revision]: [],
  });
  const text = collectedSummary(
    {
      repository: "terryyin/open-dough",
      runId: 201,
      attempt: 1,
      revision: setup.trunkSide,
    },
    [{ entry: "dashboard/tests", parts: 1, unit: "case" }],
    [
      {
        entries: ["dashboard/tests"],
        part: 1,
        of: 1,
        byFile: true,
        record: playwrightRecord([
          ["dashboard/tests/a.spec.ts", "expected", [1200]],
        ]),
      },
    ],
  );
  setup.serveProofs({
    201: {
      kind: "summary",
      artifactId: 1201,
      summary: JSON.parse(text) as unknown,
    },
  });
  setup.interceptActions((argv) =>
    argv.some((argument) => argument.endsWith("/actions/artifacts/1201/zip"))
      ? summaryTextZipAnswer(text)
      : undefined,
  );
  expect(
    land(trigger.record, origin, dashboard.home).result.landing.receipt
      .revision,
  ).toBe(trigger.revision);
  await expect
    .poll(() => retainedProof(dashboard.home, "run/201/1"))
    .toMatchObject({
      kind: "summary",
      summary: {
        revision: setup.trunkSide,
        runId: 201,
        runAttempt: 1,
        entries: [
          {
            path: "dashboard/tests",
            evidence: [{ unit: "case", durationMs: 1200 }],
          },
        ],
      },
    });
  await expect
    .poll(() => scopedHistory(dashboard.origin, setup.landingMerge))
    .toMatchObject({
      status: 200,
      body: {
        selectedRevision: setup.landingMerge,
        availability: "retained",
        entries: [
          {
            kind: "point",
            readings: [{ kind: "point", unit: "case", ms: 1200 }],
            selected: true,
            date: "2026-11-05T13:30:00Z",
            build: {
              revision: setup.trunkSide,
              runId: 201,
              runAttempt: 1,
              provenance: "equivalent",
            },
            landings: [
              {
                revision: setup.trunkSide,
                provenance: "exact",
                selected: false,
              },
              {
                revision: setup.landingMerge,
                provenance: "equivalent",
                selected: true,
              },
            ],
          },
        ],
      },
    });
  const reader = await restartAsLandedCiReader(dashboard, origin, "boundary");
  readers.push(reader);
  const answer = await scopedHistory(reader.origin, setup.landingMerge);
  expect((answer.body as { entries: unknown[] }).entries).toHaveLength(1);
  expect(
    github.calls.filter(
      ({ request }) =>
        request.kind === "actions-artifact-zip" && request.artifactId === 1201,
    ),
  ).toHaveLength(1);
  const asked = github.calls.length;
  expect(await scopedHistory(reader.origin, setup.landingMerge)).toEqual(
    answer,
  );
  expect(github.calls.slice(asked)).toEqual([]);
});
