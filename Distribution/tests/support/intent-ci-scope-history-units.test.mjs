import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { scopeHistoryOf } from "../../../dashboard/server/ciScopeHistory.ts";
import { ciScopeHistorySchema } from "../../../dashboard/src/ciScopeHistory.ts";

test("each declared unit keeps its own values and segments across partial, untimed and legacy evidence", () => {
  const evidence = [
    [
      makeMe.aCiProofEvidence
        .legacy("test cases")
        .counting(9)
        .timed(9000)
        .please(),
      makeMe.aCiProofEvidence.inUnit("file").counting(1).timed(10).please(),
      makeMe.aCiProofEvidence.inUnit("case").counting(2).timed(100).please(),
    ],
    [
      makeMe.aCiProofEvidence
        .inUnit("case")
        .counting(2)
        .timed(200)
        .missingPart(2)
        .please(),
      makeMe.aCiProofEvidence.inUnit("file").counting(1).timed(20).please(),
    ],
    [
      makeMe.aCiProofEvidence.inUnit("case").counting(2).timed(300).please(),
      makeMe.aCiProofEvidence
        .inUnit("file")
        .counting(2)
        .timed(30)
        .withUntimed(1)
        .please(),
    ],
    [
      makeMe.aCiProofEvidence.inUnit("case").counting(2).timed(400).please(),
      makeMe.aCiProofEvidence.inUnit("file").counting(2).please(),
    ],
    [
      makeMe.aCiProofEvidence
        .legacy("test cases")
        .counting(9)
        .timed(9000)
        .please(),
    ],
    [
      makeMe.aCiProofEvidence.inUnit("file").counting(1).timed(50).please(),
      makeMe.aCiProofEvidence.inUnit("case").counting(2).timed(0).please(),
    ],
  ];
  const history = makeMe.aLandedCiHistory;
  const landings = evidence.map((results, index) => {
    const runId = index + 1;
    const revision = runId.toString(16).repeat(40);
    const landing = makeMe.aLaunchLanding
      .comparing({ base: index.toString(16).repeat(40), revision })
      .deliveredAs({ delivery: `units-${runId}`, receipt: `units-${runId}` })
      .receivedAt(`2026-11-0${runId}T00:00:00Z`)
      .please();
    history.recording(
      landing,
      `run/${runId}/1`,
      makeMe.aKeptBuild
        .with({
          revision,
          state: "pass",
          runId,
          runAttempt: 1,
          proof: makeMe.aCiProof
            .forRun({ revision, runId })
            .entries([
              makeMe.aCiProofEntry
                .at("tests")
                .holding(...results)
                .please(),
            ])
            .please(),
        })
        .please(),
    );
    return landing;
  });
  const selected = landings.at(-1);
  const answer = scopeHistoryOf(
    history.please(),
    "tests",
    {
      revision: selected.revision,
      at: selected.receivedAt,
    },
    landings.map(({ revision }) => revision),
  );
  assert.equal(ciScopeHistorySchema.safeParse(answer).success, true);
  assert.equal(answer.entries.length, 6);
  assert.ok(answer.entries.every((entry) => entry.readings.length === 2));
  const cases = answer.entries.map((entry) =>
    entry.readings.find((reading) => reading.unit === "case"),
  );
  const files = answer.entries.map((entry) =>
    entry.readings.find((reading) => reading.unit === "file"),
  );
  assert.deepEqual(
    cases.map((reading) => (reading.kind === "point" ? reading.ms : "gap")),
    [100, "gap", 300, 400, "gap", 0],
  );
  assert.deepEqual(
    files.map((reading) => (reading.kind === "point" ? reading.ms : "gap")),
    [10, 20, "gap", "gap", "gap", 50],
  );
  assert.deepEqual(
    cases.map((reading) => (reading.kind === "point" ? reading.segment : null)),
    ["1", null, "2", "2", null, "3"],
  );
  assert.deepEqual(
    files.map((reading) => (reading.kind === "point" ? reading.segment : null)),
    ["1", "1", null, null, null, "2"],
  );
  assert.match(cases[1].reason, /part 2 of 2 missing/);
  assert.match(files[2].reason, /1 test file without a duration/);
  assert.match(files[3].reason, /no test execution durations/);
  assert.match(answer.entries[0].legacyReason, /legacy unit unknown/i);
  assert.equal(answer.entries[4].kind, "gap");
  assert.match(answer.entries[4].reason, /legacy unit unknown/i);
  assert.ok(
    answer.entries[4].readings.every((reading) =>
      /legacy unit unknown/i.test(reading.reason),
    ),
  );
  assert.equal(answer.entries[5].selected, true);
  assert.ok(answer.entries.every((entry) => !("ms" in entry)));
});

