// Legacy results in CI proof (ci-proof-evidence.mjs, "Units"): only legacy
// results carry the label their unit was spelled with, and a version 1
// summary, from before units, stays readable with each entry's results read
// as legacy results (ci-proof-contract.mjs, currentSummaryOf), never as
// test cases or test files.
import assert from "node:assert/strict";
import test from "node:test";
import { summarize } from "./ci-proof-collect.mjs";
import {
  currentSummaryOf,
  fragmentProblems,
  summaryProblems,
} from "./ci-proof-contract.mjs";
import {
  fragmentOf,
  fragmentsRead as read,
  revision,
  run,
} from "./ci-proof-test-fixtures.mjs";

test("a fragment and a summary's evidence name one unit; only legacy results carry the label their unit was spelled with", () => {
  const valid = fragmentOf("tests", 1, 1).inUnit("file").please();
  assert.deepEqual(fragmentProblems(valid), []);
  assert.deepEqual(fragmentProblems({ ...valid, unit: "checks" }), [
    "unit is not case, file, legacy",
  ]);
  assert.deepEqual(fragmentProblems({ ...valid, label: "checks" }), [
    "label is given for file results",
  ]);
  assert.deepEqual(fragmentProblems({ ...valid, unit: "legacy" }), [
    "label is not a string",
  ]);
  assert.deepEqual(fragmentProblems({ ...valid, schemaVersion: 1 }), [
    "schemaVersion is not 2",
  ]);
  const { summary } = summarize({
    fragments: read(valid),
    expect: [{ entry: "tests", parts: 1, unit: "file" }],
    run,
  });
  const [
    {
      path,
      evidence: [file],
    },
  ] = summary.entries;
  const refused = (evidence) =>
    summaryProblems({ ...summary, entries: [{ path, evidence }] });
  assert.deepEqual(refused([]), [
    "entries[0].evidence is not a non-empty array",
  ]);
  assert.deepEqual(refused([file, file]), [
    "entries[0].evidence[1].unit file is repeated",
  ]);
  assert.deepEqual(refused([{ ...file, unit: "legacy", label: 7 }]), [
    "entries[0].evidence[0].label is neither a string nor null",
  ]);
  assert.deepEqual(refused([{ ...file, unit: "legacy", label: null }]), []);
});

test("a version 1 summary stays readable, each entry's results read as legacy results labelled with its unit, never as test cases or test files (example 38)", () => {
  // As the version 1 collector wrote it, literally.
  const v1 = JSON.parse(
    `{"schemaVersion":1,"repository":"owner/repo","runId":7,"runAttempt":2,"revision":"${
      revision
    }","entries":[{"path":"dashboard/tests","unit":"tests","passed":19,"failed":1,"other":0,"durationMs":1200,"parts":[{"part":1,"status":"present","passed":19,"failed":1,"other":0,"durationMs":1200}]},{"path":"tests","unit":"checks","passed":5,"failed":0,"other":0,"parts":[{"part":1,"status":"present","passed":5,"failed":0,"other":0,"breakdown":true}],"files":[{"path":"tests/a.sh","passed":5,"failed":0,"other":0}]},{"path":"src/skills","unit":null,"passed":0,"failed":0,"other":0,"parts":[{"part":1,"status":"missing"}]}]}`,
  );
  assert.deepEqual(summaryProblems(v1), []);
  const current = currentSummaryOf(v1);
  assert.deepEqual(summaryProblems(current), []);
  assert.deepEqual(
    { ...current, entries: undefined },
    {
      schemaVersion: 2,
      repository: "owner/repo",
      runId: 7,
      runAttempt: 2,
      revision,
      entries: undefined,
    },
  );
  assert.deepEqual(current.entries, [
    {
      path: "dashboard/tests",
      evidence: [
        {
          unit: "legacy",
          label: "tests",
          passed: 19,
          failed: 1,
          other: 0,
          durationMs: 1200,
          parts: [
            {
              part: 1,
              status: "present",
              passed: 19,
              failed: 1,
              other: 0,
              durationMs: 1200,
            },
          ],
        },
      ],
    },
    {
      path: "tests",
      evidence: [
        {
          unit: "legacy",
          label: "checks",
          passed: 5,
          failed: 0,
          other: 0,
          parts: [
            {
              part: 1,
              status: "present",
              passed: 5,
              failed: 0,
              other: 0,
              breakdown: true,
            },
          ],
          files: [{ path: "tests/a.sh", passed: 5, failed: 0, other: 0 }],
        },
      ],
    },
    {
      path: "src/skills",
      evidence: [
        {
          unit: "legacy",
          label: null,
          passed: 0,
          failed: 0,
          other: 0,
          parts: [{ part: 1, status: "missing" }],
        },
      ],
    },
  ]);
  // A current summary reads as itself; another version is no summary.
  assert.equal(currentSummaryOf(current), current);
  assert.deepEqual(summaryProblems({ ...v1, schemaVersion: 3 }), [
    "schemaVersion is not 1 or 2",
    "entries[0].evidence is not a non-empty array",
    "entries[1].evidence is not a non-empty array",
    "entries[2].evidence is not a non-empty array",
  ]);
});
