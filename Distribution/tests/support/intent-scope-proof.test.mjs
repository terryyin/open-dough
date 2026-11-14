// A selected Intent entry's or folder's CI proof derived from one summary
// (../../../dashboard/src/ciScopeProof.ts) and worded as the homepage words its
// entries (../../../dashboard/src/ciProofWording.ts): immediate children in the
// tree's order, figures summed by path whatever the tree lists, what no child
// row shows, each result counted in exactly one row, and each gap — no breakdown, no matched result, a measured zero,
// a missing part, a part without a breakdown — named rather than shown as
// zero or complete. Each unit's results apart:
// ./intent-scope-proof-units.test.mjs; timing gaps and time words:
// ./intent-ci-proof-timing.test.mjs.
// Browser journey:
// ../../../e2e/intent/intent-summary-ci-proof.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  immediateChildrenOf,
  outsideOf,
  owningEntryOf,
  scopeFiguresOf,
} from "../../../dashboard/src/ciScopeProof.ts";
import { ciScopeCellsOf } from "../../../dashboard/src/ciProofWording.ts";
import { entryEvidenceOf } from "../../../dashboard/src/ciProofUnits.ts";
import { makeMe } from "./makeMe.mjs";

// Canonical declared test-file evidence and its production scope projection.
const declaredEntry = makeMe.aCiProofEntry
  .at("tests")
  .holding(
    makeMe.aCiProofEvidence
      .inUnit("file")
      .withFile("tests/a.sh", { passed: 1, durationMs: 0 })
      .withFile("tests/deep/b.sh", { passed: 1, durationMs: 1200 })
      .withFile("tests/deep/er/c.sh", {
        passed: 0,
        failed: 1,
        durationMs: 1300,
      })
      .withFile("tests/support/hidden.sh", {
        passed: 1,
        untimed: 1,
      })
      .withUnassigned({ passed: 1, durationMs: 1000 })
      .please(),
  )
  .please();
const [entry] = entryEvidenceOf(declaredEntry);
const inventory = [
  "tests/a.sh",
  "tests/deep/b.sh",
  "tests/deep/er/c.sh",
  "tests/z.sh",
];

test("immediate children follow the tree: folders first, then files, each in code-point order, a one-folder chain as one", () => {
  assert.deepEqual(
    immediateChildrenOf("tests", [
      "tests/z.sh",
      "tests/a.sh",
      "tests/only/chain/c.sh",
      "tests/deep/b.sh",
      "tests/deep/x/d.sh",
      "elsewhere/e.sh",
    ]),
    [
      { kind: "folder", name: "deep", path: "tests/deep" },
      { kind: "folder", name: "only/chain", path: "tests/only/chain" },
      { kind: "file", name: "a.sh", path: "tests/a.sh" },
      { kind: "file", name: "z.sh", path: "tests/z.sh" },
    ],
  );
});

test("a scope's figures sum its entry's files under its path, the longest entry owning it, whatever the tree lists", () => {
  const entries = [
    declaredEntry,
    makeMe.aCiProofEntry.at("tests/deep/er").please(),
  ];
  assert.equal(owningEntryOf(entries, "tests/deep")?.path, "tests");
  assert.equal(
    owningEntryOf(entries, "tests/deep/er/c.sh")?.path,
    "tests/deep/er",
  );
  assert.equal(owningEntryOf(entries, "testsuite"), undefined);
  assert.deepEqual(scopeFiguresOf(entry, "tests/deep"), {
    passed: 1,
    failed: 1,
    other: 0,
    untimed: 0,
    paths: 2,
    durationMs: 2500,
  });
  assert.deepEqual(scopeFiguresOf(entry, "tests/support").paths, 1);
  assert.deepEqual(scopeFiguresOf(entry, "tests/z.sh").paths, 0);
  const outside = outsideOf(
    entry,
    "tests",
    immediateChildrenOf("tests", inventory),
  );
  assert.deepEqual(
    outside?.files.map(({ path }) => path),
    ["tests/support/hidden.sh"],
  );
  assert.deepEqual(outside?.unassigned, entry.unassigned);
  assert.deepEqual(
    [
      outside?.figures.passed,
      outside?.figures.durationMs,
      outside?.figures.untimed,
    ],
    [2, 1000, 1],
  );
  // A folder's outside row never holds the entry's unassigned results.
  assert.equal(
    outsideOf(
      entry,
      "tests/deep",
      immediateChildrenOf("tests/deep", inventory),
    ),
    undefined,
  );
});

