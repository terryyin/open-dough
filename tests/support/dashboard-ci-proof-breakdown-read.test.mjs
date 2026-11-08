// A CI proof summary broken down by file on the dashboard's read: it is
// read whole up to the collector's shared limit
// (../../dashboard/server/zipEntry.ts) and validated by the collector's
// contract, and the browser's own parser keeps its breakdown
// (../../dashboard/src/ciProof.ts). Other proof reads:
// ./dashboard-ci-proof-read.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  onlyZipEntry,
  ZipEntryProblem,
  ZipEntryTooLarge,
} from "../../dashboard/server/zipEntry.ts";
import { ciProofSchema } from "../../dashboard/src/ciProof.ts";
import { zipOf } from "../../dashboard/tests/support/ciProofArtifacts.ts";
import {
  SUMMARY_READ_LIMIT_BYTES,
  fragmentsFromOutcomes,
  summarize,
  summaryProblems,
} from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";

const sha = (digit) => digit.repeat(40);

// A summary broken down by file, as the collector writes it for FILES test
// files of `tests`, each name padded to NAME_LENGTH.
function brokenDownSummaryText(files, nameLength = 20) {
  const outcomes = [...Array(files).keys()]
    .map(
      (index) =>
        `passed\ttests/${String(index).padStart(nameLength, "x")}.sh\n`,
    )
    .join("");
  const identity = {
    entries: ["tests"],
    part: 1,
    of: 1,
    attempt: 1,
    revision: sha("a"),
  };
  const [value] = fragmentsFromOutcomes(outcomes, identity, undefined, {
    byFile: true,
  });
  const { summary } = summarize({
    fragments: [{ source: "f.json", value }],
    expect: [{ entry: "tests", parts: 1 }],
    run: { repository: "o/r", runId: 7, attempt: 1, revision: sha("a") },
  });
  return `${JSON.stringify(summary)}\n`;
}

test("a summary broken down by file is read whole up to the shared limit, and refused above it rather than truncated", () => {
  const text = brokenDownSummaryText(500);
  const read = onlyZipEntry(
    zipOf("ci-proof-summary.json", text),
    "ci-proof-summary.json",
    SUMMARY_READ_LIMIT_BYTES,
  );
  assert.equal(read, text);
  assert.deepEqual(summaryProblems(JSON.parse(read)), []);
  const large = brokenDownSummaryText(9_000, 120);
  const largeBytes = Buffer.byteLength(large);
  assert.ok(largeBytes > SUMMARY_READ_LIMIT_BYTES);
  assert.throws(
    () =>
      onlyZipEntry(
        zipOf("ci-proof-summary.json", large),
        "ci-proof-summary.json",
        SUMMARY_READ_LIMIT_BYTES,
      ),
    (error) => {
      assert.ok(error instanceof ZipEntryTooLarge);
      assert.ok(error instanceof ZipEntryProblem);
      assert.equal(error.sizeBytes, largeBytes);
      assert.equal(error.limitBytes, SUMMARY_READ_LIMIT_BYTES);
      assert.equal(error.entryName, "ci-proof-summary.json");
      return true;
    },
  );
});

test("a malformed or truncated file breakdown is not a valid summary, and the browser's parser keeps every breakdown field", () => {
  const summary = JSON.parse(brokenDownSummaryText(3));
  const [entry] = summary.entries;
  assert.deepEqual(
    summaryProblems({
      ...summary,
      entries: [{ ...entry, files: entry.files.slice(1) }],
    }),
    [
      "entries[0].files and unassigned count 2 passed, not 3",
      "entries[0].files and unassigned count 2 untimed, not 3",
    ],
  );
  assert.deepEqual(
    summaryProblems({
      ...summary,
      entries: [
        {
          ...entry,
          files: [
            { ...entry.files[0], path: "/runner/tests/a.sh" },
            ...entry.files.slice(1),
          ],
        },
      ],
    }),
    ["entries[0].files[0].path is not a relative path inside tests"],
  );
  const parsed = ciProofSchema.parse({
    kind: "summary",
    summary: {
      ...summary,
      entries: [
        {
          ...entry,
          unassigned: { passed: 0, failed: 0, other: 0, untimed: 0 },
        },
      ],
    },
  });
  assert.deepEqual(parsed.summary.entries[0].files, entry.files);
  assert.deepEqual(parsed.summary.entries[0].parts[0], {
    part: 1,
    status: "present",
    passed: 3,
    failed: 0,
    other: 0,
    untimed: 3,
    breakdown: true,
  });
  assert.equal(parsed.summary.entries[0].untimed, 3);
  assert.deepEqual(parsed.summary.entries[0].unassigned, {
    passed: 0,
    failed: 0,
    other: 0,
    untimed: 0,
  });
});
