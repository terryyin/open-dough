import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { scopeHistoryOf } from "../../dashboard/server/ciScopeHistory.ts";

test("failed, partial, untimed, missing, invalid and null-unit observations remain distinct nonnumeric gaps", () => {
  const landing = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .receivedAt("2026-11-01T00:00:00Z")
    .please();
  const complete = makeMe.aCiProof
    .forRun({ revision: landing.revision })
    .entries([makeMe.aCiProofEntry.at("tests").timed(100).please()])
    .please();
  const partial = makeMe.aCiProof
    .forRun({ revision: landing.revision })
    .entries([
      makeMe.aCiProofEntry.at("tests").timed(100).missingParts(2).please(),
    ])
    .please();
  const untimed = makeMe.aCiProof
    .forRun({ revision: landing.revision })
    .entries([
      makeMe.aCiProofEntry
        .at("tests")
        .counting(2)
        .timed(100)
        .withUntimed(1)
        .please(),
    ])
    .please();
  const unitless = makeMe.aCiProof
    .forRun({ revision: landing.revision })
    .entries([
      makeMe.aCiProofEntry
        .at("tests")
        .holding(
          makeMe.aCiProofEvidence.legacy(null).counting(2).timed(100).please(),
        )
        .please(),
    ])
    .please();
  const absent = makeMe.aCiProof
    .forRun({ revision: landing.revision })
    .entries([makeMe.aCiProofEntry.at("other").timed(100).please()])
    .please();
  for (const [state, proof, reason] of [
    ["failed", complete, /Failed CI build/],
    ["pass", partial, /part 2 of 2 missing/],
    ["pass", untimed, /1 test case without a duration/],
    ["pass", unitless, /legacy unit unknown/i],
    ["pass", absent, /No matching scope/],
    [
      "pass",
      { kind: "unavailable", reason: "none" },
      /Missing CI proof summary/,
    ],
    ["pass", { kind: "unavailable", reason: "unreadable" }, /Unreadable/],
    ["pass", { kind: "unavailable", reason: "invalid" }, /Invalid/],
    [
      "pass",
      { kind: "unavailable", reason: "mismatched" },
      /identity does not match/,
    ],
  ]) {
    const history = makeMe.aLandedCiHistory
      .recording(
        landing,
        "run/1/1",
        makeMe.aKeptBuild
          .with({
            revision: landing.revision,
            state,
            proof,
          })
          .please(),
      )
      .please();
    const read = scopeHistoryOf(
      history,
      "tests",
      { revision: landing.revision, at: landing.receivedAt },
      [landing.revision],
    );
    assert.equal(read.entries[0].kind, "gap");
    assert.match(
      read.entries[0].readings.find((reading) => reading.unit === "case")
        ?.reason ?? read.entries[0].reason,
      reason,
    );
    assert.ok(
      read.entries[0].readings.every((reading) => reading.kind === "gap"),
    );
    assert.equal("ms" in read.entries[0], false);
  }
});

test("a missing measured-build date remains a gap at the recorded landing, without inventing a build date", () => {
  const landing = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .receivedAt("2026-11-01T00:00:00Z")
    .please();
  const proof = makeMe.aCiProof
    .forRun({ revision: landing.revision })
    .entries([makeMe.aCiProofEntry.at("tests").timed(1200).please()])
    .please();
  const history = makeMe.aLandedCiHistory
    .recording(
      landing,
      "run/1/1",
      makeMe.aKeptBuild
        .with({
          revision: landing.revision,
          state: "pass",
          startedAt: undefined,
          completedAt: undefined,
          proof,
        })
        .please(),
    )
    .please();
  const read = scopeHistoryOf(
    history,
    "tests",
    { revision: landing.revision, at: landing.receivedAt },
    [landing.revision],
  );
  assert.equal(read.entries[0].kind, "gap");
  assert.equal(read.entries[0].reason, "Measured build date unavailable");
  assert.equal("ms" in read.entries[0], false);
});

test("a pending observation preserves its safe attempt link without a measured build or numeric substitute", () => {
  const landing = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .receivedAt("2026-11-01T00:00:00Z")
    .please();
  const history = makeMe.aLandedCiHistory
    .pending(landing, {
      kind: "pending",
      waitsFor: "build",
      run: {
        runId: 51,
        runAttempt: 2,
        runUrl: "https://ci.invalid/runs/51/attempts/2",
      },
    })
    .please();
  const read = scopeHistoryOf(
    history,
    "tests",
    { revision: landing.revision, at: landing.receivedAt },
    [landing.revision],
  );
  assert.equal(read.entries[0].kind, "gap");
  assert.match(read.entries[0].reason, /Pending/);
  assert.deepEqual(read.entries[0].run, {
    runId: 51,
    runAttempt: 2,
    runUrl: "https://ci.invalid/runs/51/attempts/2",
  });
  assert.equal("ms" in read.entries[0], false);
  assert.equal("build" in read.entries[0], false);
});

test("a final proof gap preserves the build the Landed rule named without inventing timing", () => {
  const landing = makeMe.aLaunchLanding
    .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
    .receivedAt("2026-11-01T00:00:00Z")
    .please();
  for (const [reason, provenance] of [
    ["expired", "equivalent"],
    ["unreadable", "later"],
    ["no-proof", "exact"],
  ]) {
    const history = makeMe.aLandedCiHistory
      .unmeasuredLanding({
        ...landing,
        reason,
        build: { revision: "b".repeat(40), provenance, runId: 71 },
      })
      .please();
    const read = scopeHistoryOf(
      history,
      "tests",
      {
        revision: landing.revision,
        at: landing.receivedAt,
      },
      [landing.revision],
    );
    const [entry] = read.entries;
    assert.equal(entry.kind, "gap");
    assert.equal(entry.date, landing.receivedAt);
    assert.deepEqual(entry.build, {
      revision: "b".repeat(40),
      provenance,
      runId: 71,
      runAttempt: 1,
      runUrl: "https://ci.invalid/runs/71",
    });
    assert.equal(entry.landings[0].provenance, provenance);
    assert.deepEqual(entry.readings, []);
    assert.equal("ms" in entry, false);
  }
});