test("a file the tree does not list under a listed child folder counts once, in that folder's row, and is outside only at the folder's own level", () => {
  const [tests] = entryEvidenceOf(
    makeMe.aCiProofEntry
      .at("dashboard/tests")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .withFile("dashboard/tests/folder/a.spec.ts", {
            passed: 1,
            untimed: 0,
          })
          .withFile("dashboard/tests/folder/old.spec.ts", {
            passed: 1,
            untimed: 0,
          })
          .withFile("dashboard/tests/root.spec.ts", { passed: 1, untimed: 0 })
          .please(),
      )
      .please(),
  );
  const listed = [
    "dashboard/tests/folder/a.spec.ts",
    "dashboard/tests/root.spec.ts",
  ];
  const rowsOf = (scope) => {
    const children = immediateChildrenOf(scope, listed);
    return {
      children: children.map(
        (child) => scopeFiguresOf(tests, child.path).passed,
      ),
      outside: outsideOf(tests, scope, children),
    };
  };
  const entryRows = rowsOf("dashboard/tests");
  assert.deepEqual(entryRows.children, [2, 1]);
  assert.equal(entryRows.outside, undefined);
  const folderRows = rowsOf("dashboard/tests/folder");
  assert.deepEqual(folderRows.children, [1]);
  assert.deepEqual(
    folderRows.outside?.files.map(({ path }) => path),
    ["dashboard/tests/folder/old.spec.ts"],
  );
  assert.equal(folderRows.outside?.figures.passed, 1);
  // Child rows and the outside row reconcile with the scope's figures.
  for (const [scope, rows] of [
    ["dashboard/tests", entryRows],
    ["dashboard/tests/folder", folderRows],
  ])
    assert.equal(
      rows.children.reduce((sum, passed) => sum + passed, 0) +
        (rows.outside?.figures.passed ?? 0),
      scopeFiguresOf(tests, scope).passed,
    );
});

test("each row names its gap: no result, a measured zero, a missing part, no file breakdown", () => {
  const cells = (scope, of = entry) =>
    ciScopeCellsOf(of, scopeFiguresOf(of, scope));
  // Sort figures sit beside the words; a row without a figure has none.
  assert.deepEqual(cells("tests/a.sh"), {
    counts: "1 passed test file",
    countedResults: { total: 1, failed: 0 },
    executionTime: { text: "0 ms", ms: 0 },
    completeness: "1 of 1 part present",
    gaps: [],
  });
  assert.deepEqual(cells("tests/z.sh").counts, "no CI result");
  assert.equal(cells("tests/z.sh").countedResults, undefined);
  const [missing] = entryEvidenceOf(
    makeMe.aCiProofEntry
      .at("tests")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("file")
          .brokenDown(...entry.files)
          .withUnassigned(entry.unassigned)
          .inParts(2, { missing: [2] })
          .withUnbrokenPart({ passed: 2, untimed: 0 })
          .please(),
      )
      .please(),
  );
  assert.deepEqual(cells("tests/deep", missing), {
    counts: "1 passed and 1 failed test files",
    countedResults: { total: 2, failed: 1 },
    executionTime: {
      text: "Part 2 missing, Part 3 no breakdown",
      explanation:
        "Partial: part 2 of 3 missing and part 3 of 3 has no file breakdown",
    },
    completeness: "2 of 3 parts present",
    gaps: ["part 2 of 3 missing", "part 3 of 3 has no file breakdown"],
  });
  const [entryOnly] = entryEvidenceOf(
    makeMe.aCiProofEntry
      .at("tests")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("file")
          .counting(4, 1)
          .timed(3500)
          .please(),
      )
      .please(),
  );
  assert.deepEqual(cells("tests/deep", entryOnly), {
    counts: "no file breakdown",
    countedResults: undefined,
    executionTime: { text: "no file breakdown" },
    completeness: "1 of 1 part present",
    gaps: ["part 1 of 1 has no file breakdown"],
  });
});
