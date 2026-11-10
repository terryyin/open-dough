// Actual adapter acquisition keeps contextual attempts distinct and true repeats shared.
import { makeMe } from "../../../tests/support/makeMe.mjs";
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

test.use({ serverMode: "boundary", extraEnv: collectingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});
const scopedHistory = (origin: string, revision: string, through: string) =>
  collectedScopeHistory(origin, "tests", revision, through);

test("different adapter runs reusing an opaque attempt ID retain their own collected proof and exact scope points", async ({
  dashboard,
  origin,
  github,
}) => {
  const first = await resultToLand(dashboard, "first-adapter-identity.txt");
  const adapter = adapterProject(dashboard.home);
  const attemptId = "opaque-attempt+#";
  const firstAttempt = makeMe.aCiAdapterAttempt
    .passed({
      runId: "run-a",
      attemptId,
      sha: first.revision,
      branch: "main",
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:01:00Z",
    })
    .please();
  const firstEntry = makeMe.aCiProofEntry
    .at("tests")
    .counting(3, "case")
    .timed(1200)
    .please();
  const firstSummary = proofSummaryForEntry(
    { repository: "terryyin/open-dough", attemptId, revision: first.revision },
    firstEntry,
  );
  adapter.answer({
    discover: { main: [firstAttempt] },
    proof: { summary: firstSummary },
  });
  const firstReceipt = land(first.record, origin, dashboard.home).result.landing
    .receipt;
  expect(firstReceipt.revision).toBe(first.revision);
  await expect
    .poll(() => Object.values(retained(dashboard.home)?.builds ?? {}))
    .toEqual([
      expect.objectContaining({
        revision: first.revision,
        adapterAttempt: { runId: "run-a", attemptId },
        proof: {
          kind: "summary",
          summary: expect.objectContaining({
            revision: first.revision,
            attemptId,
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
    ]);
  const firstRequests = adapter.proofRequests();
  expect(firstRequests).toEqual([
    {
      operation: "proof",
      check: { repo: "terryyin/open-dough", branch: "main" },
      attempt: { runId: "run-a", attemptId, sha: first.revision },
    },
  ]);

  // The fixture answers the second subject only after the first was acquired.
  // Its same opaque attempt ID names another valid run at another revision.
  const second = await resultToLand(dashboard, "second-adapter-identity.txt");
  const secondAttempt = makeMe.aCiAdapterAttempt
    .passed({
      runId: "run-b",
      attemptId,
      sha: second.revision,
      branch: "main",
      startedAt: "2026-11-06T10:00:00Z",
      completedAt: "2026-11-06T10:01:00Z",
    })
    .please();
  const secondEntry = makeMe.aCiProofEntry
    .at("tests")
    .counting(4, "case")
    .timed(3400)
    .please();
  const secondSummary = proofSummaryForEntry(
    { repository: "terryyin/open-dough", attemptId, revision: second.revision },
    secondEntry,
  );
  adapter.answer({
    discover: { main: [secondAttempt, firstAttempt] },
    proof: { summary: secondSummary },
  });
  const secondReceipt = land(second.record, origin, dashboard.home).result
    .landing.receipt;
  expect(secondReceipt.revision).toBe(second.revision);
  await expect
    .poll(
      () =>
        retained(dashboard.home)?.landings[secondReceipt.receipt]?.observed
          .kind,
    )
    .toBe("build");
  await expect
    .poll(() => adapter.proofRequests())
    .toEqual([
      ...firstRequests,
      {
        operation: "proof",
        check: { repo: "terryyin/open-dough", branch: "main" },
        attempt: { runId: "run-b", attemptId, sha: second.revision },
      },
    ]);
  await expect
    .poll(() => Object.values(retained(dashboard.home)?.builds ?? {}))
    .toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          revision: first.revision,
          adapterAttempt: { runId: "run-a", attemptId },
          proof: {
            kind: "summary",
            summary: expect.objectContaining({
              revision: first.revision,
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
        expect.objectContaining({
          revision: second.revision,
          adapterAttempt: { runId: "run-b", attemptId },
          proof: {
            kind: "summary",
            summary: expect.objectContaining({
              revision: second.revision,
              entries: [
                expect.objectContaining({
                  path: "tests",
                  evidence: [
                    expect.objectContaining({ unit: "case", durationMs: 3400 }),
                  ],
                }),
              ],
            }),
          },
        }),
      ]),
    );
  expect(Object.values(retained(dashboard.home)?.builds ?? {})).toHaveLength(2);
  const reader = await restartAsLandedCiReader(dashboard, origin, "boundary");
  readers.push(reader);

  const proofRequests = adapter.proofRequests();
  const discoverRequests = adapter.discoverRequests();
  const githubCalls = github.calls.length;
  const answer = await scopedHistory(
    reader.origin,
    second.revision,
    secondReceipt.receivedAt,
  );
  expect(answer).toMatchObject({
    status: 200,
    body: {
      selectedRevision: second.revision,
      availability: "retained",
      entries: [
        {
          kind: "point",
          readings: [{ kind: "point", unit: "case", ms: 1200 }],
          selected: false,
          date: "2026-11-05T10:00:00Z",
          build: {
            revision: first.revision,
            adapterAttempt: { runId: "run-a", attemptId },
            provenance: "exact",
          },
          landings: [
            { revision: first.revision, selected: false, provenance: "exact" },
          ],
        },
        {
          kind: "point",
          readings: [{ kind: "point", unit: "case", ms: 3400 }],
          selected: true,
          date: "2026-11-06T10:00:00Z",
          build: {
            revision: second.revision,
            adapterAttempt: { runId: "run-b", attemptId },
            provenance: "exact",
          },
          landings: [
            { revision: second.revision, selected: true, provenance: "exact" },
          ],
        },
      ],
    },
  });
  const entries = (answer.body as { entries: { key: string }[] }).entries;
  expect(entries).toHaveLength(2);
  expect(new Set(entries.map(({ key }) => key)).size).toBe(2);
  expect(
    await scopedHistory(
      reader.origin,
      second.revision,
      secondReceipt.receivedAt,
    ),
  ).toEqual(answer);
  expect(adapter.proofRequests()).toEqual(proofRequests);
  expect(adapter.discoverRequests()).toEqual(discoverRequests);
  expect(github.calls).toHaveLength(githubCalls);
});
