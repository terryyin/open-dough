import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { nearestRevisionBuild } from "../../dashboard/server/baseCiRevisionNearest.ts";
import { historyEntries } from "../../dashboard/server/landedCiHistoryEntries.ts";
import { wallTimeReferenceOf } from "../../dashboard/server/ciWallTimeReference.ts";
import { gapReasonWords } from "../../dashboard/src/ciHistoryGapWords.ts";
import { scopeHistoryOf } from "../../dashboard/server/ciScopeHistory.ts";

const revision = "a".repeat(40);

for (const attempt of [1, 2]) {
  test(`attempt ${attempt} starts at its provider-reported attempt start, not workflow creation`, async () => {
    const run = makeMe.aRevisionCiRun
      .with({
        headSha: revision,
        databaseId: 41,
        attempt,
        createdAt: "2026-11-05T10:00:00Z",
        startedAt: "2026-11-05T10:01:00Z",
        completedAt: "2026-11-05T10:03:00Z",
      })
      .please();
    const selected = await nearestRevisionBuild([revision], {
      listRunsAt: async () => [run],
      subjectOf: async () => "landed change",
    });
    assert.equal(selected.startedAt, "2026-11-05T10:01:00Z");
    assert.equal(selected.completedAt, "2026-11-05T10:03:00Z");
  });
}

test("workflow creation cannot substitute for a missing attempt start", async () => {
  const run = makeMe.aRevisionCiRun
    .with({
      headSha: revision,
      databaseId: 41,
      attempt: 1,
      createdAt: "2026-11-05T10:00:00Z",
      startedAt: undefined,
      completedAt: "2026-11-05T10:03:00Z",
    })
    .please();
  const selected = await nearestRevisionBuild([revision], {
    listRunsAt: async () => [run],
    subjectOf: async () => "landed change",
  });
  assert.equal(selected.startedAt, undefined);
});

for (const timingBasis of [undefined, "workflow-creation"]) {
  test(`retained ${timingBasis ?? "unknown"} timing is an explained gap and excluded from the shared reference`, () => {
    const landing = makeMe.aLaunchLanding
      .comparing({ base: "b".repeat(40), revision })
      .receivedAt("2026-11-05T10:00:00Z")
      .please();
    const history = makeMe.aLandedCiHistory
      .inTrunkOrder([revision])
      .recording(landing, "run/41/1", {
        revision,
        state: "pass",
        runId: 41,
        runAttempt: 1,
        startedAt: "2026-11-05T10:00:00Z",
        completedAt: "2026-11-05T10:03:00Z",
        timingBasis,
        proof: makeMe.aCiProof
          .forRun({ revision, runId: 41 })
          .entries([
            makeMe.aCiProofEntry.at("tests").counting(1).timed(450).please(),
          ])
          .please(),
      })
      .please();
    assert.deepEqual(
      historyEntries(history).map(({ kind, reason }) => ({ kind, reason })),
      [{ kind: "gap", reason: "timing-basis" }],
    );
    assert.equal(
      gapReasonWords(historyEntries(history)[0]),
      "Retained attempt-start timing basis is unverified",
    );
    const reference = wallTimeReferenceOf(history);
    assert.equal(reference.selected.ms, undefined);
    assert.match(reference.selected.reason, /attempt-start timing basis/);
    assert.equal(reference.sampleCount, 0);
    const execution = scopeHistoryOf(history, "tests", {
      revision,
      at: landing.receivedAt,
    });
    assert.equal(execution.entries[0].kind, "point");
    assert.equal(execution.entries[0].readings[0].ms, 450);
  });
}
