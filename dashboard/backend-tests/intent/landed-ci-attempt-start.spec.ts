// The actual collector repairs legacy bounds at their retained attempt while
// a newer rerun is listed; local history reads never acquire that evidence.
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  keepLandedCiHistory,
  landedCiHistory,
  restartAsLandedCiReader,
} from "../../tests/support/landedCiHistory.ts";
import {
  landedTrunk,
  recordedOnTrunk,
  trunkActions,
  trunkRun,
  usableProofOf,
} from "../../tests/support/landedCiTrunk.ts";
import { actionsRunsAnswer } from "../../tests/support/baseCiActions.ts";
import { publishes } from "../../tests/support/publishedRepository.ts";
import { notFoundAnswer } from "../../tests/originAnswers.ts";

// No page is opened during acquisition.
test.use({ serverMode: "boundary" });

for (const bounds of ["available", "unavailable"] as const) {
  test(`collection uses attempt start for new evidence; legacy original bounds ${bounds} are repaired or explained without selecting a faster rerun`, async ({
    origin,
    github,
    startServer,
  }) => {
    const trunk = landedTrunk(
      origin,
      [
        { title: "ci", kind: "ci-workflow" },
        { title: "original", kind: "code" },
        { title: "new", kind: "code" },
      ],
      ["original", "new"],
    );
    const originalLanding = trunk.landing("original");
    const original = trunkRun(originalLanding.revision, 41, {
      createdAt: "2026-11-05T10:00:00Z",
      startedAt: "2026-11-05T10:01:00Z",
      completedAt: "2026-11-05T10:03:00Z",
    });
    const rerun = trunkRun(originalLanding.revision, 41, {
      attempt: 2,
      createdAt: "2026-11-05T10:00:00Z",
      startedAt: "2026-11-05T11:00:00Z",
      completedAt: "2026-11-05T11:00:10Z",
    });
    const latest = trunkRun(trunk.revision("new"), 42, {
      createdAt: "2026-11-05T12:00:00Z",
      startedAt: "2026-11-05T12:02:00Z",
      completedAt: "2026-11-05T12:04:00Z",
    });
    recordedOnTrunk(origin, github, trunk.landings, () => [rerun, latest]);
    github.serve("terryyin/open-dough", async (call) => {
      if (
        call.request.kind === "actions-run-attempt" &&
        call.request.runId === 41 &&
        call.request.attempt === 1
      ) {
        if (bounds === "unavailable") return notFoundAnswer();
        const answer = actionsRunsAnswer([original]);
        if (!("body" in answer)) throw new Error("No synthetic Actions body");
        const body = JSON.parse(answer.body) as { workflow_runs: unknown[] };
        return { ...answer, body: JSON.stringify(body.workflow_runs[0]) };
      }
      return (
        trunkActions([rerun, latest], { 42: usableProofOf(latest) })(
          call.argv,
        ) ?? publishes({ revision: trunk.revision("new") })(call)
      );
    });
    const home = path.join(origin.machine, "home");
    const landing = makeMe.aLaunchLanding
      .comparing({
        base: trunk.revision("ci"),
        revision: originalLanding.revision,
      })
      .deliveredAs({ delivery: "legacy", receipt: originalLanding.receipt })
      .receivedAt(originalLanding.at)
      .please();
    await keepLandedCiHistory(
      home,
      makeMe.aLandedCiHistory
        .inTrunkOrder([trunk.revision("ci"), originalLanding.revision])
        .recording(
          landing,
          "run/41/1",
          makeMe.aKeptBuild
            .with({
              revision: originalLanding.revision,
              state: "pass",
              runId: 41,
              runAttempt: 1,
              runUrl: "https://ci.invalid/runs/41",
              startedAt: original.createdAt,
              completedAt: original.completedAt,
              timingBasis: undefined,
              proof: makeMe.aCiProof
                .forRun({ revision: originalLanding.revision, runId: 41 })
                .entries([
                  makeMe.aCiProofEntry.at("tests").counting(1).please(),
                ])
                .please(),
            })
            .please(),
        )
        .please(),
    );
    const beforeCollection = await startServer({ environment: "development" });
    const beforeRead = github.calls.length;
    expect(
      await landedCiHistory(beforeCollection, "timing-basis"),
    ).toMatchObject({
      body: {
        entries: [
          {
            kind: "gap",
            reason: "timing-basis",
            build: { runId: 41, runAttempt: 1 },
          },
        ],
      },
    });
    expect(github.calls.length).toBe(beforeRead);
    await beforeCollection.close();
    const server = await startServer();
    await expect
      .poll(() => landedCiHistory(server, "timing-basis"))
      .toMatchObject({
        body: {
          entries: [
            bounds === "available"
              ? {
                  kind: "point",
                  runId: 41,
                  runAttempt: 1,
                  startedAt: original.startedAt,
                  completedAt: original.completedAt,
                }
              : {
                  kind: "gap",
                  reason: "timing-basis",
                  build: { runId: 41, runAttempt: 1 },
                },
            {
              kind: "point",
              runId: 42,
              startedAt: latest.startedAt,
              completedAt: latest.completedAt,
            },
          ],
          reference: {
            sampleCount: bounds === "available" ? 1 : 0,
            selected: { key: "run/42/1", ms: 120000 },
            evidence: [
              bounds === "available"
                ? { key: "run/41/1", status: "included", ms: 120000 }
                : {
                    key: "run/41/1",
                    status: "excluded",
                    reason: "Retained attempt-start timing basis is unverified",
                  },
              { key: "run/42/1", status: "selected", ms: 120000 },
            ],
          },
        },
      });
    await expect
      .poll(() =>
        github.calls.some(
          ({ request }) =>
            request.kind === "actions-run-attempt" &&
            request.runId === 41 &&
            request.attempt === 1,
        ),
      )
      .toBe(true);
    const reader = await restartAsLandedCiReader(server, origin, "boundary");
    try {
      const asked = github.calls.length;
      expect(await landedCiHistory(reader, "timing-basis")).toMatchObject({
        body: {
          entries: [
            bounds === "available"
              ? {
                  kind: "point",
                  runId: 41,
                  runAttempt: 1,
                  startedAt: original.startedAt,
                }
              : {
                  kind: "gap",
                  reason: "timing-basis",
                  build: { runId: 41, runAttempt: 1 },
                },
            { kind: "point", runId: 42, startedAt: latest.startedAt },
          ],
        },
      });
      expect(github.calls.length).toBe(asked);
    } finally {
      await reader.close();
    }
  });
}
