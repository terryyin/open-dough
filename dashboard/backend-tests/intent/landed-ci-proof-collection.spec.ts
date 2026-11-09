// Background retention of the measured attempt's validated proof. These
// journeys land real work with Intent closed and serve summary archive bytes
// through the existing artifact reader, then inspect the retained observation.
import { readFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { CiProof } from "../../src/ciProof.ts";
import { actionsForRuns } from "../../tests/support/baseCiActions.ts";
import {
  collectedSummary,
  playwrightRecord,
  summaryTextZipAnswer,
} from "../../tests/support/ciProofCollected.ts";
import { runArtifactsAnswer } from "../../tests/support/ciProofArtifacts.ts";
import {
  collectingLandedCi,
  landedCiHistory,
  resultToLand,
  restartAsLandedCiReader,
} from "../../tests/support/landedCiHistory.ts";
import {
  collectedScopeHistory,
  retainedHistory,
} from "../../tests/support/collectedScopeHistory.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { publishes } from "../../tests/support/publishedRepository.ts";
import { originMain } from "../../tests/support/sessionDialog.ts";
import { land } from "../../tests/support/startSessionLandingContext.ts";

test.use({ serverMode: "boundary", extraEnv: collectingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});

function retainedProof(
  home: string,
  buildKey = "run/41/1",
): CiProof | undefined {
  try {
    const stored = JSON.parse(
      readFileSync(
        path.join(home, ".open-dough/dashboard/landed-ci-history.json"),
        "utf8",
      ),
    ) as Record<string, { builds: Record<string, { proof?: CiProof }> }>;
    return stored["open-dough"]?.builds[buildKey]?.proof;
  } catch {
    return undefined;
  }
}

for (const proofState of ["summary", "mismatched", "expired"] as const) {
  test(`retains ${proofState} proof for a recorded landed attempt while Intent is closed`, async ({
    dashboard,
    origin,
    github,
  }) => {
    const { record } = await resultToLand(dashboard, "proof.txt");
    let summaryText = "";
    github.serve("terryyin/open-dough", async (call) => {
      const main = await originMain(origin);
      const run = makeMe.aCiRun
        .with({
          headSha: main,
          id: 41,
          attempt: 1,
          conclusion: "success",
          createdAt: "2026-11-05T10:00:00Z",
          startedAt: "2026-11-05T10:00:00Z",
          completedAt: "2026-11-05T10:06:05Z",
        })
        .please();
      const proofRun = {
        repository: "terryyin/open-dough",
        runId: 41,
        attempt: 1,
        revision: main,
      };
      if (call.request.kind === "actions-run-artifacts")
        return runArtifactsAnswer(proofRun, 901, proofState === "expired");
      if (call.request.kind === "actions-artifact-zip") {
        // Raw runner reports and serialized archive bytes are the input format
        // under test; the product must parse and validate them itself.
        summaryText = collectedSummary(
          {
            ...proofRun,
            revision: proofState === "mismatched" ? "f".repeat(40) : main,
          },
          [
            ["dashboard/tests", 1, "case"],
            ["dashboard/tests", 1, "file"],
          ],
          [
            {
              entries: ["dashboard/tests"],
              part: 1,
              of: 1,
              byFile: true,
              record: playwrightRecord([
                ["dashboard/tests/intent/a.spec.ts", "expected", [1200]],
                ["dashboard/tests/intent/zero.spec.ts", "expected", [0]],
              ]),
            },
            {
              entries: ["dashboard/tests"],
              part: 1,
              of: 1,
              byFile: true,
              unit: "file",
              outcomes:
                "passed\tdashboard/tests/intent/a.spec.ts\npassed\tdashboard/tests/intent/zero.spec.ts\n",
              times:
                "0\tdashboard/tests/intent/a.spec.ts\n0\tdashboard/tests/intent/zero.spec.ts\n",
            },
          ],
        );
        return summaryTextZipAnswer(summaryText);
      }
      return (
        actionsForRuns([run])(call.argv, main) ??
        publishes({ revision: main })(call)
      );
    });
    const delivered = land(record, origin, dashboard.home).result;
    const receipt = delivered.landing.receipt;
    const revision = receipt.revision;
    if (proofState === "summary") {
      await expect
        .poll(() => retainedProof(dashboard.home))
        .toEqual({
          kind: "summary",
          summary: expect.objectContaining({
            repository: "terryyin/open-dough",
            runId: 41,
            runAttempt: 1,
            revision,
            entries: [
              expect.objectContaining({
                path: "dashboard/tests",
                evidence: [
                  expect.objectContaining({
                    unit: "case",
                    durationMs: 1200,
                    files: [
                      expect.objectContaining({
                        path: "dashboard/tests/intent/a.spec.ts",
                        durationMs: 1200,
                      }),
                      expect.objectContaining({
                        path: "dashboard/tests/intent/zero.spec.ts",
                        durationMs: 0,
                      }),
                    ],
                  }),
                  expect.objectContaining({ unit: "file", durationMs: 0 }),
                ],
              }),
            ],
          }),
        });
      expect(summaryText).not.toBe("");
      expect(JSON.parse(summaryText)).toHaveProperty("schemaVersion", 2);
      expect(
        Object.keys(retainedHistory(dashboard.home)?.builds ?? {}),
      ).toEqual(["run/41/1"]);
      readers.push(
        await restartAsLandedCiReader(dashboard, origin, "boundary"),
      );
      const before = github.calls.length;
      const reading = await collectedScopeHistory(
        dashboard.origin,
        "dashboard/tests",
        revision,
        receipt.receivedAt,
      );
      expect(reading).toMatchObject({
        status: 200,
        body: {
          entries: [
            {
              kind: "point",
              key: "run/41/1",
              selected: true,
              readings: [
                { kind: "point", unit: "case", ms: 1200 },
                { kind: "point", unit: "file", ms: 0 },
              ],
            },
          ],
        },
      });
      expect(reading.body.entries).toHaveLength(1);
      expect((await landedCiHistory(dashboard)).body).toMatchObject({
        entries: [{ kind: "point", revision }],
      });
      expect(github.calls).toHaveLength(before);
    } else {
      await expect
        .poll(() => retainedProof(dashboard.home))
        .toMatchObject({ kind: "unavailable", reason: proofState });
    }
    expect(
      github.calls.filter(
        ({ request }) => request.kind === "actions-run-artifacts",
      ),
    ).toHaveLength(1);
    expect(
      github.calls.filter(
        ({ request }) => request.kind === "actions-artifact-zip",
      ),
    ).toHaveLength(proofState === "expired" ? 0 : 1);
  });
}
