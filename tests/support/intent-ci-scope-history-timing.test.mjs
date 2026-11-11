import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { scopeHistoryOf } from "../../dashboard/server/ciScopeHistory.ts";

test("a missing terminal proof retains earlier unit segments and distinct gaps without numeric substitutes", () => {
  const first = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .deliveredAs({ delivery: "first", receipt: "first" })
    .receivedAt("2026-11-01T00:00:00Z")
    .please();
  const second = makeMe.aLaunchLanding
    .comparing({ base: first.revision, revision: "b".repeat(40) })
    .deliveredAs({ delivery: "second", receipt: "second" })
    .receivedAt("2026-11-02T00:00:00Z")
    .please();
  const terminal = makeMe.aLaunchLanding
    .comparing({ base: second.revision, revision: "c".repeat(40) })
    .deliveredAs({ delivery: "terminal", receipt: "terminal" })
    .receivedAt("2026-11-03T00:00:00Z")
    .please();
  const history = makeMe.aLandedCiHistory
    .recording(
      first,
      "run/1/1",
      makeMe.aKeptBuild
        .with({
          revision: first.revision,
          state: "pass",
          proof: makeMe.aCiProof
            .forRun({ revision: first.revision })
            .entries([
              makeMe.aCiProofEntry
                .at("tests")
                .counting(2, "file")
                .timed(100)
                .please(),
            ])
            .please(),
        })
        .please(),
    )
    .recording(
      second,
      "run/2/1",
      makeMe.aKeptBuild
        .with({
          revision: second.revision,
          state: "pass",
          proof: makeMe.aCiProof
            .forRun({ revision: second.revision, runId: 2 })
            .entries([
              makeMe.aCiProofEntry
                .at("tests")
                .counting(2, "case")
                .timed(200)
                .please(),
            ])
            .please(),
        })
        .please(),
    )
    .recording(
      terminal,
      "run/3/1",
      makeMe.aKeptBuild
        .with({
          revision: terminal.revision,
          state: "pass",
          proof: { kind: "unavailable", reason: "expired" },
        })
        .please(),
    )
    .please();
  const read = scopeHistoryOf(
    history,
    "tests",
    { revision: terminal.revision, at: terminal.receivedAt },
    [first.revision, second.revision, terminal.revision],
  );
  assert.deepEqual(
    read.entries.map((entry) => entry.kind),
    ["point", "point", "gap"],
  );
  assert.deepEqual(
    read.entries[0].readings.map(({ unit, kind, ms }) => ({ unit, kind, ms })),
    [
      { unit: "case", kind: "gap", ms: undefined },
      { unit: "file", kind: "point", ms: 100 },
    ],
  );
  assert.deepEqual(
    read.entries[1].readings.map(({ unit, kind, ms }) => ({ unit, kind, ms })),
    [
      { unit: "case", kind: "point", ms: 200 },
      { unit: "file", kind: "gap", ms: undefined },
    ],
  );
  assert.equal(read.entries[0].readings[1].segment, "1");
  assert.equal(read.entries[1].readings[0].segment, "1");
  assert.match(read.entries[2].reason, /expired/i);
  assert.equal("ms" in read.entries[2], false);
  assert.equal(read.entries[2].selected, true);
  const unitless = makeMe.aLandedCiHistory
    .recording(first, "run/1/1", history.builds["run/1/1"])
    .recording(second, "run/2/1", history.builds["run/2/1"])
    .recording(
      terminal,
      "run/3/1",
      makeMe.aKeptBuild
        .with({
          revision: terminal.revision,
          state: "pass",
          proof: makeMe.aCiProof
            .forRun({ revision: terminal.revision, runId: 3 })
            .entries([
              makeMe.aCiProofEntry
                .at("tests")
                .holding(
                  makeMe.aCiProofEvidence
                    .legacy("test cases")
                    .counting(2)
                    .timed(300)
                    .please(),
                )
                .please(),
            ])
            .please(),
        })
        .please(),
    )
    .please();
  const missingUnit = scopeHistoryOf(
    unitless,
    "tests",
    { revision: terminal.revision, at: terminal.receivedAt },
    [first.revision, second.revision, terminal.revision],
  );
  assert.deepEqual(
    missingUnit.entries.map((entry) => entry.kind),
    ["point", "point", "gap"],
  );
  assert.match(missingUnit.entries[2].reason, /legacy unit unknown/i);
  assert.ok(
    missingUnit.entries[2].readings.every(
      (reading) =>
        reading.kind === "gap" && /legacy unit unknown/i.test(reading.reason),
    ),
  );
  assert.equal(missingUnit.entries[0].readings[1].ms, 100);
  assert.equal(missingUnit.entries[1].readings[0].ms, 200);
  const onlyCase = makeMe.aLandedCiHistory
    .recording(first, "run/1/1", history.builds["run/1/1"])
    .recording(second, "run/2/1", history.builds["run/2/1"])
    .recording(
      terminal,
      "run/3/1",
      makeMe.aKeptBuild
        .with({
          revision: terminal.revision,
          state: "pass",
          proof: makeMe.aCiProof
            .forRun({ revision: terminal.revision, runId: 3 })
            .entries([
              makeMe.aCiProofEntry
                .at("tests")
                .counting(2, "case")
                .timed(300)
                .please(),
            ])
            .please(),
        })
        .please(),
    )
    .please();
  const terminalUnitGap = scopeHistoryOf(
    onlyCase,
    "tests",
    { revision: terminal.revision, at: terminal.receivedAt },
    [first.revision, second.revision, terminal.revision],
  );
  assert.equal(terminalUnitGap.entries[0].readings[1].ms, 100);
  assert.equal(terminalUnitGap.entries[2].readings[0].ms, 300);
  assert.equal(terminalUnitGap.entries[2].readings[1].kind, "gap");
  assert.match(
    terminalUnitGap.entries[2].readings[1].reason,
    /No declared test files evidence/,
  );
  assert.equal(terminalUnitGap.entries[2].selected, true);
});

test("selected entry and unit evidence reject an unsupported older owner while entry-only totals remain measurable", () => {
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
  const history = makeMe.aLandedCiHistory
    .recording(
      older,
      "run/1/1",
      makeMe.aKeptBuild
        .with({
          revision: older.revision,
          state: "pass",
          proof: makeMe.aCiProof
            .forRun({ revision: older.revision })
            .entries([
              makeMe.aCiProofEntry
                .at("tests")
                .counting(2, "case")
                .timed(100)
                .please(),
            ])
            .please(),
        })
        .please(),
    )
    .recording(
      selected,
      "run/2/1",
      makeMe.aKeptBuild
        .with({
          revision: selected.revision,
          state: "pass",
          proof: makeMe.aCiProof
            .forRun({ revision: selected.revision, runId: 2 })
            .entries([
              makeMe.aCiProofEntry
                .at("tests/sub")
                .counting(2, "case")
                .timed(200)
                .please(),
            ])
            .please(),
        })
        .please(),
    )
    .please();
  const read = scopeHistoryOf(
    history,
    "tests/sub",
    { revision: selected.revision, at: selected.receivedAt },
    [older.revision, selected.revision],
  );
  assert.match(
    read.entries[0].readings[0].reason,
    /owning entry or counted unit changed/,
  );
  assert.equal("ms" in read.entries[0], false);
  assert.equal(read.entries[1].readings[0].ms, 200);
});
