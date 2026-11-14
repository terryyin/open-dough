import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { storeOnMachine } from "./landedCiHistoryMachineTest.mjs";

test("new opaque adapter tuple boundaries remain distinct while native GitHub run keys stay unchanged", (t) => {
  const a = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .deliveredAs({ delivery: "a", receipt: "a" })
    .please();
  const b = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: a.revision })
    .deliveredAs({ delivery: "b", receipt: "b" })
    .please();
  const native = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "b".repeat(40) })
    .deliveredAs({ delivery: "native", receipt: "native" })
    .please();
  const first = makeMe.aLandedCiResolution
    .measuring({
      revision: a.revision,
      state: "pass",
      adapterAttempt: { runId: "run/a", attemptId: "b" },
    })
    .please();
  const second = makeMe.aLandedCiResolution
    .measuring({
      revision: b.revision,
      state: "pass",
      adapterAttempt: { runId: "run", attemptId: "a/b" },
    })
    .please();
  const github = makeMe.aLandedCiResolution
    .measuring({
      revision: native.revision,
      state: "pass",
      runId: 41,
      runAttempt: 1,
    })
    .please();
  const history = makeMe.aLandedCiHistory.please();
  const kept = storeOnMachine(
    t,
    history,
    `await keepLandedCiResolution('open-dough',facts.a,facts.first); await keepLandedCiResolution('open-dough',facts.b,facts.second); await keepLandedCiResolution('open-dough',facts.native,facts.github); console.log(JSON.stringify(await readLandedCiHistory('open-dough')));`,
    { a, b, native, first, second, github },
  );
  assert.equal(Object.keys(kept.builds).length, 3);
  assert.notEqual(
    kept.landings.a.observed.build,
    kept.landings.b.observed.build,
  );
  assert.equal(kept.landings.native.observed.build, "run/41/1");
});

test("a numeric adapter subject retains only its matching proof and an accepted summary remains immutable", (t) => {
  const a = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .deliveredAs({ delivery: "a", receipt: "a" })
    .please();
  const resolution = makeMe.aLandedCiResolution
    .measuring({
      revision: a.revision,
      state: "pass",
      adapterAttempt: { runId: 7, attemptId: 3 },
    })
    .please();
  const matching = makeMe.aCiProof
    .forAdapter({ revision: a.revision, attemptId: "3" })
    .entries([makeMe.aCiProofEntry.at("tests").timed(1200).please()])
    .please();
  const wrong = makeMe.aCiProof
    .forAdapter({ revision: "b".repeat(40), attemptId: "3" })
    .entries([makeMe.aCiProofEntry.at("tests").timed(3400).please()])
    .please();
  const replacement = makeMe.aCiProof
    .forAdapter({ revision: a.revision, attemptId: "3" })
    .entries([makeMe.aCiProofEntry.at("tests").timed(9900).please()])
    .please();
  const result = storeOnMachine(
    t,
    makeMe.aLandedCiHistory.please(),
    `const initial=await keepLandedCiResolution('open-dough',facts.a,facts.resolution); const key=initial.landings.a.observed.build; const refused=await keepLandedCiProof('open-dough',key,facts.wrong); await keepLandedCiProof('open-dough',key,facts.matching); const kept=await keepLandedCiProof('open-dough',key,facts.replacement); console.log(JSON.stringify({refused,kept,key}));`,
    { a, resolution, matching, wrong, replacement },
  );
  assert.equal(result.refused.builds[result.key].proof, undefined);
  assert.deepEqual(result.kept.builds[result.key].adapterAttempt, {
    runId: 7,
    attemptId: 3,
  });
  assert.deepEqual(result.kept.builds[result.key].proof, matching);
});
