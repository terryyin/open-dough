// The adapter's two declared units stay separate on one collected attempt.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { adapterProject } from "../../tests/intentCiAdapterProofProject.ts";
import { proofSummaryForEntry } from "../../tests/support/ciProofArtifacts.ts";
import {
  collectedScopeHistory,
  retainedHistory,
} from "../../tests/support/collectedScopeHistory.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  collectingLandedCi,
  landedCiHistory,
  restartAsLandedCiReader,
  resultToLand,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { land } from "../../tests/support/startSessionLandingContext.ts";

test.use({ serverMode: "boundary", extraEnv: collectingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});

test("retains and reads independent case and file timings from one validated adapter attempt with Intent closed", async ({
  dashboard,
  origin,
  github,
}) => {
  const { record, revision } = await resultToLand(
    dashboard,
    "adapter-proof.txt",
  );
  const adapter = adapterProject(dashboard.home);
  const attempt = makeMe.aCiAdapterAttempt
    .passed({
      runId: "run-a",
      attemptId: "attempt-a",
      sha: revision,
      branch: "main",
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:02:00Z",
    })
    .please();
  const entry = makeMe.aCiProofEntry
    .at("tests")
    .holding(
      makeMe.aCiProofEvidence
        .legacy("test cases")
        .counting(9)
        .timed(9100)
        .please(),
      makeMe.aCiProofEvidence.inUnit("case").counting(3).timed(1200).please(),
      makeMe.aCiProofEvidence.inUnit("file").counting(1).timed(80).please(),
    )
    .please();
  const summary = proofSummaryForEntry(
    { repository: "terryyin/open-dough", attemptId: "attempt-a", revision },
    entry,
  );
  adapter.answer({ discover: { main: [attempt] }, proof: { summary } });
  const receipt = land(record, origin, dashboard.home).result.landing.receipt;
  const key = `adapter/${JSON.stringify(["run-a", "attempt-a", revision])}`;
  await expect
    .poll(() => retainedHistory(dashboard.home)?.builds[key]?.proof)
    .toEqual({
      kind: "summary",
      summary: expect.objectContaining({
        schemaVersion: 2,
        attemptId: "attempt-a",
        revision,
        entries: [
          {
            path: "tests",
            evidence: [
              expect.objectContaining({
                unit: "legacy",
                label: "test cases",
                durationMs: 9100,
              }),
              expect.objectContaining({ unit: "case", durationMs: 1200 }),
              expect.objectContaining({ unit: "file", durationMs: 80 }),
            ],
          },
        ],
      }),
    });
  expect(Object.keys(retainedHistory(dashboard.home)?.builds ?? {})).toEqual([
    key,
  ]);
  expect(adapter.proofRequests()).toEqual([
    {
      operation: "proof",
      check: { repo: "terryyin/open-dough", branch: "main" },
      attempt: { runId: "run-a", attemptId: "attempt-a", sha: revision },
    },
  ]);
  const reader = await restartAsLandedCiReader(dashboard, origin, "boundary");
  readers.push(reader);
  const asked = adapter.proofRequests();
  const discovered = adapter.discoverRequests();
  const ghCalls = github.calls.length;
  const reading = await collectedScopeHistory(
    reader.origin,
    "tests",
    revision,
    receipt.receivedAt,
  );
  expect(reading).toMatchObject({
    status: 200,
    body: {
      selectedRevision: revision,
      entries: [
        {
          kind: "point",
          key,
          selected: true,
          build: {
            revision,
            adapterAttempt: { runId: "run-a", attemptId: "attempt-a" },
          },
          legacyReason: expect.stringMatching(/legacy.*unit.*unknown/i),
          readings: [
            { kind: "point", unit: "case", ms: 1200 },
            { kind: "point", unit: "file", ms: 80 },
          ],
        },
      ],
    },
  });
  expect(reading.body.entries).toHaveLength(1);
  expect(reading.body.entries[0]?.readings).toHaveLength(2);
  expect((await landedCiHistory(reader)).body).toMatchObject({
    entries: [{ kind: "point", revision }],
  });
  expect(
    await collectedScopeHistory(
      reader.origin,
      "tests",
      revision,
      receipt.receivedAt,
    ),
  ).toEqual(reading);
  expect(adapter.proofRequests()).toEqual(asked);
  expect(adapter.discoverRequests()).toEqual(discovered);
  expect(github.calls).toHaveLength(ghCalls);
});
