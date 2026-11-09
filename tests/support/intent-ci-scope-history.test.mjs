import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { scopeHistoryOf } from "../../dashboard/server/ciScopeHistory.ts";

test("the exact published endpoint selects the middle landing, keeps zero, and omits a later receipt of the same story", () => {
  const older = makeMe.aLaunchLanding
    .capturedFrom({
      repository: "terryyin/open-dough",
      identity: "SEED-285#trace",
    })
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .deliveredAs({ delivery: "first", receipt: "first" })
    .receivedAt("2026-11-01T00:00:00Z")
    .please();
  const selected = makeMe.aLaunchLanding
    .capturedFrom({
      repository: "terryyin/open-dough",
      identity: "SEED-285#trace",
    })
    .comparing({ base: "a".repeat(40), revision: "b".repeat(40) })
    .deliveredAs({ delivery: "middle", receipt: "middle" })
    .receivedAt("2026-11-02T00:00:00Z")
    .please();
  const later = makeMe.aLaunchLanding
    .capturedFrom({
      repository: "terryyin/open-dough",
      identity: "SEED-285#trace",
    })
    .comparing({ base: "b".repeat(40), revision: "c".repeat(40) })
    .deliveredAs({ delivery: "later", receipt: "later" })
    .receivedAt("2026-11-03T00:00:00Z")
    .please();
  const history = makeMe.aLandedCiHistory
    .recording(older, "run/1/1", {
      revision: older.revision,
      state: "pass",
      startedAt: older.receivedAt,
      proof: makeMe.aCiProof
        .forRun({ revision: older.revision, runId: 1 })
        .entries([
          makeMe.aCiProofEntry
            .at("dashboard/tests")
            .counting(2)
            .timed(1200)
            .please(),
        ])
        .please(),
    })
    .recording(selected, "run/2/1", {
      revision: selected.revision,
      state: "pass",
      startedAt: selected.receivedAt,
      proof: makeMe.aCiProof
        .forRun({ revision: selected.revision, runId: 2 })
        .entries([
          makeMe.aCiProofEntry
            .at("dashboard/tests")
            .counting(2)
            .timed(0)
            .please(),
        ])
        .please(),
    })
    .recording(later, "run/3/1", {
      revision: later.revision,
      state: "pass",
      startedAt: later.receivedAt,
      proof: makeMe.aCiProof
        .forRun({ revision: later.revision, runId: 3 })
        .entries([
          makeMe.aCiProofEntry
            .at("dashboard/tests")
            .counting(2)
            .timed(9900)
            .please(),
        ])
        .please(),
    })
    .please();
  const read = scopeHistoryOf(
    history,
    "dashboard/tests",
    { revision: selected.revision, at: selected.receivedAt },
    [older.revision, selected.revision, later.revision],
  );
  assert.equal(read.availability, "retained");
  assert.deepEqual(
    read.entries.map((entry) => ({
      kind: entry.kind,
      ms: entry.readings.find((reading) => reading.unit === "case")?.ms,
      marked: entry.selected,
    })),
    [
      { kind: "point", ms: 1200, marked: false },
      { kind: "point", ms: 0, marked: true },
    ],
  );
});
