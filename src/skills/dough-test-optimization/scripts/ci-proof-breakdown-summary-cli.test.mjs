// The collector command line for file-breakdown summaries
// (ci-proof-breakdown-summary.test.mjs owns library validation): `--by-file`
// fragment and summarize, and naming a summary too large to read while
// writing it whole.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  fragmentTests,
  summarizeTests,
  temporary,
} from "./ci-proof-cli-fixtures.mjs";
import { SUMMARY_READ_LIMIT_BYTES } from "./ci-proof-contract.mjs";

test("the command line breaks fragments down by file with --by-file", (t) => {
  const directory = temporary(t);
  const outcomes = join(directory, "outcomes.txt");
  const times = join(directory, "times.txt");
  const fragments = join(directory, "fragments");
  writeFileSync(outcomes, "passed\ttests/a.sh\npassed\ttests/support/b.sh\n");
  writeFileSync(times, "0.5\ttests/a.sh\n");
  const fragment = fragmentTests(
    ["--outcomes", outcomes, "--times", times, "--by-file"],
    ["--attempt", "2"],
    fragments,
  );
  assert.deepEqual([fragment.status, fragment.stderr], [0, ""]);
  const out = join(directory, "summary.json");
  const summary = summarizeTests(
    fragments,
    ["--run-id", "7", "--attempt", "2"],
    out,
  );
  assert.deepEqual([summary.status, summary.stderr], [0, ""]);
  const [entry] = JSON.parse(readFileSync(out, "utf8")).entries[0].evidence;
  assert.deepEqual(entry.files, [
    { path: "tests/a.sh", passed: 1, failed: 0, other: 0, durationMs: 500 },
    { path: "tests/support/b.sh", passed: 1, failed: 0, other: 0, untimed: 1 },
  ]);
  assert.equal(entry.untimed, 1);
});

test("the command line names a summary too large to read, writing it whole without truncating it", (t) => {
  const directory = temporary(t);
  const many = join(directory, "many.txt");
  const name = "x".repeat(100);
  writeFileSync(
    many,
    [...Array(12_000).keys()]
      .map((index) => `passed\ttests/${name}-${index}.sh\n`)
      .join(""),
  );
  const fragments = join(directory, "fragments");
  assert.equal(
    fragmentTests(
      ["--outcomes", many, "--by-file"],
      ["--attempt", "2"],
      fragments,
    ).status,
    0,
  );
  const out = join(directory, "summary.json");
  const summary = summarizeTests(
    fragments,
    ["--run-id", "7", "--attempt", "2"],
    out,
  );
  const bytes = readFileSync(out).length;
  assert.equal(summary.status, 0);
  assert.ok(bytes > SUMMARY_READ_LIMIT_BYTES, String(bytes));
  assert.equal(
    summary.stderr,
    `the summary is ${bytes} bytes, more than the ${SUMMARY_READ_LIMIT_BYTES} Intent may read as a CI proof summary; Intent will not show it\n`,
  );
  // Written whole: every file is kept, none truncated.
  assert.equal(
    JSON.parse(readFileSync(out, "utf8")).entries[0].evidence[0].files.length,
    12_000,
  );
});
