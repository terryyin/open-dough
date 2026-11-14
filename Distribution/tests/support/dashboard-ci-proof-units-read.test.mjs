// A CI proof summary's units on the dashboard's read: through the read
// boundary, the archive's one file
// (../../src/skills/dough-test-optimization/scripts/ci-proof-archive.mjs)
// checked by the shared step every reader uses
// (../../src/skills/dough-test-optimization/scripts/ci-proof-check.mjs):
// validated by the collector's contract and read in its current version, a
// version 1 summary's results become legacy evidence labelled with the unit
// it spelled, and a version 2 summary keeps each unit's results apart in the
// browser's parser (../../../dashboard/src/ciProof.ts). Summaries broken down by
// file: ./dashboard-ci-proof-breakdown-read.test.mjs; through a ciAdapter:
// ./dashboard-ci-adapter-proof.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { ciProofSchema } from "../../../dashboard/src/ciProof.ts";
import {
  zipOf,
  proofSummaryForEntries,
} from "../../../dashboard/tests/support/ciProofArtifacts.ts";
import { makeMe } from "./makeMe.mjs";
import { onlyZipEntry } from "../../src/skills/dough-test-optimization/scripts/ci-proof-archive.mjs";
import { checkedRetainedSummary } from "../../src/skills/dough-test-optimization/scripts/ci-proof-check.mjs";
import { SUMMARY_READ_LIMIT_BYTES } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";

const sha = (digit) => digit.repeat(40);

// How the dashboard reads a summary's zipped bytes: the archive's one file,
// checked by the shared step: validated by the collector's contract, then
// read in the current version.
function readThroughBoundary(text) {
  const read = JSON.parse(
    onlyZipEntry(
      zipOf("ci-proof-summary.json", text),
      "ci-proof-summary.json",
      SUMMARY_READ_LIMIT_BYTES,
    ),
  );
  const checked = checkedRetainedSummary(read, "o/r");
  assert.ok("summary" in checked, JSON.stringify(checked));
  return ciProofSchema.parse({ kind: "summary", summary: checked.summary })
    .summary;
}

test("a version 1 summary stays readable through the read boundary and the browser's parser, each entry's results legacy with the unit it spelled as their label (example 38)", () => {
  // As the version 1 collector wrote it, literally: a Playwright entry and
  // an outcomes entry, neither declaring a unit.
  const text = `{"schemaVersion":1,"repository":"o/r","runId":7,"runAttempt":1,"revision":"${sha(
    "a",
  )}","entries":[{"path":"dashboard/tests","unit":"tests","passed":19,"failed":1,"other":0,"parts":[{"part":1,"status":"present","passed":19,"failed":1,"other":0}]},{"path":"tests","unit":"checks","passed":5,"failed":0,"other":0,"durationMs":500,"parts":[{"part":1,"status":"present","passed":5,"failed":0,"other":0,"durationMs":500}]}]}\n`;
  const summary = readThroughBoundary(text);
  assert.equal(summary.schemaVersion, 2);
  assert.deepEqual(
    summary.entries.map(({ path, evidence }) =>
      evidence.map(({ unit, label, passed, failed }) => [
        path,
        unit,
        label,
        passed,
        failed,
      ]),
    ),
    [
      [["dashboard/tests", "legacy", "tests", 19, 1]],
      [["tests", "legacy", "checks", 5, 0]],
    ],
  );
  // The browser reads only the current version: the boundary reads a
  // version 1 summary in it first.
  assert.equal(
    ciProofSchema.safeParse({ kind: "summary", summary: JSON.parse(text) })
      .success,
    false,
  );
});

test("a version 2 summary of one location's five test cases and one test file reaches the browser with each unit's results apart (example 36)", () => {
  const spec = "tests/check.test.mjs";
  const summary = proofSummaryForEntries(
    { repository: "o/r", runId: 7, attempt: 1, revision: sha("a") },
    [
      makeMe.aCiProofEntry
        .at("tests")
        .holding(
          makeMe.aCiProofEvidence
            .inUnit("case")
            .withFile(spec, { passed: 5, durationMs: 1500 })
            .please(),
          makeMe.aCiProofEvidence
            .inUnit("file")
            .withFile(spec, { passed: 0, failed: 1 })
            .please(),
        )
        .please(),
    ],
  );
  const read = readThroughBoundary(`${JSON.stringify(summary)}\n`);
  assert.deepEqual(read, summary);
  assert.deepEqual(
    read.entries[0].evidence.map(
      ({ unit, passed, failed, durationMs, files }) => [
        unit,
        passed,
        failed,
        durationMs,
        files.map((one) => one.path),
      ],
    ),
    [
      ["case", 5, 0, 1500, [spec]],
      ["file", 0, 1, undefined, [spec]],
    ],
  );
});
