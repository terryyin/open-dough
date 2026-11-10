// Collected scope evidence shares project history's bounded retained cohort.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  collectingLandedCi,
  landedCiHistory,
  restartAsLandedCiReader,
} from "../../tests/support/landedCiHistory.ts";
import {
  retainedHistory as retained,
  collectedScopeHistory,
  historyFile,
  writeCollectedHistoryOrder,
} from "../../tests/support/collectedScopeHistory.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { landedTrunk } from "../../tests/support/landedCiTrunk.ts";
import { commonGitDir } from "../../tests/support/launchLanding.ts";
import { git } from "../../tests/support/storyReviewWorktree.ts";

test.use({ serverMode: "boundary", extraEnv: collectingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});
const scopedHistory = (origin: string, revision: string, through: string) =>
  collectedScopeHistory(origin, "dashboard/tests", revision, through);

test("stored version 1 proof and an explanation-only gap stay readable beside version 2 proof through a local store write", async ({
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
      base: git(origin.project, "rev-parse", `${trunk.revision("legacy-v1")}^`),
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
      base: git(
        origin.project,
        "rev-parse",
        `${trunk.revision("legacy-good")}^`,
      ),
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
  const normalizedOldProof = makeMe.aCiProof
    .forRun({ revision: old.revision, runId: 220 })
    .entries([
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .holding(
          makeMe.aCiProofEvidence
            .legacy("test cases")
            .brokenDown({
              path: "dashboard/tests/legacy.spec.ts",
              passed: 2,
              durationMs: 100,
              untimed: 0,
            })
            .please(),
        )
        .please(),
    ])
    .please();
  const explanation =
    "Earlier collection could not establish this landing's result.";
  const history = makeMe.aLandedCiHistory
    .inTrunkOrder([old.revision, good.revision, gap.revision])
    .recording(old, "run/220/1", {
      revision: old.revision,
      state: "pass",
      runId: 220,
      runAttempt: 1,
      startedAt: "2026-11-05T09:00:00Z",
      completedAt: "2026-11-05T09:01:00Z",
      proof: normalizedOldProof,
    })
    .recording(good, "run/221/1", {
      revision: good.revision,
      state: "pass",
      runId: 221,
      runAttempt: 1,
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:01:00Z",
      proof,
    })
    .gap(gap, explanation)
    .please();
  const reader = await restartAsLandedCiReader(dashboard, origin, "boundary");
  readers.push(reader);

  // These are exactly the older wire shapes under test, not builder defaults.
  // The old label "test cases" did not declare a case unit. Its counts, path,
  // breakdown and time must survive as legacy evidence, beside current proof.
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
          reason: expect.stringMatching(/legacy.*unit.*unknown/i),
          readings: [
            {
              kind: "gap",
              unit: "case",
              reason: expect.stringMatching(/legacy.*unit.*unknown/i),
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
        { kind: "point", revision: old.revision },
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

  // Use the real atomic store writer with this isolated machine's HOME. The
  // write must preserve readable legacy evidence instead of rebuilding empty.
  writeCollectedHistoryOrder(dashboard.home, [
    old.revision,
    good.revision,
    gap.revision,
  ]);
  const kept = retained(dashboard.home);
  assert(kept !== undefined, "The atomic write retained the legacy evidence.");
  expect(Object.keys(kept.landings).sort()).toEqual(
    [old.receipt, good.receipt, gap.receipt].sort(),
  );
  expect(Object.keys(kept.builds)).toEqual(["run/220/1", "run/221/1"]);
  expect(kept.builds["run/220/1"]?.proof).toEqual(normalizedOldProof);
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
