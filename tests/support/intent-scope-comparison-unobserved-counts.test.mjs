// Unobserved scopes retain per-unit parts gaps instead of invented absence or zero.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  outsideComparisonRowsOf,
  scopeComparisonRowsOf,
} from "../../dashboard/src/ciScopeComparison.ts";
import { immediateChildrenOf } from "../../dashboard/src/ciScopeProof.ts";
import { comparisonEntriesOf } from "../../dashboard/src/storyCiComparisonEntries.ts";
import { sortedRows } from "../../dashboard/src/ciProofSort.ts";
import { makeMe } from "./makeMe.mjs";

const summary = (...evidence) =>
  makeMe.aComparisonEndpointProof
    .with({
      kind: "summary",
      entries: [
        makeMe.aCiProofEntry
          .at("t")
          .holding(...evidence)
          .please(),
      ],
    })
    .please();
const cases = (total, status) =>
  makeMe.aCiProofEvidence
    .inUnit("case")
    .brokenDown({ path: "t/f/a.ts", passed: total })
    .inParts(2, status ? { [status]: [2] } : {})
    .please();
const rows = (path, before, branch, landed = branch, side = "landed") =>
  scopeComparisonRowsOf(
    path,
    before,
    branch,
    landed,
    "precise",
    path,
    undefined,
    side,
  );

