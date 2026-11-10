// Exact passed attempts retain their own unavailable proof and recover through
// background collection, without reopening a final landing resolution.
import path from "node:path";
import {
  collectedScopeHistory,
  retainedHistory,
} from "../../tests/support/collectedScopeHistory.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  landedRecord,
  minutesAgo,
  restartAsLandedCiReader,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  passedFrom,
  publishedLanding,
  trunkRun,
} from "../../tests/support/landedCiTrunk.ts";
import {
  serveCollectedTrunkRuns,
  type CollectedTrunkProofs,
} from "../../tests/support/landedCiScopeProofs.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { collectedScopeFileSummary } from "../../tests/support/scopeHistoryProofs.ts";

test.use({ serverMode: "boundary" });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});

for (const [initial, restart] of [
  ["none", false],
  ["unanswered", true],
] as const) {
  test(`an exact passed attempt resumes ${initial} proof ${restart ? "after collector restart" : "in the same collector"}`, async ({
    origin,
    github,
    startServer,
  }) => {
    const home = path.join(origin.machine, "home");
    const landing = await publishedLanding(origin, {
      title: "recover-scope-proof",
      receipt: "eeeeeeee-0000-4000-8000-000000000091",
      at: minutesAgo(5),
    });
    const run = trunkRun(landing.revision, 91, passedFrom(landing.at, 1000));
    const text = collectedScopeFileSummary(
      {
        repository: "terryyin/open-dough",
        runId: 91,
        attempt: 1,
        revision: landing.revision,
      },
      [
        ["intent/a.spec.ts", 1200, 80],
        ["intent/zero.spec.ts", 0, 0],
      ],
    );
    let proofs: CollectedTrunkProofs =
      initial === "none" ? {} : { 91: { kind: "unanswered" } };
    serveCollectedTrunkRuns(
      github,
      origin,
      () => [run],
      () => proofs,
    );
    keepLaunchRecords(home, [landedRecord(landing)]);
    let server = await startServer();
    await expect
      .poll(() => retainedHistory(home)?.builds["run/91/1"]?.proof)
      .toMatchObject({
        kind: "unavailable",
        reason: initial === "none" ? "none" : "unreadable",
      });
    const resolution =
      retainedHistory(home)?.landings[landing.receipt]?.observed;
    expect(resolution).toMatchObject({
      kind: "build",
      build: "run/91/1",
      selection: "exact",
    });
    if (restart) await server.close();
    proofs = { 91: { kind: "collected", artifactId: 910, text } };
    if (restart) server = await startServer();

    // This fails before retained unavailable proof is eligible for collection.
    await expect
      .poll(() => retainedHistory(home)?.builds["run/91/1"]?.proof?.kind)
      .toBe("summary");
    const history = retainedHistory(home);
    expect(Object.keys(history?.builds ?? {})).toEqual(["run/91/1"]);
    expect(history?.landings[landing.receipt]?.observed).toEqual(resolution);
    expect(history?.builds["run/91/1"]?.proof).toMatchObject({
      kind: "summary",
      summary: {
        schemaVersion: 2,
        revision: landing.revision,
        entries: [
          {
            path: "dashboard/tests",
            evidence: [
              {
                unit: "case",
                durationMs: 1200,
                files: [
                  {
                    path: "dashboard/tests/intent/a.spec.ts",
                    durationMs: 1200,
                  },
                  {
                    path: "dashboard/tests/intent/zero.spec.ts",
                    durationMs: 0,
                  },
                ],
              },
              { unit: "file", durationMs: 80 },
            ],
          },
        ],
      },
    });
    const reader = await restartAsLandedCiReader(server, origin, "boundary");
    readers.push(reader);
    const asked = github.calls.length;
    for (const [scope, caseMs, fileMs] of [
      ["dashboard/tests", 1200, 80],
      ["dashboard/tests/intent", 1200, 80],
      ["dashboard/tests/intent/a.spec.ts", 1200, 80],
      ["dashboard/tests/intent/zero.spec.ts", 0, 0],
    ] as const) {
      const reading = await collectedScopeHistory(
        reader.origin,
        scope,
        landing.revision,
        landing.at,
      );
      expect(reading.status).toBe(200);
      expect(reading.body.entries).toHaveLength(1);
      expect(reading.body.entries[0]).toMatchObject({
        kind: "point",
        key: "run/91/1",
        selected: true,
        readings: [
          { kind: "point", unit: "case", ms: caseMs },
          { kind: "point", unit: "file", ms: fileMs },
        ],
      });
    }
    expect(github.calls).toHaveLength(asked);
  });
}
