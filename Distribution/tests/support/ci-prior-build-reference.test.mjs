import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { wallTimeReferenceOf } from "../../../dashboard/server/ciWallTimeReference.ts";
import { windowedHistory } from "../../../dashboard/server/landedCiMeasuredBuilds.ts";

const revisionOf = (n) => n.toString(16).padStart(40, "0");

// All domain observations use the canonical retained-history/proof builders.
function retained(values, proofAt = () => "present") {
  const builder = makeMe.aLandedCiHistory;
  const order = Array.from(values.keys(), (n) => revisionOf(n + 1));
  for (const [n, ms] of values.entries()) {
    const revision = order[n];
    const startedAt = `2026-11-${String(n + 1).padStart(2, "0")}T10:00:00Z`;
    const completedAt = new Date(Date.parse(startedAt) + ms).toISOString();
    builder.measuredLanding({
      receipt: String(n),
      revision,
      runId: n + 1,
      receivedAt: startedAt,
      startedAt,
      completedAt,
    });
    const part = proofAt(n);
    if (part === "absent") continue;
    builder.proofFor(
      `run/${n + 1}/1`,
      makeMe.aCiProof
        .forRun({ revision, runId: n + 1 })
        .entries(
          part === "empty"
            ? []
            : [
                makeMe.aCiProofEntry
                  .at("tests")
                  .counting(2)
                  .inParts(1, part === "present" ? {} : { [part]: [1] })
                  .please(),
              ],
        )
        .please(),
    );
  }
  return builder.inTrunkOrder(order).please();
}

const reference = (
  history,
  endpoint = history.trunkOrder.at(-1),
  order = history.trunkOrder,
) => wallTimeReferenceOf(history, endpoint, order);

test("one exact upper filter includes 115, excludes 116 and computes 103 with +17 from six prior builds", () => {
  const result = reference(
    retained([100000, 100000, 100000, 100000, 115000, 116000, 120000]),
  );
  assert.equal(result.medianMs, 100000);
  assert.equal(result.averageMs, 103000);
  assert.equal(result.sampleCount, 5);
  assert.equal(result.selected.ms, 120000);
  assert.equal(result.difference.changeMs, 17000);
  assert.equal(result.difference.relative, 17 / 103);
  assert.deepEqual(
    result.evidence.map(({ status }) => status),
    [
      "included",
      "included",
      "included",
      "included",
      "included",
      "excluded",
      "selected",
    ],
  );
  assert.match(result.evidence[5].reason, /15%/);
  assert.equal(result.evidence[5].ms, 116000);
  assert.equal(result.from, "2026-11-01T10:00:00Z");
  assert.equal(result.to, "2026-11-05T10:00:00Z");
});

test("even median is computed once without rounding or iterative rejection and complete fast values survive", () => {
  const result = reference(retained([1, 100, 100, 100, 115, 116, 130]));
  assert.equal(result.medianMs, 100);
  assert.equal(result.averageMs, 83.2);
  assert.equal(result.sampleCount, 5);
  const singlePass = reference(
    retained([
      100000, 100000, 100000, 100000, 110000, 120000, 121000, 122000, 130000,
    ]),
  );
  assert.equal(singlePass.medianMs, 105000);
  assert.equal(singlePass.averageMs, 105000);
  assert.equal(singlePass.sampleCount, 6);
  assert.equal(singlePass.evidence[5].status, "included");
  const even = reference(
    retained([1000, 1000, 1000, 1000, 1001, 1150, 1151, 1151, 1400]),
  );
  assert.equal(even.medianMs, 1000.5);
  assert.equal(
    even.evidence.find((sample) => sample.key === "run/6/1").status,
    "included",
  );
  assert.equal(
    even.evidence.find((sample) => sample.key === "run/7/1").status,
    "excluded",
  );
});

test("four post-filter samples have evidence and no reference or difference; five suffice", () => {
  const four = reference(
    retained([100000, 100000, 100000, 100000, 116000, 120000]),
  );
  assert.equal(four.sampleCount, 4);
  assert.equal(four.averageMs, undefined);
  assert.equal(four.difference, undefined);
  assert.equal(four.evidence[4].ms, 116000);
  assert.equal(
    reference(retained([100, 100, 100, 100, 100, 120])).averageMs,
    100,
  );
});

test("zero median retains zeros and excludes positive values; zero average permits difference without percentage", () => {
  const result = reference(retained([0, 0, 0, 0, 0, 1, 1200]));
  assert.equal(result.medianMs, 0);
  assert.equal(result.sampleCount, 5);
  assert.equal(result.averageMs, 0);
  assert.equal(result.difference.changeMs, 1200);
  assert.equal(result.difference.relative, undefined);
  assert.equal(result.evidence[5].status, "excluded");
});

test("declared proof is nonempty, all present and unambiguous; missing selected proof keeps the prior reference", () => {
  const history = retained(
    [100, 100, 100, 100, 100, 100, 100, 100, 120],
    (n) =>
      [
        "present",
        "present",
        "present",
        "present",
        "present",
        "missing",
        "ambiguous",
        "empty",
        "absent",
      ][n],
  );
  const result = reference(history);
  assert.equal(result.averageMs, 100);
  assert.equal(result.sampleCount, 5);
  assert.match(result.evidence[5].reason, /missing/i);
  assert.match(result.evidence[6].reason, /ambiguous/i);
  assert.match(result.evidence[7].reason, /empty/i);
  assert.match(result.selected.reason, /not retained/i);
  assert.equal(result.selected.ms, undefined);
  assert.equal(result.difference, undefined);
});

test("retained total window includes its selected endpoint, yielding at most nineteen prior samples", () => {
  const history = windowedHistory(retained(Array(22).fill(100)));
  assert.equal(Object.keys(history.builds).length, 20);
  const result = reference(history);
  assert.equal(result.sampleCount, 19);
  assert.equal(result.evidence.length, 20);
  const older = reference(history, revisionOf(10));
  assert.equal(older.sampleCount, 7);
});
