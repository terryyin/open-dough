// Actual adapter acquisition keeps contextual attempts distinct and true repeats shared.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { adapterProject } from "../../tests/intentCiAdapterProofProject.ts";
import { proofSummaryForEntry } from "../../tests/support/ciProofArtifacts.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  collectingLandedCi,
  restartAsLandedCiReader,
  resultToLand,
} from "../../tests/support/landedCiHistory.ts";
import {
  retainedHistory as retained,
  collectedScopeHistory,
} from "../../tests/support/collectedScopeHistory.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { land } from "../../tests/support/startSessionLandingContext.ts";
import { commonGitDir } from "../../tests/support/launchLanding.ts";
import { keepMoreLaunchRecords } from "../../tests/support/launchStore.ts";
import { git } from "../../tests/support/storyReviewWorktree.ts";

test.use({ serverMode: "boundary", extraEnv: collectingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});
const scopedHistory = (origin: string, revision: string, through: string) =>
  collectedScopeHistory(origin, "tests", revision, through);

test("one true adapter attempt shared by two exact landing receipts contributes one collected scope point", async ({
  dashboard,
  origin,
  github,
}) => {
  const revision = await origin.publishRevision({
    message: "Publish the shared adapter build revision",
    files: { "src/shared-adapter-build.txt": "one actual adapter build\n" },
  });
  const identity = "SEED-9#shared-adapter-attempt";
  const recorded = [
    {
      revision,
      receipt: "40000000-0000-4000-8000-000000000001",
      at: "2026-11-05T13:35:00.000Z",
    },
    {
      revision,
      receipt: "40000000-0000-4000-8000-000000000002",
      at: "2026-11-05T14:00:00.000Z",
    },
  ];
  keepMoreLaunchRecords(
    dashboard,
    recorded.map(({ revision, receipt, at }) =>
      makeMe.aLaunchRecord
        .executing({ identity, title: "Shared adapter attempt" })
        .inClaudeSession({ sessionId: receipt })
        .launchedAt(at)
        .completedWith({ message: "", receivedAt: at })
        .markedDoneAt(at)
        .withCapturedLanding(
          makeMe.aLaunchLanding
            .capturedFrom({
              repository: commonGitDir(origin.project),
              identity,
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
    "trigger-shared-adapter-scope.txt",
  );
  const adapter = adapterProject(dashboard.home);
  const attemptId = "shared-attempt+#";
  const attempt = makeMe.aCiAdapterAttempt
    .passed({
      runId: "shared-run",
      attemptId,
      sha: revision,
      branch: "main",
      startedAt: "2026-11-05T13:30:00Z",
      completedAt: "2026-11-05T13:35:00Z",
    })
    .please();
  const entry = makeMe.aCiProofEntry
    .at("tests")
    .counting(3, "case")
    .timed(1200)
    .please();
  const summary = proofSummaryForEntry(
    { repository: "terryyin/open-dough", attemptId, revision },
    entry,
  );
  adapter.answer({ discover: { main: [attempt] }, proof: { summary } });
  expect(
    land(trigger.record, origin, dashboard.home).result.landing.receipt
      .revision,
  ).toBe(trigger.revision);
  await expect
    .poll(() => Object.values(retained(dashboard.home)?.builds ?? {}))
    .toContainEqual(
      expect.objectContaining({
        revision,
        adapterAttempt: { runId: "shared-run", attemptId },
        proof: {
          kind: "summary",
          summary: expect.objectContaining({
            revision,
            entries: [
              expect.objectContaining({
                path: "tests",
                evidence: [
                  expect.objectContaining({ unit: "case", durationMs: 1200 }),
                ],
              }),
            ],
          }),
        },
      }),
    );
  await expect
    .poll(() =>
      recorded.map(
        ({ receipt }) => retained(dashboard.home)?.landings[receipt]?.observed,
      ),
    )
    .toEqual([
      { kind: "build", build: expect.any(String), selection: "exact" },
      { kind: "build", build: expect.any(String), selection: "exact" },
    ]);
  const represented = recorded.map(
    ({ receipt }) => retained(dashboard.home)?.landings[receipt]?.observed,
  );
  expect(represented[0]).toHaveProperty(
    "build",
    (represented[1] as { build: string }).build,
  );
  expect(Object.values(retained(dashboard.home)?.builds ?? {})).toHaveLength(1);
  const reader = await restartAsLandedCiReader(dashboard, origin, "boundary");
  readers.push(reader);

  expect(adapter.proofRequests()).toEqual([
    {
      operation: "proof",
      check: { repo: "terryyin/open-dough", branch: "main" },
      attempt: { runId: "shared-run", attemptId, sha: revision },
    },
  ]);
  const proofRequests = adapter.proofRequests();
  const discoverRequests = adapter.discoverRequests();
  const githubCalls = github.calls.length;
  const answer = await scopedHistory(
    reader.origin,
    revision,
    "2026-11-05T14:00:00.000Z",
  );
  expect(answer).toMatchObject({
    status: 200,
    body: {
      selectedRevision: revision,
      availability: "retained",
      entries: [
        {
          kind: "point",
          readings: [{ kind: "point", unit: "case", ms: 1200 }],
          selected: true,
          build: {
            revision,
            adapterAttempt: { runId: "shared-run", attemptId },
            provenance: "exact",
          },
          landings: expect.arrayContaining([
            expect.objectContaining({
              revision,
              receivedAt: "2026-11-05T13:35:00.000Z",
              selected: true,
              provenance: "exact",
            }),
            expect.objectContaining({
              revision,
              receivedAt: "2026-11-05T14:00:00.000Z",
              selected: true,
              provenance: "exact",
            }),
          ]),
        },
      ],
    },
  });
  const entries = (answer.body as { entries: { landings: unknown[] }[] })
    .entries;
  expect(entries).toHaveLength(1);
  expect(entries[0]?.landings).toHaveLength(2);
  expect(
    await scopedHistory(reader.origin, revision, "2026-11-05T14:00:00.000Z"),
  ).toEqual(answer);
  expect(adapter.proofRequests()).toEqual(proofRequests);
  expect(adapter.discoverRequests()).toEqual(discoverRequests);
  expect(github.calls).toHaveLength(githubCalls);
});
