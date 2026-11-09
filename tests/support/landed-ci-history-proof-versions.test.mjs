import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { storeOnMachine } from "./landedCiHistoryMachineTest.mjs";

test("stored v1 and v2 proof with an old gap normalize locally without inferring declared units or losing payload on an atomic write", (t) => {
  const legacy = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .deliveredAs({ delivery: "legacy", receipt: "legacy" })
    .receivedAt("2026-11-01T00:00:00Z")
    .please();
  const modern = makeMe.aLaunchLanding
    .comparing({ base: legacy.revision, revision: "b".repeat(40) })
    .deliveredAs({ delivery: "modern", receipt: "modern" })
    .receivedAt("2026-11-02T00:00:00Z")
    .please();
  const missing = makeMe.aLaunchLanding
    .comparing({ base: modern.revision, revision: "c".repeat(40) })
    .deliveredAs({ delivery: "missing", receipt: "missing" })
    .receivedAt("2026-11-03T00:00:00Z")
    .please();
  const modernProof = makeMe.aCiProof
    .forRun({ revision: modern.revision, runId: 2 })
    .entries([
      makeMe.aCiProofEntry
        .at("tests")
        .holding(
          makeMe.aCiProofEvidence
            .legacy("test cases")
            .counting(9)
            .timed(9000)
            .please(),
          makeMe.aCiProofEvidence
            .inUnit("case")
            .counting(2)
            .timed(200)
            .please(),
          makeMe.aCiProofEvidence.inUnit("file").counting(1).timed(20).please(),
        )
        .please(),
    ])
    .please();
  const history = makeMe.aLandedCiHistory
    .inTrunkOrder([legacy.revision, modern.revision, missing.revision])
    .recording(legacy, "run/1/1", {
      revision: legacy.revision,
      state: "pass",
      runId: 1,
      runAttempt: 1,
      startedAt: legacy.receivedAt,
    })
    .recording(modern, "run/2/1", {
      revision: modern.revision,
      state: "pass",
      runId: 2,
      runAttempt: 1,
      startedAt: modern.receivedAt,
      proof: modernProof,
    })
    .gap(missing, "The older collector could not establish this result.")
    .please();
  // Deliberate v1 wire bytes: even a label spelling "test cases" is provenance,
  // never a declared case unit. These exact bytes are the input under proof.
  const legacySummary = {
    schemaVersion: 1,
    repository: "terryyin/open-dough",
    runId: 1,
    runAttempt: 1,
    revision: legacy.revision,
    entries: [
      {
        path: "tests",
        unit: "test cases",
        passed: 1,
        failed: 0,
        other: 0,
        durationMs: 100,
        untimed: 0,
        parts: [
          {
            part: 1,
            status: "present",
            passed: 1,
            failed: 0,
            other: 0,
            durationMs: 100,
            untimed: 0,
            breakdown: true,
          },
        ],
        files: [
          {
            path: "tests/a.spec.ts",
            passed: 1,
            failed: 0,
            other: 0,
            durationMs: 100,
            untimed: 0,
          },
        ],
      },
    ],
  };
  history.builds["run/1/1"].proof = { kind: "summary", summary: legacySummary };
  delete history.landings.missing.observed.reason;
  const result = storeOnMachine(
    t,
    history,
    `const first=await readLandedCiHistory('open-dough'); if(first===undefined){console.log(JSON.stringify({readable:false}));}else{const beforeWrite=JSON.parse(readFileSync(process.env.HOME+'/.open-dough/dashboard/landed-ci-history.json','utf8')); await keepLandedCiOrder('open-dough',facts.order); const kept=await readLandedCiHistory('open-dough'); const disk=JSON.parse(readFileSync(process.env.HOME+'/.open-dough/dashboard/landed-ci-history.json','utf8')); console.log(JSON.stringify({readable:true,first,beforeWrite,kept,disk,scope:scopeHistoryOf(kept,'tests',{revision:facts.selected.revision,at:facts.selected.receivedAt},facts.order)}));}`,
    { order: history.trunkOrder, selected: missing },
  );
  assert.equal(result.readable, true);
  assert.deepEqual(
    result.beforeWrite["open-dough"],
    history,
    "local reading does not rewrite raw bytes",
  );
  const { path, unit, ...results } = legacySummary.entries[0];
  const expected = {
    kind: "summary",
    summary: {
      ...legacySummary,
      schemaVersion: 2,
      entries: [
        { path, evidence: [{ unit: "legacy", label: unit, ...results }] },
      ],
    },
  };
  assert.deepEqual(result.first.builds["run/1/1"].proof, expected);
  assert.deepEqual(result.disk["open-dough"].builds["run/1/1"].proof, expected);
  assert.deepEqual(result.kept.builds["run/2/1"].proof, modernProof);
  assert.equal(result.kept.landings.missing.observed.reason, "unclassified");
  assert.equal(result.scope.entries.length, 3);
  assert.equal(result.scope.entries[0].kind, "gap");
  assert.deepEqual(
    result.scope.entries[0].readings.map((reading) => reading.unit),
    ["case", "file"],
  );
  assert.match(result.scope.entries[0].reason, /legacy.*unit.*unknown/i);
  assert.ok(
    result.scope.entries[0].readings.every(
      (reading) =>
        reading.kind === "gap" && /legacy.*unit.*unknown/i.test(reading.reason),
    ),
  );
  assert.deepEqual(
    result.scope.entries[1].readings.map(({ unit, kind, ms }) => ({
      unit,
      kind,
      ms,
    })),
    [
      { unit: "case", kind: "point", ms: 200 },
      { unit: "file", kind: "point", ms: 20 },
    ],
  );
  assert.match(result.scope.entries[1].legacyReason, /legacy.*unit.*unknown/i);
  assert.equal(result.scope.entries[2].selected, true);
  assert.ok(
    result.scope.entries[2].readings.every((reading) => reading.kind === "gap"),
  );
});