test("a scope absent from present shards beneath an incomplete unit establishes neither removed nor reverse added", () => {
  const known = summary(cases(1_000));
  for (const status of ["missing", "ambiguous"]) {
    const unknown = summary(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .brokenDown({ path: "t/other.ts", passed: 1_090 })
        .inParts(2, { [status]: [2] })
        .please(),
    );
    for (const path of ["t/f", "t/f/a.ts"]) {
      for (const [before, after] of [
        [known, unknown],
        [unknown, known],
      ]) {
        const [row] = rows(path, before, after);
        assert.match(row.counts, /1,000 test cases/);
        assert.match(row.counts, /no observed test cases/);
        assert.match(row.counts, new RegExp(`part 2 of 2 ${status}`));
        assert.doesNotMatch(row.counts, /removed|added|\(\+|\(−/);
        assert.equal(row.cues.count.kind, "none");
        if (after === unknown) assert.equal(row.countedResults, undefined);
        const endpoint = before === unknown ? row.baseline : row.landed;
        assert.match(endpoint.explanation, new RegExp(`part 2 of 2 ${status}`));
      }
    }
  }
  const completeOther = summary(
    makeMe.aCiProofEvidence
      .inUnit("case")
      .brokenDown({ path: "t/other.ts", passed: 1_090 })
      .please(),
  );
  assert.equal(
    rows("t/f/a.ts", known, completeOther)[0].counts,
    "1,000 → removed",
  );
  assert.equal(
    rows("t/f/a.ts", completeOther, known)[0].counts,
    "added → 1,000 test cases",
  );
});

test("entirely missing or ambiguous declared units show their gaps without measured zero at entry, folder or file", () => {
  const known = summary(cases(1_000));
  for (const status of ["missing", "ambiguous"]) {
    const unknown = summary(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .inParts(2, { [status]: [1, 2] })
        .please(),
    );
    for (const path of ["t", "t/f", "t/f/a.ts"]) {
      for (const [before, after] of [
        [known, unknown],
        [unknown, known],
      ]) {
        const [row] = rows(path, before, after);
        assert.match(row.counts, /1,000 test cases/);
        assert.match(row.counts, /no observed test cases/);
        assert.match(row.counts, new RegExp(`part 1 of 2 ${status}`));
        assert.match(row.counts, new RegExp(`part 2 of 2 ${status}`));
        assert.doesNotMatch(
          row.counts,
          /removed|added|\(\+|\(−|(?:^|→ )0 test cases/,
        );
        assert.equal(row.cues.count.kind, "none");
      }
      const absent = makeMe.aComparisonEndpointProof
        .with({ kind: "summary", entries: [] })
        .please();
      for (const [before, after] of [
        [unknown, absent],
        [absent, unknown],
      ]) {
        const [row] = rows(path, before, after);
        assert.match(row.counts, /no observed test cases/);
        assert.match(row.counts, new RegExp(`part 1 of 2 ${status}`));
        assert.doesNotMatch(row.counts, /removed|added|(?:^|→ )0 test cases/);
        assert.equal(row.cues.count.kind, "none");
      }
    }
  }
});

test("an unobserved Branch or Landed keeps its gap beside the other endpoint's supported difference", () => {
  const before = summary(cases(1_000));
  const unknown = summary(
    makeMe.aCiProofEvidence
      .inUnit("case")
      .brokenDown({ path: "t/other.ts", passed: 1_090 })
      .missingPart(2)
      .please(),
  );
  const [partialBranch] = rows(
    "t/f/a.ts",
    before,
    unknown,
    summary(cases(1_120)),
  );
  assert.match(
    partialBranch.counts,
    /no observed test cases.*part 2 of 2 missing/,
  );
  assert.match(partialBranch.counts, /1,120 test cases \(\+120\)/);
  assert.equal(partialBranch.cues.count.kind, "border");
  const [partialLanded] = rows(
    "t/f/a.ts",
    before,
    summary(cases(1_090)),
    unknown,
  );
  assert.match(partialLanded.counts, /1,090 test cases \(\+90\)/);
  assert.match(
    partialLanded.counts,
    /no observed test cases.*part 2 of 2 missing/,
  );
  assert.equal(partialLanded.cues.count.kind, "none");
});

test("an unobserved outside unit keeps its gap in either direction instead of added or removed", () => {
  const children = immediateChildrenOf("t", ["t/listed.ts"]);
  const known = summary(cases(5));
  const unknown = summary(
    makeMe.aCiProofEvidence
      .inUnit("case")
      .brokenDown({ path: "t/listed.ts", passed: 7 })
      .missingPart(2)
      .please(),
  );
  for (const [before, after] of [
    [known, unknown],
    [unknown, known],
  ]) {
    const [row] = outsideComparisonRowsOf(
      "t",
      children,
      before,
      after,
      after,
      "precise",
    );
    assert.match(row.counts, /5 test cases/);
    assert.match(row.counts, /no observed test cases.*part 2 of 2 missing/);
    assert.doesNotMatch(row.counts, /added|removed|\(\+|\(−/);
    assert.equal(row.cues.count.kind, "none");
  }
});

test("Counts sorting keeps observed partial totals sortable and unobserved units last beside measured zero", () => {
  const before = makeMe.aComparisonEndpointProof
    .with({
      kind: "summary",
      entries: ["unknown", "partial", "zero", "complete"].map((name) =>
        makeMe.aCiProofEntry.at(`t/${name}`).counting(10).please(),
      ),
    })
    .please();
  const after = makeMe.aComparisonEndpointProof
    .with({
      kind: "summary",
      entries: [
        makeMe.aCiProofEntry
          .at("t/unknown")
          .inParts(2, { missing: [1, 2] })
          .please(),
        makeMe.aCiProofEntry
          .at("t/partial")
          .counting(20)
          .missingParts(2)
          .please(),
        makeMe.aCiProofEntry.at("t/zero").counting(0).please(),
        makeMe.aCiProofEntry.at("t/complete").counting(5).please(),
      ],
    })
    .please();
  const compared = comparisonEntriesOf(before, after, after, "landed");
  assert.equal(compared.kind, "rows");
  const sortable = compared.rows.map(({ path, cells }) => ({
    name: path,
    cells,
  }));
  assert.deepEqual(
    sortedRows(sortable, { column: "counts", direction: "ascending" }).map(
      ({ name }) => name,
    ),
    ["t/zero", "t/complete", "t/partial", "t/unknown"],
  );
  assert.deepEqual(
    sortedRows(sortable, { column: "counts", direction: "descending" }).map(
      ({ name }) => name,
    ),
    ["t/partial", "t/complete", "t/zero", "t/unknown"],
  );
});
