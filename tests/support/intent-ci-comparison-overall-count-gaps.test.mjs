// Overall counts keep every contributing observation without partial differences.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  overallCountsCue,
  overallCountsWords,
} from "../../dashboard/src/storyCiComparisonCountsWords.ts";
import { makeMe } from "./makeMe.mjs";

const entry = (path, ...evidence) =>
  makeMe.aCiProofEntry
    .at(path)
    .holding(...evidence)
    .please();
const counted = (unit, total, status) =>
  makeMe.aCiProofEvidence
    .inUnit(unit)
    .counting(total)
    .inParts(2, status ? { [status]: [2] } : {})
    .please();
const summary = (...entries) =>
  makeMe.aComparisonEndpointProof.with({ kind: "summary", entries }).please();

test("one partial contributing entry withholds the whole unit's overall difference while preserving complete units", () => {
  for (const status of ["missing", "ambiguous"]) {
    for (const side of ["baseline", "landed"]) {
      const baseline = summary(
        entry(
          "partial",
          counted("case", 1_000, side === "baseline" ? status : undefined),
          counted("file", 1),
        ),
        entry("complete", counted("case", 100)),
      );
      const landed = summary(
        entry(
          "partial",
          counted("case", 1_090, side === "landed" ? status : undefined),
          counted("file", 2),
        ),
        entry("complete", counted("case", 200)),
      );
      const words = overallCountsWords(baseline, landed);
      assert.match(words, /1,100 test cases/);
      assert.match(words, /1,290 test cases/);
      assert.match(words, new RegExp(`partial: part 2 of 2 ${status}`));
      assert.match(words, /count difference unavailable/);
      assert.doesNotMatch(words, /\(\+190\)|\(\+100\)/);
      assert.match(words, /1 → 2 test files \(\+1\)/);
      assert.deepEqual(overallCountsCue(baseline, landed), {
        kind: "border",
        direction: "more",
        strength: "strong",
      });
    }
  }
});

test("partial equal overall observations establish neither equality nor a cue; complete untimed evidence recovers comparison", () => {
  const before = summary(entry("t", counted("case", 1_000)));
  const partial = summary(entry("t", counted("case", 1_000, "ambiguous")));
  const words = overallCountsWords(before, partial);
  assert.match(words, /1,000 test cases.*1,000 test cases/);
  assert.doesNotMatch(words, /no change|\(0\)/);
  assert.equal(overallCountsCue(before, partial).kind, "none");
  const complete = summary(entry("t", counted("case", 1_090)));
  assert.equal(
    overallCountsWords(before, complete),
    "1,000 → 1,090 test cases (+90)",
  );
  assert.equal(overallCountsCue(before, complete).kind, "border");
});

test("an entirely unobserved contributing unit blocks complete-entry subtotals without manufacturing zero at either endpoint", () => {
  for (const status of ["missing", "ambiguous"]) {
    const unknown = makeMe.aCiProofEvidence
      .inUnit("case")
      .inParts(2, { [status]: [1, 2] })
      .please();
    const before = summary(
      entry("unknown", unknown),
      entry("complete", counted("case", 100)),
    );
    const after = summary(
      entry("unknown", counted("case", 1_090)),
      entry("complete", counted("case", 200)),
    );
    const words = overallCountsWords(before, after);
    assert.match(
      words,
      new RegExp(`100 test cases \\(unknown: part 1 of 2 ${status}`),
    );
    assert.match(words, /1,290 test cases/);
    assert.doesNotMatch(words, /\(\+100\)|\(\+1190\)|\(\+1,190\)/);
    assert.equal(overallCountsCue(before, after).kind, "none");
    const absent = summary();
    assert.equal(
      overallCountsWords(absent, summary(entry("unknown", unknown))),
      `— → no observed test cases (unknown: part 1 of 2 ${status}, unknown: part 2 of 2 ${status}; count difference unavailable)`,
    );
    assert.equal(
      overallCountsWords(summary(entry("unknown", unknown)), absent),
      `no observed test cases (unknown: part 1 of 2 ${status}, unknown: part 2 of 2 ${status}; count difference unavailable) → —`,
    );
    assert.equal(
      overallCountsWords(
        summary(entry("unknown", counted("file", 1))),
        summary(entry("unknown", unknown)),
      ),
      `— → no observed test cases (unknown: part 1 of 2 ${status}, unknown: part 2 of 2 ${status}; count difference unavailable); 1 test file → —`,
    );
  }
});
