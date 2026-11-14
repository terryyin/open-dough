// The optional file breakdown of CI proof summaries
// (ci-proof-figures.mjs "File breakdown"): the collector sums fragments'
// breakdowns per path over the parts that published one, and validation
// refuses a breakdown that does not account for its counts or names a path
// outside its entry. Command line: ci-proof-breakdown-summary-cli.test.mjs.
// Converters: ci-proof-breakdown.test.mjs.
import assert from "node:assert/strict";
import test from "node:test";
import { summarize } from "./ci-proof-collect.mjs";
import { fragmentProblems, summaryProblems } from "./ci-proof-contract.mjs";
import {
  fragmentFromPlaywrightRecord,
  fragmentsFromOutcomes,
} from "./ci-proof-fragments.mjs";
import {
  byFile,
  locatedRecord,
  partIdentity,
  run,
} from "./ci-proof-test-fixtures.mjs";

const source = (value, index) => ({ source: `f${index}.json`, value });

test("two present parts where only one publishes a breakdown: entry totals include both, the breakdown only its part", () => {
  const cwd = "/w";
  const [broken] = fragmentFromPlaywrightRecord(
    locatedRecord(cwd, [
      [`${cwd}/dashboard/tests/a.spec.ts`, "expected", [100]],
      [`${cwd}/dashboard/tests/folder/b.spec.ts`, "expected", [50]],
    ]),
    partIdentity(["dashboard/tests"], 1, 3),
    byFile,
  );
  const [plain] = fragmentFromPlaywrightRecord(
    locatedRecord(cwd, [
      [`${cwd}/dashboard/tests/c.spec.ts`, "unexpected", [25]],
    ]),
    partIdentity(["dashboard/tests"], 2, 3),
  );
  const { summary } = summarize({
    fragments: [broken, plain].map(source),
    expect: [{ entry: "dashboard/tests", parts: 3 }],
    run,
  });
  assert.deepEqual(summaryProblems(summary), []);
  const [entry] = summary.entries[0].evidence;
  assert.deepEqual(
    [entry.passed, entry.failed, entry.durationMs, entry.untimed],
    [2, 1, 175, 0],
  );
  assert.deepEqual(entry.parts, [
    {
      part: 1,
      status: "present",
      passed: 2,
      failed: 0,
      other: 0,
      durationMs: 150,
      untimed: 0,
      breakdown: true,
    },
    {
      part: 2,
      status: "present",
      passed: 0,
      failed: 1,
      other: 0,
      durationMs: 25,
    },
    { part: 3, status: "missing" },
  ]);
  assert.deepEqual(
    entry.files.map((file) => file.path),
    ["dashboard/tests/a.spec.ts", "dashboard/tests/folder/b.spec.ts"],
  );
  assert.equal("unassigned" in entry, false);
});

test("one file with a timed and an untimed test keeps its known subtotal partial, summed across parts", () => {
  const cwd = "/w";
  const file = `${cwd}/dashboard/tests/a.spec.ts`;
  const fragments = [
    fragmentFromPlaywrightRecord(
      locatedRecord(cwd, [
        [file, "expected", [120]],
        [file, "expected", []],
      ]),
      partIdentity(["dashboard/tests"], 1, 2),
      byFile,
    )[0],
    fragmentFromPlaywrightRecord(
      locatedRecord(cwd, [
        [file, "expected", [30]],
        [undefined, "expected", []],
      ]),
      partIdentity(["dashboard/tests"], 2, 2),
      byFile,
    )[0],
  ];
  const { summary } = summarize({
    fragments: fragments.map(source),
    expect: [{ entry: "dashboard/tests", parts: 2 }],
    run,
  });
  assert.deepEqual(summaryProblems(summary), []);
  const [entry] = summary.entries[0].evidence;
  assert.equal(entry.untimed, 2);
  assert.deepEqual(entry.files, [
    {
      path: "dashboard/tests/a.spec.ts",
      passed: 3,
      failed: 0,
      other: 0,
      durationMs: 150,
      untimed: 1,
    },
  ]);
  assert.deepEqual(entry.unassigned, {
    passed: 1,
    failed: 0,
    other: 0,
    untimed: 1,
  });
});

test("a breakdown that does not account for its counts, or names a path outside its entry, is refused", () => {
  const [value] = fragmentsFromOutcomes(
    "passed\ttests/a.sh\npassed\ttests/b.sh\n",
    partIdentity(["tests"]),
    "1\ttests/a.sh\n1\ttests/b.sh\n",
    byFile,
  );
  assert.deepEqual(fragmentProblems(value), []);
  const refused = (change) => fragmentProblems({ ...value, ...change(value) });
  assert.deepEqual(
    refused(({ files }) => ({ files: files.slice(1) })),
    ["files and unassigned count 1 passed, not 2"],
  );
  for (const path of [
    "/home/runner/work/tests/a.sh",
    "tests/../a.sh",
    "tests//a.sh",
    "other/a.sh",
    "tests\\a.sh",
  ]) {
    assert.deepEqual(
      refused(({ files }) => ({ files: [{ ...files[0], path }, files[1]] })),
      ["files[0].path is not a relative path inside tests"],
      path,
    );
  }
  assert.deepEqual(
    refused(({ files }) => ({ files: [files[0], files[0]] })),
    ["files[1].path tests/a.sh is repeated"],
  );
  assert.deepEqual(
    refused(() => ({ files: "all" })),
    ["files is not an array"],
  );
  assert.deepEqual(
    refused(() => ({
      files: undefined,
      unassigned: { passed: 2, failed: 0, other: 0 },
    })),
    ["unassigned is given without files"],
  );
  assert.deepEqual(
    refused(() => ({ untimed: -1 })),
    ["untimed is not a count"],
  );

  const { summary } = summarize({
    fragments: [source(value, 0)],
    expect: [{ entry: "tests", parts: 1 }],
    run,
  });
  assert.deepEqual(summaryProblems(summary), []);
  const [
    {
      path,
      evidence: [entry],
    },
  ] = summary.entries;
  const refusedEntry = (change) =>
    summaryProblems({
      ...summary,
      entries: [{ path, evidence: [{ ...entry, ...change }] }],
    });
  // A truncated file list is never a complete breakdown.
  assert.deepEqual(refusedEntry({ files: entry.files.slice(0, 1) }), [
    "entries[0].evidence[0].files and unassigned count 1 passed, not 2",
  ]);
  assert.deepEqual(refusedEntry({ files: undefined }), [
    "entries[0].evidence[0].files is absent though a part was broken down by file",
  ]);
  assert.deepEqual(
    refusedEntry({ parts: [{ ...entry.parts[0], breakdown: undefined }] }),
    [
      "entries[0].evidence[0].files is given though no part was broken down by file",
    ],
  );
  assert.deepEqual(
    refusedEntry({ parts: [{ ...entry.parts[0], breakdown: false }] }),
    ["entries[0].evidence[0].parts[0].breakdown is not true"],
  );
});
