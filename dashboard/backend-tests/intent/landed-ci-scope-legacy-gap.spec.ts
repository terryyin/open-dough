import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";
import {
  collectingLandedCi,
  landedCiHistory,
  restartAsLandedCiReader,
} from "../../test-support/support/landedCiHistory.ts";
import {
  retainedHistory as retained,
  collectedScopeHistory,
  historyFile,
  writeCollectedHistoryOrder,
} from "../../test-support/support/collectedScopeHistory.ts";
import {
  expect,
  test,
} from "../../test-support/support/landedCiHistoryTest.ts";
import { landedTrunk } from "../../test-support/support/landedCiTrunk.ts";
import { commonGitDir } from "../../test-support/support/launchLanding.ts";

test.use({ serverMode: "boundary", extraEnv: collectingLandedCi });
let reader: DashboardServer | undefined;
test.afterEach(() => reader?.close());
const scopedHistory = (origin: string, revision: string, through: string) =>
  collectedScopeHistory(origin, "dashboard/tests", revision, through);

test("stored version 1 proof and an explanation-only gap keep their recorded builds and gaps beside version 2 proof through a local store write", async ({
  dashboard,
  origin,
  github,
}) => {
  const trunk = landedTrunk(
    origin,
    [
      { title: "legacy-v1", kind: "code" },
      { title: "legacy-good", kind: "code" },
      { title: "legacy-gap", kind: "code" },
    ],
    ["legacy-v1", "legacy-good", "legacy-gap"],
  );
  const repository = commonGitDir(origin.project);
  const old = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing({
      base: trunk.parent("legacy-v1"),
      revision: trunk.revision("legacy-v1"),
    })
    .deliveredAs({
      delivery: "52000000-0000-4000-8000-000000000000",
      receipt: "52000000-0000-4000-8000-000000000000",
    })
    .receivedAt("2026-11-05T09:00:00Z")
    .please();
  const good = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing({
      base: trunk.parent("legacy-good"),
      revision: trunk.revision("legacy-good"),
    })
    .deliveredAs({
      delivery: "52000000-0000-4000-8000-000000000001",
      receipt: "52000000-0000-4000-8000-000000000001",
    })
    .receivedAt("2026-11-05T10:00:00Z")
    .please();
  const gap = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing({ base: good.revision, revision: trunk.revision("legacy-gap") })
    .deliveredAs({
      delivery: "52000000-0000-4000-8000-000000000002",
      receipt: "52000000-0000-4000-8000-000000000002",
    })
    .receivedAt("2026-11-05T11:00:00Z")
    .please();
  const proof = makeMe.aCiProof
    .forRun({ revision: good.revision, runId: 221 })
    .entries([
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .counting(2, "case")
        .timed(2700)
        .please(),
    ])
    .please();
  const explanation =
    "Earlier collection could not establish this landing's result.";
  const history = makeMe.aLandedCiHistory
    .inTrunkOrder([old.revision, good.revision, gap.revision])
    .recording(
      old,
      "run/220/1",
      makeMe.aKeptBuild
        .with({
          revision: old.revision,
          state: "pass",
          runId: 220,
          runAttempt: 1,
          startedAt: "2026-11-05T09:00:00Z",
          completedAt: "2026-11-05T09:01:00Z",
        })
        .please(),
    )
    .recording(
      good,
      "run/221/1",
      makeMe.aKeptBuild
        .with({
          revision: good.revision,
          state: "pass",
          runId: 221,
          runAttempt: 1,
          startedAt: "2026-11-05T10:00:00Z",
          completedAt: "2026-11-05T10:01:00Z",
          proof,
        })
        .please(),
    )
    .gap(gap, explanation)
    .please();
  reader = await restartAsLandedCiReader(dashboard, origin, "boundary");

  // These are exactly the older wire shapes under test, not builder defaults.
  // The old build keeps its provenance and wall interval.
  const legacy = structuredClone(history);
  const legacyGap = legacy.landings[gap.receipt];
  assert(legacyGap !== undefined, "The arranged history holds the legacy gap.");
  delete (legacyGap.observed as { reason?: string }).reason;
  const oldBuild = legacy.builds["run/220/1"];
  assert(oldBuild !== undefined, "The arranged history holds the old build.");
  const oldSummary = JSON.parse(`{
    "schemaVersion":1,"repository":"terryyin/open-dough","revision":"${old.revision}","runId":220,"runAttempt":1,
    "entries":[{"path":"dashboard/tests","unit":"test cases","passed":2,"failed":0,"other":0,"durationMs":100,"untimed":0,
      "parts":[{"part":1,"status":"present","passed":2,"failed":0,"other":0,"durationMs":100,"untimed":0,"breakdown":true}],
      "files":[{"path":"dashboard/tests/legacy.spec.ts","passed":2,"failed":0,"other":0,"durationMs":100,"untimed":0}]
    }]
  }`) as unknown;
  const wire = {
    ...legacy,
    builds: {
      ...legacy.builds,
      "run/220/1": {
        ...oldBuild,
        proof: { kind: "summary", summary: oldSummary },
      },
    },
  };
  writeFileSync(
    historyFile(dashboard.home),
    JSON.stringify({ "open-dough": wire }),
  );
  const asked = github.calls.length;
  const before = await scopedHistory(
    reader.origin,
    gap.revision,
    gap.receivedAt,
  );
  expect(before).toMatchObject({
    status: 200,
    body: {
      availability: "retained",
      entries: [
        {
          kind: "gap",
          reason: "Invalid CI proof summary",
          readings: [
            {
              kind: "gap",
              unit: "case",
              reason: "Invalid CI proof summary",
            },
          ],
        },
        {
          kind: "point",
          readings: [{ kind: "point", unit: "case", ms: 2700 }],
        },
        { kind: "gap", selected: true, reason: explanation },
      ],
    },
  });
  const projectBefore = await landedCiHistory(reader);
  expect(projectBefore).toMatchObject({
    status: 200,
    body: {
      entries: [
        {
          kind: "point",
          revision: old.revision,
          runId: 220,
          runAttempt: 1,
          startedAt: "2026-11-05T09:00:00Z",
          completedAt: "2026-11-05T09:01:00Z",
        },
        { kind: "point", revision: good.revision },
        {
          kind: "gap",
          reason: "unclassified",
          explanation,
          revision: gap.revision,
        },
      ],
    },
  });

  // The real atomic writer keeps the bad proof classified with its build.
  writeCollectedHistoryOrder(dashboard.home, [
    old.revision,
    good.revision,
    gap.revision,
  ]);
  const kept = retained(dashboard.home);
  assert(kept !== undefined, "The atomic write retained the history.");
  expect(Object.keys(kept.landings).sort()).toEqual(
    [old.receipt, good.receipt, gap.receipt].sort(),
  );
  expect(Object.keys(kept.builds)).toEqual(["run/220/1", "run/221/1"]);
  expect(kept.builds["run/220/1"]?.proof).toMatchObject({
    kind: "unavailable",
    reason: "invalid",
    detail: expect.stringContaining("schemaVersion is not 2"),
  });
  expect(kept.builds["run/221/1"]?.proof).toEqual(proof);
  expect(kept.landings[gap.receipt]?.observed).toEqual({
    kind: "gap",
    reason: "unclassified",
    explanation,
  });
  expect(
    await scopedHistory(reader.origin, gap.revision, gap.receivedAt),
  ).toEqual(before);
  expect(await landedCiHistory(reader)).toEqual(projectBefore);
  expect(github.calls).toHaveLength(asked);
});
