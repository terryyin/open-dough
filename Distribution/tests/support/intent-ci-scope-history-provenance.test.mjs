import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { scopeHistoryOf } from "../../../dashboard/server/ciScopeHistory.ts";

test("shared equivalent attempts appear once and later-build measurement keeps its true revision and date", () => {
  const older = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .deliveredAs({ delivery: "older", receipt: "older" })
    .receivedAt("2026-11-01T00:00:00Z")
    .please();
  const selected = makeMe.aLaunchLanding
    .comparing({ base: older.revision, revision: "b".repeat(40) })
    .deliveredAs({ delivery: "selected", receipt: "selected" })
    .receivedAt("2026-11-02T00:00:00Z")
    .please();
  const proof = makeMe.aCiProof
    .forRun({ revision: older.revision })
    .entries([makeMe.aCiProofEntry.at("tests").timed(100).please()])
    .please();
  const history = makeMe.aLandedCiHistory
    .recording(
      older,
      "run/1/1",
      makeMe.aKeptBuild
        .with({
          revision: older.revision,
          state: "pass",
          runId: 1,
          runAttempt: 1,
          proof,
        })
        .please(),
    )
    .recording(
      selected,
      "run/1/1",
      makeMe.aKeptBuild
        .with({
          revision: older.revision,
          state: "pass",
          runId: 1,
          runAttempt: 1,
          proof,
        })
        .please(),
      "equivalent",
    )
    .please();
  const read = scopeHistoryOf(
    history,
    "tests",
    { revision: selected.revision, at: selected.receivedAt },
    [older.revision, selected.revision],
  );
  assert.equal(read.entries.length, 1);
  assert.equal(read.entries[0].build.provenance, "equivalent");
  assert.equal(read.entries[0].landings.length, 2);
  assert.equal(read.entries[0].selected, true);
  const later = makeMe.aLandedCiHistory
    .recording(
      selected,
      "run/3/1",
      makeMe.aKeptBuild
        .with({
          revision: "c".repeat(40),
          state: "pass",
          startedAt: "2026-11-03T00:00:00Z",
          proof: makeMe.aCiProof
            .forRun({ revision: "c".repeat(40), runId: 3 })
            .entries([makeMe.aCiProofEntry.at("tests").timed(300).please()])
            .please(),
        })
        .please(),
      "later",
    )
    .please();
  const laterRead = scopeHistoryOf(
    later,
    "tests",
    { revision: selected.revision, at: selected.receivedAt },
    [older.revision, selected.revision],
  );
  assert.equal(laterRead.entries[0].date, "2026-11-03T00:00:00Z");
  assert.equal(laterRead.entries[0].build.revision, "c".repeat(40));
  assert.equal(laterRead.entries[0].build.provenance, "later");
  assert.equal(laterRead.entries[0].landings[0].revision, selected.revision);
});

test("an unselected equivalent receipt keeps its own role when a later distinct attempt is selected", () => {
  const a = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .deliveredAs({ delivery: "a", receipt: "a" })
    .receivedAt("2026-11-01T00:00:00Z")
    .please();
  const p = makeMe.aLaunchLanding
    .comparing({ base: a.revision, revision: "b".repeat(40) })
    .deliveredAs({ delivery: "p", receipt: "p" })
    .receivedAt("2026-11-02T00:00:00Z")
    .please();
  const e = makeMe.aLaunchLanding
    .comparing({ base: p.revision, revision: "c".repeat(40) })
    .deliveredAs({ delivery: "e", receipt: "e" })
    .receivedAt("2026-11-03T00:00:00Z")
    .please();
  const proof = makeMe.aCiProof
    .forRun({ revision: a.revision })
    .entries([makeMe.aCiProofEntry.at("tests").timed(100).please()])
    .please();
  const history = makeMe.aLandedCiHistory
    .inTrunkOrder([a.revision, p.revision, e.revision])
    .recording(
      a,
      "run/1/1",
      makeMe.aKeptBuild
        .with({ revision: a.revision, state: "pass", proof })
        .please(),
    )
    .recording(
      p,
      "run/1/1",
      makeMe.aKeptBuild
        .with({ revision: a.revision, state: "pass", proof })
        .please(),
      "equivalent",
    )
    .recording(
      e,
      "run/3/1",
      makeMe.aKeptBuild
        .with({
          revision: e.revision,
          state: "pass",
          proof: makeMe.aCiProof
            .forRun({ revision: e.revision, runId: 3 })
            .entries([makeMe.aCiProofEntry.at("tests").timed(300).please()])
            .please(),
        })
        .please(),
    )
    .please();
  const read = scopeHistoryOf(
    history,
    "tests",
    { revision: e.revision, at: e.receivedAt },
    history.trunkOrder,
  );
  assert.equal(read.entries.length, 2);
  assert.deepEqual(
    read.entries[0].landings.map((landing) => landing.provenance),
    ["exact", "equivalent"],
  );
  assert.equal(read.entries[0].selected, false);
  assert.equal(read.entries[1].selected, true);
});