test("declared-unit scope absence, missing breakdown and absent unit remain different gaps beside supported scope timing", () => {
  const results = [
    [
      makeMe.aCiProofEvidence
        .inUnit("case")
        .brokenDown({ path: "tests/sub/a.spec.ts", passed: 2, durationMs: 0 })
        .please(),
      makeMe.aCiProofEvidence
        .inUnit("file")
        .brokenDown({ path: "tests/sub/a.spec.ts", passed: 1, durationMs: 10 })
        .please(),
    ],
    [
      makeMe.aCiProofEvidence
        .inUnit("case")
        .brokenDown({ path: "tests/sub/a.spec.ts", passed: 2, durationMs: 20 })
        .please(),
      makeMe.aCiProofEvidence
        .inUnit("file")
        .brokenDown({
          path: "tests/else/b.spec.ts",
          passed: 1,
          durationMs: 200,
        })
        .please(),
    ],
    [
      makeMe.aCiProofEvidence
        .inUnit("case")
        .brokenDown({ path: "tests/sub/a.spec.ts", passed: 2, durationMs: 30 })
        .please(),
      makeMe.aCiProofEvidence.inUnit("file").counting(1).timed(300).please(),
    ],
    [
      makeMe.aCiProofEvidence
        .inUnit("case")
        .brokenDown({ path: "tests/sub/a.spec.ts", passed: 2, durationMs: 40 })
        .please(),
    ],
  ];
  const history = makeMe.aLandedCiHistory;
  const landings = results.map((evidence, index) => {
    const runId = index + 1;
    const revision = runId.toString(16).repeat(40);
    const landing = makeMe.aLaunchLanding
      .comparing({ base: index.toString(16).repeat(40), revision })
      .deliveredAs({ delivery: `scope-${runId}`, receipt: `scope-${runId}` })
      .receivedAt(`2026-11-0${runId}T00:00:00Z`)
      .please();
    history.recording(
      landing,
      `run/${runId}/1`,
      makeMe.aKeptBuild
        .with({
          revision,
          state: "pass",
          runId,
          runAttempt: 1,
          proof: makeMe.aCiProof
            .forRun({ revision, runId })
            .entries([
              makeMe.aCiProofEntry
                .at("tests")
                .holding(...evidence)
                .please(),
            ])
            .please(),
        })
        .please(),
    );
    return landing;
  });
  const selected = landings.at(-1);
  const answer = scopeHistoryOf(
    history.please(),
    "tests/sub",
    {
      revision: selected.revision,
      at: selected.receivedAt,
    },
    landings.map(({ revision }) => revision),
  );
  assert.equal(ciScopeHistorySchema.safeParse(answer).success, true);
  assert.equal(answer.entries.length, 4);
  const cases = answer.entries.map((entry) =>
    entry.readings.find((reading) => reading.unit === "case"),
  );
  const files = answer.entries.map((entry) =>
    entry.readings.find((reading) => reading.unit === "file"),
  );
  assert.deepEqual(
    cases.map((reading) => ({ ms: reading.ms, segment: reading.segment })),
    [
      { ms: 0, segment: "1" },
      { ms: 20, segment: "1" },
      { ms: 30, segment: "1" },
      { ms: 40, segment: "1" },
    ],
  );
  assert.equal(files[0].ms, 10);
  assert.deepEqual(
    files.slice(1).map((reading) => reading.kind),
    ["gap", "gap", "gap"],
  );
  assert.match(files[1].reason, /No matching scope/);
  assert.match(files[2].reason, /No file breakdown/);
  assert.match(files[3].reason, /No declared test files evidence/);
  assert.ok(answer.entries.every((entry) => entry.kind === "point"));
  assert.equal(answer.entries[3].selected, true);
});
