import assert from "node:assert/strict";
import { test } from "node:test";
import { historyWallTimeMs } from "../../../dashboard/src/landedCiHistory.ts";
import { makeMe } from "./makeMe.mjs";
import { storeOnMachine } from "./landedCiHistoryMachineTest.mjs";

test("stored v1 and v2 proof with an old gap keep the retained build and valid proof through an atomic write", (t) => {
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
    .recording(
      legacy,
      "run/1/1",
      makeMe.aKeptBuild
        .with({
          revision: legacy.revision,
          state: "pass",
          runId: 1,
          runAttempt: 1,
          startedAt: legacy.receivedAt,
          completedAt: "2026-11-01T00:01:00Z",
        })
        .please(),
    )
    .recording(
      modern,
      "run/2/1",
      makeMe.aKeptBuild
        .with({
          revision: modern.revision,
          state: "pass",
          runId: 2,
          runAttempt: 1,
          startedAt: modern.receivedAt,
          proof: modernProof,
        })
        .please(),
    )
    .gap(missing, "The older collector could not establish this result.")
    .please();
  // As the old collector wrote one result, with its unit label.
  const legacySummary = JSON.parse(
    `{"schemaVersion":1,"repository":"terryyin/open-dough","runId":1,"runAttempt":1,"revision":"${legacy.revision}","entries":[{"path":"tests","unit":"test cases","passed":1,"failed":0,"other":0,"parts":[{"part":1,"status":"present","passed":1,"failed":0,"other":0}]}]}`,
  );
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
  const expected = result.first.builds["run/1/1"].proof;
  assert.equal(expected.kind, "unavailable");
  assert.equal(expected.reason, "invalid");
  assert.match(expected.detail, /schemaVersion is not 2/);
  assert.equal(
    historyWallTimeMs(
      result.kept.builds["run/1/1"].startedAt,
      result.kept.builds["run/1/1"].completedAt,
    ),
    60_000,
  );
  assert.deepEqual(result.disk["open-dough"].builds["run/1/1"].proof, expected);
  assert.deepEqual(result.kept.builds["run/2/1"].proof, modernProof);
  assert.equal(result.kept.landings.missing.observed.reason, "unclassified");
  assert.equal(result.scope.entries.length, 3);
  assert.equal(result.scope.entries[0].kind, "gap");
  assert.deepEqual(
    result.scope.entries[0].readings.map((reading) => reading.unit),
    ["case", "file"],
  );
  assert.equal(result.scope.entries[0].reason, "Invalid CI proof summary");
  assert.ok(
    result.scope.entries[0].readings.every(
      (reading) =>
        reading.kind === "gap" && reading.reason === "Invalid CI proof summary",
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
  assert.equal(result.scope.entries[2].selected, true);
  assert.ok(
    result.scope.entries[2].readings.every((reading) => reading.kind === "gap"),
  );
});

for (const [name, corrupt, detail] of [
  [
    "missing summary payload",
    () => ({ kind: "summary" }),
    /summary is not a JSON object/,
  ],
  [
    "a retired unit beside declared evidence",
    (proof) => {
      const wireProof = structuredClone(proof);
      const evidence = wireProof.summary.entries[0].evidence;
      evidence.push({ ...evidence[0], unit: "legacy", label: "checks" });
      return wireProof;
    },
    /entries\[0\]\.evidence\[1\]\.unit is not case, file/,
  ],
  [
    "malformed fields on an unreported part",
    (proof) => {
      const wireProof = structuredClone(proof);
      wireProof.summary.entries[0].evidence[0].parts[0] = {
        part: 1,
        status: "missing",
        passed: "invalid",
      };
      return wireProof;
    },
    /at summary/,
  ],
]) {
  test(`history keeps measured builds and their neighbours through a write with ${name}`, (t) => {
    const earlier = makeMe.aLaunchLanding
      .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
      .deliveredAs({ delivery: "earlier", receipt: "earlier" })
      .please();
    const later = makeMe.aLaunchLanding
      .comparing({ base: earlier.revision, revision: "b".repeat(40) })
      .deliveredAs({ delivery: "later", receipt: "later" })
      .please();
    const proofOf = (landing, runId) =>
      makeMe.aCiProof
        .forRun({ revision: landing.revision, runId })
        .entries([makeMe.aCiProofEntry.at("tests").timed(200).please()])
        .please();
    const validProof = proofOf(later, 2);
    const history = makeMe.aLandedCiHistory
      .measuredLanding({
        ...earlier,
        runId: 1,
        startedAt: "2026-11-01T00:00:00Z",
        completedAt: "2026-11-01T00:01:00Z",
      })
      .measuredLanding({ ...later, runId: 2 })
      .proofFor("run/2/1", validProof)
      .please();
    history.builds["run/1/1"].proof = corrupt(proofOf(earlier, 1));
    const order = [earlier.revision, later.revision];
    const { first, kept, disk } = storeOnMachine(
      t,
      history,
      `
      const first=await readLandedCiHistory('open-dough');
      await keepLandedCiOrder('open-dough',facts.order);
      const kept=await readLandedCiHistory('open-dough');
      const disk=JSON.parse(readFileSync(process.env.HOME+'/.open-dough/dashboard/landed-ci-history.json','utf8'))['open-dough'];
      console.log(JSON.stringify({first,kept,disk}));
    `,
      { order },
    );
    for (const record of [first, kept, disk]) {
      assert.equal(record.landings[earlier.receipt].observed.build, "run/1/1");
      const build = record.builds["run/1/1"];
      assert.equal(build.revision, earlier.revision);
      assert.equal(
        historyWallTimeMs(build.startedAt, build.completedAt),
        60_000,
      );
      assert.equal(build.proof.kind, "unavailable");
      assert.equal(build.proof.reason, "invalid");
      assert.match(build.proof.detail, detail);
      assert.deepEqual(record.builds["run/2/1"].proof, validProof);
    }
    assert.deepEqual(kept.trunkOrder, order);
  });
}
