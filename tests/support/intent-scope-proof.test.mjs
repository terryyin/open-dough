// A selected Intent entry's or folder's CI proof derived from one summary
// (../../dashboard/src/ciScopeProof.ts) and worded as the homepage words its
// entries (../../dashboard/src/ciProofWording.ts,
// ../../dashboard/src/ciProofTimeWords.ts): immediate children in the
// tree's order, figures summed by path whatever the tree lists, what no child
// row shows, each result counted in exactly one row, and each gap — no breakdown, no matched result, a measured zero,
// an untimed result, a missing part, a part without a breakdown — named
// rather than shown as zero or complete. Browser journey:
// ../../dashboard/tests/intent-summary-ci-proof.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  immediateChildrenOf,
  outsideOf,
  owningEntryOf,
  scopeFiguresOf,
} from "../../dashboard/src/ciScopeProof.ts";
import {
  ciProofCellsOf,
  ciScopeCellsOf,
} from "../../dashboard/src/ciProofWording.ts";
import { executionTimeWords } from "../../dashboard/src/ciProofTimeWords.ts";

const present = (part, counts, extra = {}) => ({
  part,
  status: "present",
  passed: 0,
  failed: 0,
  other: 0,
  ...counts,
  ...extra,
});
const file = (path, counts, extra = {}) => ({
  path,
  passed: 0,
  failed: 0,
  other: 0,
  ...counts,
  ...extra,
});

const entry = {
  path: "tests",
  unit: "checks",
  passed: 4,
  failed: 1,
  other: 0,
  durationMs: 3500,
  untimed: 1,
  parts: [
    present(
      1,
      { passed: 4, failed: 1 },
      { durationMs: 3500, untimed: 1, breakdown: true },
    ),
  ],
  files: [
    file("tests/a.sh", { passed: 1 }, { durationMs: 0 }),
    file("tests/deep/b.sh", { passed: 1 }, { durationMs: 1200 }),
    file("tests/deep/er/c.sh", { failed: 1 }, { durationMs: 1300 }),
    file("tests/support/hidden.sh", { passed: 1 }, { untimed: 1 }),
  ],
  unassigned: { passed: 1, failed: 0, other: 0, durationMs: 1000 },
};
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
  const other = { ...entry, path: "tests/deep/er" };
  assert.equal(owningEntryOf([entry, other], "tests/deep"), entry);
  assert.equal(owningEntryOf([entry, other], "tests/deep/er/c.sh"), other);
  assert.equal(owningEntryOf([entry], "testsuite"), undefined);
  assert.deepEqual(scopeFiguresOf(entry, "tests/deep"), {
    passed: 1,
    failed: 1,
    other: 0,
    untimed: 0,
    files: 2,
    durationMs: 2500,
  });
  assert.deepEqual(scopeFiguresOf(entry, "tests/support").files, 1);
  assert.deepEqual(scopeFiguresOf(entry, "tests/z.sh").files, 0);
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
  const tests = {
    path: "dashboard/tests",
    unit: "tests",
    passed: 3,
    failed: 0,
    other: 0,
    parts: [present(1, { passed: 3 }, { breakdown: true })],
    files: [
      file("dashboard/tests/folder/a.spec.ts", { passed: 1 }),
      file("dashboard/tests/folder/old.spec.ts", { passed: 1 }),
      file("dashboard/tests/root.spec.ts", { passed: 1 }),
    ],
  };
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

test("each row names its gap: no result, a measured zero, an untimed result, a missing part, no file breakdown", () => {
  const cells = (scope, of = entry) =>
    ciScopeCellsOf(of, scopeFiguresOf(of, scope));
  assert.deepEqual(cells("tests/a.sh"), {
    counts: "1 passed checks",
    executionTime: "0 ms",
    completeness: "1 of 1 part present",
    gaps: [],
  });
  assert.deepEqual(cells("tests/z.sh").counts, "no CI result");
  assert.deepEqual(cells("tests/z.sh").executionTime, "no CI result");
  assert.equal(
    cells("tests/support").executionTime,
    "not recorded: 1 check without a duration",
  );
  assert.equal(
    ciProofCellsOf(entry).executionTime,
    "partial: 1 check without a duration",
  );
  const missing = {
    ...entry,
    parts: [
      ...entry.parts,
      { part: 2, status: "missing" },
      present(3, { passed: 2 }),
    ],
  };
  assert.deepEqual(cells("tests/deep", missing), {
    counts: "1 passed and 1 failed checks",
    executionTime:
      "partial: part 2 of 3 missing and part 3 of 3 has no file breakdown",
    completeness: "2 of 3 parts present",
    gaps: ["part 2 of 3 missing", "part 3 of 3 has no file breakdown"],
  });
  const entryOnly = {
    ...entry,
    parts: [present(1, { passed: 4, failed: 1 }, { durationMs: 3500 })],
    files: undefined,
    unassigned: undefined,
  };
  assert.deepEqual(cells("tests/deep", entryOnly), {
    counts: "no file breakdown",
    executionTime: "no file breakdown",
    completeness: "1 of 1 part present",
    gaps: ["part 1 of 1 has no file breakdown"],
  });
});

test("execution time tells sub-minute scopes apart and keeps whole minutes whole", () => {
  assert.deepEqual(
    [
      0, 340, 999.6, 1000, 12_540, 59_940, 59_960, 240_000, 245_000, 3_723_000,
    ].map(executionTimeWords),
    [
      "0 ms",
      "340 ms",
      "1.0 s",
      "1.0 s",
      "12.5 s",
      "59.9 s",
      "1 min",
      "4 min",
      "4 min 5 s",
      "1 h 2 min",
    ],
  );
});
