// The archive's proof is validated before the browser sees summary evidence.
import assert from "node:assert/strict";
import { test } from "node:test";
import { ciProofSchema } from "../../../dashboard/src/ciProof.ts";
import {
  zipOf,
  proofSummaryForEntries,
} from "../../../dashboard/test-support/support/ciProofArtifacts.ts";
import { makeMe } from "./makeMe.mjs";
import { onlyZipEntry } from "../../src/skills/dough-test-optimization/scripts/ci-proof-archive.mjs";
import { checkedRetainedSummary } from "../../src/skills/dough-test-optimization/scripts/ci-proof-check.mjs";
import { SUMMARY_READ_LIMIT_BYTES } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";

const sha = (digit) => digit.repeat(40);

// How the dashboard reads a summary's zipped bytes: the archive's one file,
// checked by the shared step.
function readThroughBoundary(text) {
  const read = JSON.parse(
    onlyZipEntry(
      zipOf("ci-proof-summary.json", text),
      "ci-proof-summary.json",
      SUMMARY_READ_LIMIT_BYTES,
    ),
  );
  return checkedRetainedSummary(read, "o/r");
}

test("an archive's version 1 summary is invalid before reaching the browser", () => {
  // As the version 1 collector wrote it, literally: a Playwright entry and
  // an outcomes entry, neither declaring a unit.
  const text = `{"schemaVersion":1,"repository":"o/r","runId":7,"runAttempt":1,"revision":"${sha(
    "a",
  )}","entries":[{"path":"dashboard/tests","unit":"tests","passed":19,"failed":1,"other":0,"parts":[{"part":1,"status":"present","passed":19,"failed":1,"other":0}]},{"path":"tests","unit":"checks","passed":5,"failed":0,"other":0,"durationMs":500,"parts":[{"part":1,"status":"present","passed":5,"failed":0,"other":0,"durationMs":500}]}]}\n`;
  const checked = readThroughBoundary(text);
  assert.equal(checked.why, "invalid");
  assert.ok(checked.problems.includes("schemaVersion is not 2"));
  assert.equal("summary" in checked, false);
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
  const checked = readThroughBoundary(`${JSON.stringify(summary)}\n`);
  const { summary: read } = ciProofSchema.parse({
    kind: "summary",
    summary: checked.summary,
  });
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
