// Retained summaries, including by-file evidence, survive collection's lifecycle.
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { retainedHistory } from "../../tests/support/collectedScopeHistory.ts";
import { expectCollectedScopePoints } from "../../tests/support/collectedScopeReadProofs.ts";
import {
  keepLandedCiHistory,
  minutesAgo,
  restartAsLandedCiReader,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { publishedLanding } from "../../tests/support/landedCiTrunk.ts";
import { serveCollectedTrunkRuns } from "../../tests/support/landedCiScopeProofs.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { isActionsRequest } from "../../tests/support/ghActionsRequest.ts";
import { commonGitDir } from "../../tests/support/launchLanding.ts";
import { collectedScopeFileSummary } from "../../tests/support/scopeHistoryProofs.ts";

test.use({ serverMode: "boundary" });

for (const legacyUnavailable of [false, true]) {
  test(`a final retained build ${legacyUnavailable ? "with legacy unreadable proof" : "without proof"} and no live launch backfills without reopening landing resolution`, async ({
    origin,
    github,
    startServer,
  }) => {
    const home = path.join(origin.machine, "home");
    const landing = await publishedLanding(origin, {
      title: "old-final-proof",
      receipt: "61000000-0000-4000-8000-000000000001",
      at: minutesAgo(60),
    });
    const history = makeMe.aLandedCiHistory
      .measuredLanding({
        receipt: landing.receipt,
        revision: landing.revision,
        receivedAt: landing.at,
        repository: commonGitDir(origin.project),
        runId: 61,
        startedAt: landing.at,
        completedAt: new Date(Date.parse(landing.at) + 30_000).toISOString(),
      })
      .inTrunkOrder([landing.revision]);
    if (legacyUnavailable)
      history.proofFor(
        "run/61/1",
        makeMe.aCiProof
          .unavailableBecause(
            "unreadable",
            "Stored before proof pending state existed",
          )
          .please(),
      );
    const before = history.please();
    expect(before.builds["run/61/1"]).not.toHaveProperty("proofPending");
    await keepLandedCiHistory(home, before);
    keepLaunchRecords(home, []);
    const text = collectedScopeFileSummary(
      {
        repository: "terryyin/open-dough",
        runId: 61,
        attempt: 1,
        revision: landing.revision,
      },
      [
        ["folder/a.spec.ts", 100, 10],
        ["folder/zero.spec.ts", 0, 0],
        ["root.spec.ts", 400, 40],
      ],
    );
    serveCollectedTrunkRuns(
      github,
      origin,
      () => [],
      () => ({
        61: { kind: "collected", artifactId: 610, text },
      }),
    );
    const collecting = await startServer();
    await expect
      .poll(() => retainedHistory(home)?.builds["run/61/1"]?.proof)
      .toEqual({ kind: "summary", summary: JSON.parse(text) as unknown });
    expect(retainedHistory(home)?.landings).toEqual(before.landings);
    expect(Object.keys(retainedHistory(home)?.builds ?? {})).toEqual([
      "run/61/1",
    ]);
    expect(
      github.calls
        .filter(({ request }) => isActionsRequest(request))
        .map(({ request }) => request.kind),
    ).toEqual(["actions-run-artifacts", "actions-artifact-zip"]);

    const reader = await restartAsLandedCiReader(
      collecting,
      origin,
      "boundary",
    );
    try {
      const asked = github.calls.length;
      await expectCollectedScopePoints([reader.origin, reader.origin], {
        key: "run/61/1",
        revision: landing.revision,
        through: landing.at,
        scopes: [
          ["dashboard/tests", 500, 50],
          ["dashboard/tests/folder", 100, 10],
          ["dashboard/tests/folder/zero.spec.ts", 0, 0],
        ],
      });
      expect(github.calls).toHaveLength(asked);
    } finally {
      await reader.close();
    }
  });
}
