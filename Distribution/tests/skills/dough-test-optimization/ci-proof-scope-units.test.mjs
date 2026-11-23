// A lead reading keeps each unit's results that unit's (./ci-proof-scope.mjs,
// ./ci-proof-ranking.mjs): an entry holding test cases and test files is one
// entry whose units are each named, ranked and shared apart.
// Single-unit scopes: ./ci-proof-scope.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../support/makeMe.mjs";
import { leadsTable } from "../../../src/skills/dough-test-optimization/scripts/ci-proof-leads-table.mjs";
import { selectionOf } from "../../../src/skills/dough-test-optimization/scripts/ci-proof-project.mjs";
import { rankedLeads } from "../../../src/skills/dough-test-optimization/scripts/ci-proof-ranking.mjs";
import { scopeOf } from "../../../src/skills/dough-test-optimization/scripts/ci-proof-scope.mjs";

const repository = "owner/repo";
const revision = "a1b2c3d".padEnd(40, "0");
const ci = { repository, workflow: "ci.yml" };

// The table a reading prints of HELD, the scope it read.
const tableOf = (held) =>
  leadsTable({
    repository,
    requested: { spec: "HEAD", revision },
    source: "GitHub Actions workflow ci.yml",
    gaps: held.gaps,
    selection: selectionOf(ci, held.entries, []),
    ranking: rankedLeads(held.items),
  });

// The rows of TEXT's section NAME, each run of spaces as one.
const sectionOf = (text, name) => {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line.startsWith(`${name} `));
  const end = lines.findIndex(
    (line, index) => index > start && !line.startsWith("  "),
  );
  return lines.slice(start, end).map((line) => line.replace(/ +/g, " "));
};

test("an entry holding test cases and test files is one entry: each unit is named in its gaps and selection row, has its own totals and ranking, and no path or time crosses units", () => {
  const summary = makeMe.aCiProofSummary
    .withEntries(
      makeMe.aCiProofEntry
        .at("tests")
        .holding(
          makeMe.aCiProofEvidence
            .inUnit("case")
            .inParts(2, { missing: [2] })
            .withFile("tests/unit/test_a.py", {
              passed: 3,
              failed: 1,
              durationMs: 9000,
            })
            .withFile("tests/unit/test_b.py", { passed: 2, durationMs: 1000 })
            .please(),
          makeMe.aCiProofEvidence
            .inUnit("file")
            .counting(4)
            .timed(20_000)
            .please(),
        )
        .please(),
    )
    .please();

  const held = scopeOf(summary, ["tests"]);

  assert.deepEqual(held.entries, [
    {
      path: "tests",
      units: [
        { unit: "case", of: 2, present: 1, missing: [2], ambiguous: [] },
        { unit: "file", of: 1, present: 1, missing: [], ambiguous: [] },
      ],
    },
  ]);
  assert.deepEqual(held.noBreakdown, ["tests"]);
  assert.deepEqual(held.gaps, [
    "tests: part 2 of 2 of its test cases missing; their results are not counted",
    "tests: 1 test case failed in this attempt",
    "tests: no file breakdown of its test files; they rank as one entry total",
  ]);
  assert.deepEqual(
    held.items.map(({ path, unit, results }) => [path, unit, results]),
    [
      ["tests/unit/test_a.py", "case", 4],
      ["tests/unit/test_b.py", "case", 2],
      ["tests", "file", 4],
    ],
  );

  const text = tableOf(held);
  assert.deepEqual(sectionOf(text, "Selection").slice(1), [
    " entry declared unit parts",
    " tests not an Intent location test cases 1 of 2 parts present, 1 missing",
    " test files 1 of 1 parts present",
  ]);
  assert.deepEqual(sectionOf(text, "Scope totals"), [
    "Scope totals per unit; results, time, shares and means never cross units",
    " unit entries paths results time s untimed",
    " test cases 1 2 6 10.0 0",
    " test files 1 0 4 20.0 0",
  ]);
  assert.deepEqual(
    text
      .split("\n")
      .filter((line) => line.startsWith("Leads "))
      .map((line) => line.replace(/ +/g, " ")),
    [
      "Leads test cases: all 2 timed items, ranked by summed CI time",
      "Leads test files: all 1 timed items, ranked by summed CI time",
    ],
  );
  assert.match(
    text.replace(/ +/g, " "),
    /\n 1 9\.0 90\.0% 4 2\.25 tests\/unit\/test_a\.py\n 2 1\.0 10\.0% 2 0\.50 tests\/unit\/test_b\.py\n/,
  );
  assert.match(
    text.replace(/ +/g, " "),
    /\n # time s share files mean s path\n 1 20\.0 100\.0% 4 5\.00 tests \(entry total, no file breakdown\)\n/,
  );
});
