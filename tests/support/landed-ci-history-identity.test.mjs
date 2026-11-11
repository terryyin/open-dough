import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { storeOnMachine } from "./landedCiHistoryMachineTest.mjs";

test("a supported legacy exact adapter build is retained once when new equivalent and later landings reuse its full subject", (t) => {
  const a = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .deliveredAs({ delivery: "a", receipt: "a" })
    .please();
  const p = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "b".repeat(40) })
    .deliveredAs({ delivery: "p", receipt: "p" })
    .please();
  const later = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "c".repeat(40) })
    .deliveredAs({ delivery: "later", receipt: "later" })
    .please();
  const attemptId = 'attempt/#"opaque';
  const proof = makeMe.aCiProof
    .forAdapter({ revision: a.revision, attemptId })
    .entries([makeMe.aCiProofEntry.at("tests").timed(1200).please()])
    .please();
  const build = makeMe.aKeptBuild
    .with({
      revision: a.revision,
      state: "pass",
      adapterAttempt: { runId: "run/a", attemptId },
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:01:00Z",
      proof,
    })
    .please();
  const history = makeMe.aLandedCiHistory
    .recording(a, `attempt/${attemptId}`, build)
    .inTrunkOrder([a.revision, p.revision, later.revision])
    .please();
  const result = storeOnMachine(
    t,
    history,
    `const first=await readLandedCiHistory('open-dough'); const bytesAfterRead=JSON.parse(readFileSync(process.env.HOME+'/.open-dough/dashboard/landed-ci-history.json','utf8')); await keepLandedCiResolution('open-dough',facts.p,facts.equivalent,facts.order); await keepLandedCiResolution('open-dough',facts.later,facts.laterResolution,facts.order); const kept=await readLandedCiHistory('open-dough'); console.log(JSON.stringify({first,bytesAfterRead,kept,scope:scopeHistoryOf(kept,'tests',{revision:facts.later.revision,at:facts.later.receivedAt},kept.trunkOrder)}));`,
    {
      p,
      later,
      order: [a.revision, p.revision, later.revision],
      equivalent: makeMe.aLandedCiResolution
        .measuring(build, "equivalent")
        .please(),
      laterResolution: makeMe.aLandedCiResolution
        .measuring(build, "later")
        .please(),
    },
  );
  assert.equal(Object.keys(result.first.builds).length, 1);
  assert.equal(
    Object.keys(result.first.builds)[0].startsWith("adapter/"),
    true,
  );
  assert.deepEqual(
    result.bytesAfterRead["open-dough"],
    history,
    "local reading does not rewrite the machine store",
  );
  assert.equal(Object.keys(result.kept.builds).length, 1);
  const references = Object.values(result.kept.landings).map(
    (landing) => landing.observed.build,
  );
  assert.equal(new Set(references).size, 1);
  assert.deepEqual(Object.values(result.kept.builds)[0].proof, proof);
  assert.equal(result.scope.entries.length, 1);
  assert.equal(
    result.scope.entries[0].readings.find((reading) => reading.unit === "case")
      ?.ms,
    1200,
  );
  assert.deepEqual(
    result.scope.entries[0].landings.map((landing) => landing.provenance),
    ["exact", "equivalent", "later"],
  );
});

test("legacy adapter collisions retain the compatible exact build and explain mismatched exact and unprovable non-exact references as gaps", (t) => {
  const a = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .deliveredAs({ delivery: "a", receipt: "a" })
    .please();
  const b = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "b".repeat(40) })
    .deliveredAs({ delivery: "b", receipt: "b" })
    .please();
  const p = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "c".repeat(40) })
    .deliveredAs({ delivery: "p", receipt: "p" })
    .please();
  const proof = makeMe.aCiProof
    .forAdapter({ revision: b.revision, attemptId: "reused" })
    .entries([makeMe.aCiProofEntry.at("tests").timed(3400).please()])
    .please();
  const build = makeMe.aKeptBuild
    .with({
      revision: b.revision,
      state: "pass",
      adapterAttempt: { runId: "later-run", attemptId: "reused" },
      startedAt: "2026-11-06T10:00:00Z",
      proof,
    })
    .please();
  const history = makeMe.aLandedCiHistory
    .recording(a, "attempt/reused", build)
    .recording(b, "attempt/reused", build)
    .recording(p, "attempt/reused", build, "equivalent")
    .inTrunkOrder([a.revision, b.revision, p.revision])
    .please();
  const result = storeOnMachine(
    t,
    history,
    `const kept=await readLandedCiHistory('open-dough'); console.log(JSON.stringify({kept,scope:scopeHistoryOf(kept,'tests',{revision:facts.p.revision,at:facts.p.receivedAt},kept.trunkOrder)}));`,
    { p },
  );
  assert.equal(result.kept.landings.a.observed.kind, "gap");
  assert.equal(result.kept.landings.a.observed.reason, "identity");
  assert.match(
    result.kept.landings.a.observed.explanation,
    /adapter.*identity/i,
  );
  assert.equal(result.kept.landings.b.observed.kind, "build");
  assert.equal(result.kept.landings.p.observed.kind, "gap");
  assert.equal(result.kept.landings.p.observed.reason, "identity");
  assert.match(
    result.kept.landings.p.observed.explanation,
    /adapter.*identity/i,
  );
  assert.deepEqual(
    result.scope.entries.map((entry) => entry.kind),
    ["gap", "point", "gap"],
  );
  assert.deepEqual(
    result.scope.entries.map(
      (entry) => entry.readings.find((reading) => reading.unit === "case")?.ms,
    ),
    [undefined, 3400, undefined],
  );
});

for (const variant of ["ambiguous", "mismatched-proof"]) {
  test(`legacy adapter ${variant} evidence remains an explained identity gap`, (t) => {
    const a = makeMe.aLaunchLanding
      .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
      .deliveredAs({ delivery: "a", receipt: "a" })
      .please();
    const proof = makeMe.aCiProof
      .forAdapter({
        revision: variant === "mismatched-proof" ? "b".repeat(40) : a.revision,
        attemptId: "old",
      })
      .entries([makeMe.aCiProofEntry.at("tests").timed(1200).please()])
      .please();
    const build = makeMe.aKeptBuild
      .with({
        revision: a.revision,
        state: "pass",
        adapterAttempt: {
          runId: "run",
          attemptId: "old",
          ...(variant === "ambiguous" ? { ambiguous: true } : {}),
        },
        startedAt: "2026-11-05T10:00:00Z",
        proof,
      })
      .please();
    const history = makeMe.aLandedCiHistory
      .recording(a, "attempt/old", build)
      .inTrunkOrder([a.revision])
      .please();
    const kept = storeOnMachine(
      t,
      history,
      `console.log(JSON.stringify(await readLandedCiHistory('open-dough')));`,
    );
    assert.equal(kept.landings.a.observed.kind, "gap");
    assert.equal(kept.landings.a.observed.reason, "identity");
    assert.match(kept.landings.a.observed.explanation, /adapter.*identity/i);
  });
}
