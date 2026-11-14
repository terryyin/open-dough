import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { scopeHistoryOf } from "../../../dashboard/server/ciScopeHistory.ts";

test("a missing endpoint uses evidenced trunk order to retain preceding observations and marks its own collection gap", () => {
  const before = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .deliveredAs({ delivery: "before", receipt: "before" })
    .receivedAt("2026-11-01T00:00:00Z")
    .please();
  const after = makeMe.aLaunchLanding
    .comparing({ base: before.revision, revision: "c".repeat(40) })
    .deliveredAs({ delivery: "after", receipt: "after" })
    .receivedAt("2026-11-03T00:00:00Z")
    .please();
  const history = makeMe.aLandedCiHistory
    .recording(
      before,
      "run/1/1",
      makeMe.aKeptBuild
        .with({
          revision: before.revision,
          state: "pass",
          proof: makeMe.aCiProof
            .forRun({ revision: before.revision })
            .entries([makeMe.aCiProofEntry.at("tests").timed(100).please()])
            .please(),
        })
        .please(),
    )
    .gap(after, "Failed")
    .please();
  const read = scopeHistoryOf(
    history,
    "tests",
    { revision: "b".repeat(40), at: "2026-11-02T00:00:00Z" },
    [before.revision, "b".repeat(40), after.revision],
  );
  assert.equal(read.availability, "uncollected");
  assert.equal(read.entries.length, 2);
  assert.equal(
    read.entries[0].readings.find((reading) => reading.unit === "case")?.ms,
    100,
  );
  assert.match(read.entries[1].reason, /not collected/i);
  assert.equal(read.entries[1].landings[0].revision, "b".repeat(40));
});

test("no recorded history and an evicted endpoint have explicit unavailable states", () => {
  const endpoint = { revision: "a".repeat(40), at: "2026-11-01T00:00:00Z" };
  const empty = scopeHistoryOf(
    makeMe.aLandedCiHistory.please(),
    "tests",
    endpoint,
    [endpoint.revision],
  );
  assert.equal(empty.availability, "empty");
  assert.equal(empty.entries[0].kind, "gap");
  const newer = makeMe.aLaunchLanding
    .comparing({ base: endpoint.revision, revision: "b".repeat(40) })
    .receivedAt("2026-11-02T00:00:00Z")
    .please();
  const history = makeMe.aLandedCiHistory
    .gap(newer, "Failed CI build")
    .please();
  const outside = scopeHistoryOf(history, "tests", endpoint, [
    endpoint.revision,
    newer.revision,
  ]);
  assert.equal(outside.availability, "outside-retention");
  assert.equal(outside.entries.length, 1);
  assert.match(outside.entries[0].reason, /outside the retained history/);
});

test("published trunk order controls the cohort when preparation and receipt dates arrive in reverse order", () => {
  const p = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .deliveredAs({ delivery: "p", receipt: "p" })
    .receivedAt("2026-11-03T00:00:00Z")
    .please();
  const e = makeMe.aLaunchLanding
    .comparing({ base: p.revision, revision: "b".repeat(40) })
    .deliveredAs({ delivery: "e", receipt: "e" })
    .receivedAt("2026-11-02T00:00:00Z")
    .please();
  const r = makeMe.aLaunchLanding
    .comparing({ base: e.revision, revision: "c".repeat(40) })
    .deliveredAs({ delivery: "r", receipt: "r" })
    .receivedAt("2026-11-01T00:00:00Z")
    .please();
  const history = makeMe.aLandedCiHistory
    .inTrunkOrder([p.revision, e.revision, r.revision])
    .recording(
      p,
      "run/1/1",
      makeMe.aKeptBuild
        .with({
          revision: p.revision,
          state: "pass",
          startedAt: "2026-11-01T00:00:00Z",
          proof: makeMe.aCiProof
            .forRun({ revision: p.revision })
            .entries([makeMe.aCiProofEntry.at("tests").timed(100).please()])
            .please(),
        })
        .please(),
    )
    .recording(
      e,
      "run/2/1",
      makeMe.aKeptBuild
        .with({
          revision: e.revision,
          state: "pass",
          startedAt: "2026-11-02T00:00:00Z",
          proof: makeMe.aCiProof
            .forRun({ revision: e.revision, runId: 2 })
            .entries([makeMe.aCiProofEntry.at("tests").timed(200).please()])
            .please(),
        })
        .please(),
    )
    .recording(
      r,
      "run/3/1",
      makeMe.aKeptBuild
        .with({
          revision: r.revision,
          state: "pass",
          startedAt: "2026-11-03T00:00:00Z",
          proof: makeMe.aCiProof
            .forRun({ revision: r.revision, runId: 3 })
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
  assert.deepEqual(
    read.entries.map(
      (entry) => entry.readings.find((reading) => reading.unit === "case")?.ms,
    ),
    [100, 200],
  );
  assert.equal(read.entries[1].selected, true);
  const unsupported = scopeHistoryOf(
    history,
    "tests",
    { revision: e.revision, at: e.receivedAt },
    undefined,
  );
  assert.equal(unsupported.availability, "order-unavailable");
  assert.equal(
    unsupported.entries[0].readings.find((reading) => reading.unit === "case")
      ?.ms,
    200,
  );
  assert.equal(
    unsupported.entries.filter((entry) => entry.kind === "point").length,
    1,
  );
  assert.equal(unsupported.entries.length, 1);
  const partial = scopeHistoryOf(
    history,
    "tests",
    { revision: e.revision, at: e.receivedAt },
    [p.revision, e.revision],
  );
  assert.equal(partial.availability, "order-unavailable");
  assert.deepEqual(
    partial.entries.map(
      (entry) => entry.readings.find((reading) => reading.unit === "case")?.ms,
    ),
    [100, 200],
  );
  assert.equal(JSON.stringify(partial.entries).includes(r.revision), false);
});
