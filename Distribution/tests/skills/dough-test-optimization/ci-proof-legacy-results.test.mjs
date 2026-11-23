import { makeMe } from "../../support/makeMe.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { summarize } from "../../../src/skills/dough-test-optimization/scripts/ci-proof-collect.mjs";
import {
  fragmentProblems,
  summaryProblems,
} from "../../../src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs";
import {
  fragmentsRead as read,
  revision,
  run,
} from "./ci-proof-test-fixtures.mjs";

test("a fragment and a summary's evidence name one unit; only legacy results carry the label their unit was spelled with", () => {
  const valid = makeMe.aCiProofFragment
    .at("tests")
    .part(1, 1)
    .ofAttempt(run.attempt, revision)
    .inUnit("file")
    .please();
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
  assert.deepEqual(refused([{ ...file, unit: "legacy", label: null }]), [
    "entries[0].evidence[0].unit is not case, file",
  ]);
});
