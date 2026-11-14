import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import {
  wallTimeReferenceOf,
  wallTimeReadingOf,
} from "../../../dashboard/server/ciWallTimeReference.ts";

const rev = (n) => n.toString(16).padStart(40, "0");
const landing = (n) =>
  makeMe.aLaunchLanding
    .comparing({ base: rev(0), revision: rev(n) })
    .deliveredAs({ delivery: String(n), receipt: String(n) })
    .receivedAt(`2026-11-${String(20 - n).padStart(2, "0")}T10:00:00Z`)
    .please();
const build = (n, ms = 100, measuredRevision = n, facts = {}) => {
  const startedAt = `2026-11-${String(20 - n).padStart(2, "0")}T10:00:00Z`;
  const key = `run/${n}/1`;
  return makeMe.aLandedCiHistory
    .recording(
      landing(n),
      key,
      makeMe.aKeptBuild
        .with({
          revision: rev(measuredRevision),
          state: "pass",
          runId: n,
          runAttempt: 1,
          startedAt,
          completedAt: new Date(Date.parse(startedAt) + ms).toISOString(),
          proof: makeMe.aCiProof
            .forRun({ revision: rev(measuredRevision), runId: n })
            .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
            .please(),
          ...facts,
        })
        .please(),
    )
    .please().builds[key];
};

test("shared selected attempt is excluded everywhere, shared prior attempt is counted once, and future proxy cannot be prior", () => {
  const history = makeMe.aLandedCiHistory
    .inTrunkOrder([1, 2, 3, 4, 5, 6, 7, 8, 9].map(rev))
    .recording(landing(1), "run/1/1", build(1))
    .recording(landing(2), "run/1/1", build(1), "equivalent")
    .recording(landing(3), "run/7/1", build(7), "later")
    .recording(landing(4), "run/8/1", build(8, 100, 7), "later")
    .recording(landing(5), "run/9/1", build(9), "later")
    .recording(landing(6), "run/6/1", build(6))
    .recording(landing(7), "run/7/1", build(7), "equivalent")
    .please();
  const result = wallTimeReferenceOf(history, rev(7), history.trunkOrder);
  assert.equal(result.selected.key, "run/7/1");
  assert.equal(result.selected.ms, 100);
  assert.equal(result.sampleCount, 2);
  assert.equal(
    result.evidence.filter((sample) => sample.key === "run/1/1").length,
    1,
  );
  assert.equal(
    result.evidence.find((sample) => sample.key === "run/7/1").status,
    "selected",
  );
  for (const key of ["run/8/1", "run/9/1"])
    assert.match(
      result.evidence.find((sample) => sample.key === key).reason,
      /at or after/,
    );
  assert.equal(result.evidence[0].date, "2026-11-19T10:00:00Z");
  // Build dates run backwards; trunk order still selected revision 7.
  assert.equal(wallTimeReferenceOf(history).endpoint, rev(7));
});

test("measured revisions between recorded landings use shared revision order and unknown order is an explained exclusion", () => {
  const history = makeMe.aLandedCiHistory
    .inTrunkOrder([rev(1), rev(3), rev(5)])
    .recording(landing(1), "run/2/1", build(2), "later")
    .recording(landing(3), "run/4/1", build(4), "later")
    .recording(landing(5), "run/5/1", build(5))
    .please();
  const known = wallTimeReferenceOf(history, rev(3), [1, 2, 3, 4, 5].map(rev));
  assert.equal(known.sampleCount, 1);
  assert.equal(known.evidence[0].status, "included");
  const unknown = wallTimeReferenceOf(history, rev(3), history.trunkOrder);
  assert.equal(unknown.sampleCount, 0);
  assert.match(
    unknown.evidence[0].reason,
    /Measured revision order unavailable/,
  );
  const selectedLater = wallTimeReferenceOf(
    history,
    rev(1),
    [1, 2, 3, 4, 5].map(rev),
  );
  assert.equal(selectedLater.selected.ms, 100);
  assert.equal(selectedLater.sampleCount, 0);
});

test("failed, pending, missing and invalid bounds stay reasons, never numeric zero replacements", () => {
  const complete = build(1);
  assert.equal(
    wallTimeReadingOf(build(1, 100, 1, { state: "failed" })).ms,
    undefined,
  );
  assert.match(
    wallTimeReadingOf(build(1, 100, 1, { state: "failed" })).reason,
    /Failed/,
  );
  assert.match(
    wallTimeReadingOf({ ...complete, completedAt: "2026-10-01T00:00:00Z" })
      .reason,
    /bounds/,
  );
  assert.match(
    wallTimeReadingOf({ ...complete, startedAt: "garbage" }).reason,
    /bounds/,
  );
  assert.match(
    wallTimeReadingOf(
      build(1, 100, 1, { proof: undefined, proofPending: true }),
    ).reason,
    /pending/,
  );
  assert.match(
    wallTimeReadingOf(
      build(1, 100, 1, {
        proof: makeMe.aCiProof.unavailableBecause("expired").please(),
      }),
    ).reason,
    /expired/,
  );
  const history = makeMe.aLandedCiHistory
    .inTrunkOrder([1, 2, 3, 4].map(rev))
    .failedLanding({
      receipt: "1",
      revision: rev(1),
      receivedAt: complete.startedAt,
      runId: 1,
      startedAt: complete.startedAt,
      completedAt: complete.completedAt,
    })
    .pending(landing(2), { kind: "pending", waitsFor: "build" })
    .gap(landing(3), "Published proof is missing", "no-proof")
    .recording(landing(4), "run/4/1", build(4))
    .please();
  const result = wallTimeReferenceOf(history);
  assert.equal(result.sampleCount, 0);
  assert.match(result.evidence[0].reason, /Failed/);
  assert.match(result.evidence[1].reason, /Pending/);
  assert.match(result.evidence[2].reason, /No CI proof summary/);
  assert.equal(result.evidence.filter((sample) => sample.ms === 0).length, 0);
});

test("the latest represented pending landing retains a usable reference rather than selecting the last measured point", () => {
  const builder = makeMe.aLandedCiHistory.inTrunkOrder(
    [1, 2, 3, 4, 5, 6].map(rev),
  );
  for (const n of [1, 2, 3, 4, 5])
    builder.recording(landing(n), `run/${n}/1`, build(n));
  const history = builder
    .pending(landing(6), { kind: "pending", waitsFor: "build" })
    .please();
  const result = wallTimeReferenceOf(history);
  assert.equal(result.endpoint, rev(6));
  assert.equal(result.averageMs, 100);
  assert.equal(result.sampleCount, 5);
  assert.match(result.selected.reason, /Pending.*queued or running/);
  assert.equal(result.selected.ms, undefined);
  assert.equal(result.difference, undefined);
});

test("invalid measured dates retain their bounds reason and use the recorded landing date for readable evidence", () => {
  const builder = makeMe.aLandedCiHistory.inTrunkOrder(
    [1, 2, 3, 4, 5, 6].map(rev),
  );
  for (const n of [1, 2, 3, 4, 5, 6])
    builder.recording(landing(n), `run/${n}/1`, build(n));
  const history = builder.please();
  // Exact invalid persisted input is outside the domain builder.
  history.builds["run/6/1"].startedAt = "not-a-date";
  const result = wallTimeReferenceOf(history);
  assert.equal(result.averageMs, 100);
  assert.equal(result.selected.date, landing(6).receivedAt);
  assert.match(result.selected.reason, /bounds/);
  assert.equal(result.difference, undefined);
});
