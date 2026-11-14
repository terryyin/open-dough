import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { storeOnMachine } from "./landedCiHistoryMachineTest.mjs";

test("atomic proof writes preserve classified finality, promote validated summaries and reject late pending or replacement readers", (t) => {
  const landing = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .deliveredAs({ delivery: "kept", receipt: "kept" })
    .please();
  const history = makeMe.aLandedCiHistory
    .measuredLanding({
      receipt: landing.receipt,
      revision: landing.revision,
      receivedAt: landing.receivedAt,
      runId: 41,
      startedAt: "2026-11-09T10:00:00Z",
      completedAt: "2026-11-09T10:01:00Z",
    })
    .inTrunkOrder([landing.revision])
    .please();
  const unavailable = makeMe.aCiProof
    .unavailableBecause("unreadable", "GitHub did not answer")
    .please();
  const corrupt = makeMe.aCiProof
    .unavailableBecause("unreadable", "The archive cannot be opened")
    .please();
  const summary = makeMe.aCiProof
    .forRun({ revision: landing.revision, runId: 41, runAttempt: 1 })
    .entries([makeMe.aCiProofEntry.at("tests").timed(1200).please()])
    .please();
  const replacement = makeMe.aCiProof
    .forRun({ revision: landing.revision, runId: 41, runAttempt: 1 })
    .entries([makeMe.aCiProofEntry.at("tests").timed(9900).please()])
    .please();
  const result = storeOnMachine(
    t,
    history,
    `
    await keepLandedCiProof('open-dough','run/41/1',facts.unavailable,true);
    const pending=await readLandedCiHistory('open-dough');
    await keepLandedCiProof('open-dough','run/41/1',facts.corrupt,false);
    await keepLandedCiProof('open-dough','run/41/1',facts.unavailable,true);
    const settled=await readLandedCiHistory('open-dough');
    await keepLandedCiProof('open-dough','run/41/1',facts.summary,false);
    await keepLandedCiProof('open-dough','run/41/1',facts.unavailable,true);
    await keepLandedCiProof('open-dough','run/41/1',facts.replacement,false);
    console.log(JSON.stringify({pending,settled,kept:await readLandedCiHistory('open-dough')}));
  `,
    { unavailable, corrupt, summary, replacement },
  );
  assert.equal(result.pending.builds["run/41/1"].proofPending, true);
  assert.equal(result.settled.builds["run/41/1"].proofPending, false);
  assert.deepEqual(result.settled.builds["run/41/1"].proof, corrupt);
  assert.equal(result.kept.builds["run/41/1"].proofPending, false);
  assert.deepEqual(result.kept.builds["run/41/1"].proof, summary);
  assert.deepEqual(result.kept.landings, history.landings);
});
