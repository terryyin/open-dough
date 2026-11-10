// A configured adapter's failed proof command can recover on the same attempt.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { adapterProject } from "../../tests/intentCiAdapterProofProject.ts";
import { proofSummaryForEntry } from "../../tests/support/ciProofArtifacts.ts";
import {
  collectedScopeHistory,
  retainedHistory,
} from "../../tests/support/collectedScopeHistory.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  recheckingLandedCi,
  restartAsLandedCiReader,
  resultToLand,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { land } from "../../tests/support/startSessionLandingContext.ts";

test.use({ serverMode: "boundary", extraEnv: recheckingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});

test("a failed adapter proof command resumes after collector restart without changing its contextual attempt", async ({
  dashboard,
  origin,
  github,
  startServer,
}) => {
  // This journey owns a real origin, installed launch/landing and two collectors.
  // Measured setup and first collection used 29 s before the restart/read.
  test.setTimeout(60_000);
  const { record, revision } = await resultToLand(
    dashboard,
    "recover-adapter-scope-proof.txt",
  );
  const adapter = adapterProject(dashboard.home);
  const runId = "recover-run";
  const attemptId = "retry+#attempt";
  const attempt = makeMe.aCiAdapterAttempt
    .passed({
      runId,
      attemptId,
      sha: revision,
      branch: "main",
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:02:00Z",
    })
    .please();
  const summary = proofSummaryForEntry(
    { repository: "terryyin/open-dough", attemptId, revision },
    makeMe.aCiProofEntry
      .at("tests")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .brokenDown(
            { path: "tests/folder/a.spec.ts", passed: 1, durationMs: 1200 },
            { path: "tests/folder/zero.spec.ts", passed: 1, durationMs: 0 },
          )
          .please(),
        makeMe.aCiProofEvidence
          .inUnit("file")
          .brokenDown(
            { path: "tests/folder/a.spec.ts", passed: 1, durationMs: 80 },
            { path: "tests/folder/zero.spec.ts", passed: 1, durationMs: 0 },
          )
          .please(),
      )
      .please(),
  );
  adapter.answer({
    discover: { main: [attempt] },
    proof: {},
    proofStderr: "The adapter's proof service is temporarily unavailable",
  });
  const nativeCalls = github.calls.length;
  const receipt = land(record, origin, dashboard.home).result.landing.receipt;
  const key = `adapter/${JSON.stringify([runId, attemptId, revision])}`;
  await expect
    .poll(() => retainedHistory(dashboard.home)?.builds[key]?.proof)
    .toMatchObject({ kind: "unavailable", reason: "unreadable" });
  const resolution = retainedHistory(dashboard.home)?.landings[receipt.receipt]
    ?.observed;
  expect(resolution).toEqual({ kind: "build", build: key, selection: "exact" });
  await dashboard.close();
  const failedRequests = adapter.proofRequests().length;
  expect(failedRequests).toBeGreaterThan(0);

  adapter.answer({ discover: { main: [attempt] }, proof: { summary } });
  const resumed = await startServer();
  await expect
    .poll(() => retainedHistory(resumed.home)?.builds[key]?.proof)
    .toMatchObject({
      kind: "summary",
      summary: {
        schemaVersion: 2,
        attemptId,
        revision,
        entries: [
          {
            path: "tests",
            evidence: [
              { unit: "case", durationMs: 1200 },
              { unit: "file", durationMs: 80 },
            ],
          },
        ],
      },
    });
  const history = retainedHistory(resumed.home);
  expect(Object.keys(history?.builds ?? {})).toEqual([key]);
  expect(history?.landings[receipt.receipt]?.observed).toEqual(resolution);
  expect(adapter.proofRequests().length).toBeGreaterThan(failedRequests);
  for (const asked of adapter.proofRequests())
    expect(asked).toEqual({
      operation: "proof",
      check: { repo: "terryyin/open-dough", branch: "main" },
      attempt: { runId, attemptId, sha: revision },
    });
  expect(github.calls).toHaveLength(nativeCalls);

  const reader = await restartAsLandedCiReader(resumed, origin, "boundary");
  readers.push(reader);
  const proofRequests = adapter.proofRequests();
  const discoverRequests = adapter.discoverRequests();
  for (const [scope, caseMs, fileMs] of [
    ["tests", 1200, 80],
    ["tests/folder", 1200, 80],
    ["tests/folder/a.spec.ts", 1200, 80],
    ["tests/folder/zero.spec.ts", 0, 0],
  ] as const) {
    const reading = await collectedScopeHistory(
      reader.origin,
      scope,
      revision,
      receipt.receivedAt,
    );
    expect(reading.status).toBe(200);
    expect(reading.body.entries).toHaveLength(1);
    expect(reading.body.entries[0]).toMatchObject({
      kind: "point",
      key,
      selected: true,
      build: { revision, adapterAttempt: { runId, attemptId } },
      readings: [
        { kind: "point", unit: "case", ms: caseMs },
        { kind: "point", unit: "file", ms: fileMs },
      ],
    });
  }
  expect(adapter.proofRequests()).toEqual(proofRequests);
  expect(adapter.discoverRequests()).toEqual(discoverRequests);
  expect(github.calls).toHaveLength(nativeCalls);
});
