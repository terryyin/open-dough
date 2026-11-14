import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { historyEntries } from "../../../dashboard/server/landedCiHistoryEntries.ts";

test("project history preserves accepted A-gapB-C order while receipt and measured dates disagree", () => {
  const a = "a1".repeat(20);
  const b = "b2".repeat(20);
  const c = "c3".repeat(20);
  const aStart = "2026-11-09T10:00:00Z";
  const cStart = "2026-11-05T10:00:00Z";
  const gapAt = "2026-11-30T10:00:00Z";
  const history = makeMe.aLandedCiHistory
    .inTrunkOrder([a, b, c])
    .measuredLanding({
      receipt: "a",
      revision: a,
      receivedAt: "2026-11-03T10:00:00Z",
      runId: 11,
      startedAt: aStart,
      completedAt: "2026-11-09T10:06:05Z",
    })
    .unmeasuredLanding({
      receipt: "b",
      revision: b,
      receivedAt: gapAt,
      reason: "no-build",
    })
    .measuredLanding({
      receipt: "c",
      revision: c,
      receivedAt: "2026-11-01T10:00:00Z",
      runId: 13,
      startedAt: cStart,
      completedAt: "2026-11-05T10:03:00Z",
    })
    .please();

  const entries = historyEntries(history);
  assert.deepEqual(
    entries.map(({ kind, revision }) => [kind, revision]),
    [
      ["point", a],
      ["gap", b],
      ["point", c],
    ],
  );
  assert.deepEqual(
    entries.map((entry) =>
      entry.kind === "point" ? entry.startedAt : entry.receivedAt,
    ),
    [aStart, gapAt, cStart],
  );
  assert.deepEqual(
    entries
      .filter((entry) => entry.kind === "point")
      .map((entry) => entry.landings.map(({ revision }) => revision)),
    [[a], [c]],
  );
  assert.equal(entries[1].reason, "no-build");
  assert.equal("startedAt" in entries[1], false);
});

test("one attempt keeps exact and equivalent represented landings at its first ancestry position beside an intervening gap", () => {
  const landing = (revision, receipt, receivedAt) =>
    makeMe.aLaunchLanding
      .comparing({ base: "0".repeat(40), revision })
      .deliveredAs({ delivery: receipt, receipt })
      .receivedAt(receivedAt)
      .please();
  const a = landing("a1".repeat(20), "a", "2026-11-04T00:00:00Z");
  const b = landing("b2".repeat(20), "b", "2026-11-30T00:00:00Z");
  const c = landing("c3".repeat(20), "c", "2026-11-02T00:00:00Z");
  const d = landing("d4".repeat(20), "d", "2026-11-01T00:00:00Z");
  const build = makeMe.aKeptBuild
    .with({
      revision: a.revision,
      state: "pass",
      runId: 21,
      runAttempt: 1,
      startedAt: "2026-11-09T10:00:00Z",
      completedAt: "2026-11-09T10:01:00Z",
    })
    .please();
  const history = makeMe.aLandedCiHistory
    .inTrunkOrder([a.revision, b.revision, c.revision, d.revision])
    .recording(a, "run/21/1", build)
    .gap(b, "CI did not build this recorded landing.", "no-build")
    .recording(c, "run/21/1", build, "equivalent")
    .recording(
      d,
      "run/24/1",
      makeMe.aKeptBuild
        .with({
          revision: d.revision,
          state: "pass",
          runId: 24,
          runAttempt: 1,
          startedAt: "2026-11-05T10:00:00Z",
          completedAt: "2026-11-05T10:02:00Z",
        })
        .please(),
    )
    .please();

  const entries = historyEntries(history);
  assert.deepEqual(
    entries.map(({ kind, revision }) => [kind, revision]),
    [
      ["point", a.revision],
      ["gap", b.revision],
      ["point", d.revision],
    ],
  );
  assert.deepEqual(
    entries[0].landings.map(({ revision, provenance }) => [
      revision,
      provenance,
    ]),
    [
      [a.revision, "exact"],
      [c.revision, "equivalent"],
    ],
  );
  assert.equal(
    entries.filter((entry) => entry.kind === "point" && entry.runId === 21)
      .length,
    1,
  );
  assert.equal(entries[0].startedAt, build.startedAt);
  assert.equal(entries[1].receivedAt, b.receivedAt);
});
