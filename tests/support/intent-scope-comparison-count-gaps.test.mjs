// Unsupported count claims through the consuming row boundary at every depth.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  outsideComparisonRowsOf,
  scopeComparisonRowsOf,
} from "../../dashboard/src/ciScopeComparison.ts";
import { immediateChildrenOf } from "../../dashboard/src/ciScopeProof.ts";
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
const files = (total) =>
  makeMe.aCiProofEvidence
    .inUnit("file")
    .brokenDown({ path: "t/f/a.ts", passed: total })
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

test("missing and ambiguous parts withhold entry, folder and file changes while keeping observations, gaps and complete units", () => {
  for (const status of ["missing", "ambiguous"]) {
    for (const partialSide of ["before", "after"]) {
      const before = summary(
        cases(1_000, partialSide === "before" ? status : undefined),
        files(1),
      );
      const after = summary(
        cases(1_090, partialSide === "after" ? status : undefined),
        files(2),
      );
      for (const path of ["t", "t/f", "t/f/a.ts"]) {
        const [caseRow, fileRow] = rows(path, before, after);
        assert.match(caseRow.counts, /1,000 test cases/);
        assert.match(caseRow.counts, /1,090 test cases/);
        assert.match(caseRow.counts, new RegExp(`part 2 of 2 ${status}`));
        assert.match(caseRow.counts, /count difference unavailable/);
        assert.doesNotMatch(caseRow.counts, /\(\+90\)|no change|\(0\)/);
        assert.deepEqual(caseRow.cues.count, {
          kind: "none",
          reason: "partial",
        });
        assert.equal(fileRow.counts, "1 → 2 test files (+1)");
        assert.equal(fileRow.cues.count.kind, "border");
      }
    }
  }
});

test("equal partial observations do not establish equality and resolving the gap restores ordinary counts without timings", () => {
  const before = summary(cases(1_000));
  const partial = summary(cases(1_000, "ambiguous"));
  const [unresolved] = rows("t", before, partial);
  assert.match(unresolved.counts, /1,000 test cases.*1,000 test cases/);
  assert.doesNotMatch(unresolved.counts, /no change|\(0\)/);
  assert.equal(unresolved.cues.count.kind, "none");
  const [resolved] = rows("t", before, summary(cases(1_090)));
  assert.equal(resolved.counts, "1,000 → 1,090 test cases (+90)");
  assert.equal(resolved.baseline.text, "No timings");
  assert.deepEqual(resolved.cues.count, {
    kind: "border",
    direction: "more",
    strength: "light",
  });
});

test("Branch and Landed differences are independently eligible beside the other endpoint's partial observation", () => {
  const before = summary(cases(1_000));
  const partialBranch = summary(cases(1_090, "missing"));
  const completeLanded = summary(cases(1_120));
  const [branchGap] = rows("t", before, partialBranch, completeLanded);
  assert.match(branchGap.counts, /1,090 test cases.*part 2 of 2 missing/);
  assert.doesNotMatch(branchGap.counts, /\(\+90\)/);
  assert.match(branchGap.counts, /1,120 test cases \(\+120\)/);
  assert.equal(branchGap.cues.count.kind, "border");
  assert.equal(
    rows("t", before, partialBranch, completeLanded, "branch")[0].cues.count
      .kind,
    "none",
  );
  const [landedGap] = rows(
    "t",
    before,
    summary(cases(1_090)),
    summary(cases(1_120, "ambiguous")),
  );
  assert.match(landedGap.counts, /1,090 test cases \(\+90\)/);
  assert.match(landedGap.counts, /1,120 test cases.*part 2 of 2 ambiguous/);
  assert.doesNotMatch(landedGap.counts, /\(\+120\)/);
  assert.equal(landedGap.cues.count.kind, "none");
});

test("outside observations keep the same completeness restriction", () => {
  const children = immediateChildrenOf("t", ["t/listed.ts"]);
  const [row] = outsideComparisonRowsOf(
    "t",
    children,
    summary(cases(5)),
    summary(cases(7, "missing")),
    summary(cases(7, "missing")),
    "precise",
  );
  assert.match(row.counts, /5 test cases.*7 test cases.*part 2 of 2 missing/);
  assert.doesNotMatch(row.counts, /\(\+2\)/);
  assert.equal(row.cues.count.kind, "none");
});
