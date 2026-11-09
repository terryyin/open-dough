// Ranking a scope's items into leads, the folders beyond them, the tail and
// per-unit totals (./ci-proof-ranking.mjs). Which items a summary puts in
// scope: ./ci-proof-scope.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { rankedLeads } from "./ci-proof-ranking.mjs";
import { scopeOf } from "./ci-proof-scope.mjs";

// The scope items of one entry at PATH counting UNIT, with FILES as
// `[path, cases, durationMs]`.
function itemsOf(path, unit, files) {
  const entry = makeMe.aCiProofEntry.at(path).countingIn(unit);
  for (const [file, passed, durationMs] of files)
    entry.withFile(file, { passed, durationMs });
  return scopeOf(
    makeMe.aCiProofSummary.withEntries(entry.please()).please(),
    undefined,
  ).items;
}

const totalOf = (rows) => rows.reduce((sum, row) => sum + row.durationMs, 0);

test("leads are the largest items by summed time, at most 20, equal times in path order", () => {
  const files = Array.from({ length: 30 }, (...[, index]) => [
    `tests/t${String(index).padStart(2, "0")}.sh`,
    1,
    index === 7 ? 999_000 : 1000 * (index % 10),
  ]);

  const ranking = rankedLeads(itemsOf("tests", "checks", files));

  assert.equal(ranking.leads.length, 20);
  assert.equal(ranking.timedItems, 30);
  assert.deepEqual(
    ranking.leads.slice(0, 5).map((item) => [item.path, item.durationMs]),
    [
      ["tests/t07.sh", 999_000],
      ["tests/t09.sh", 9000],
      ["tests/t19.sh", 9000],
      ["tests/t29.sh", 9000],
      ["tests/t08.sh", 8000],
    ],
  );
  assert.ok(
    ranking.leads.every(
      (item, index, leads) =>
        index === 0 || leads[index - 1].durationMs >= item.durationMs,
    ),
  );
});

test("folders beyond the leads gather the rest, at most 10, and the tail holds what remains, so every timed second is counted once", () => {
  const files = Array.from({ length: 20 }, (...[, index]) => [
    `dashboard/tests/big/b${String(index).padStart(2, "0")}.spec.ts`,
    1,
    100_000,
  ]);
  for (let folder = 0; folder < 12; folder += 1)
    for (let file = 0; file < 3; file += 1)
      files.push([
        `dashboard/tests/f${String(folder).padStart(2, "0")}/s${file}.spec.ts`,
        2,
        1000 * (folder + 1),
      ]);

  const ranking = rankedLeads(itemsOf("dashboard/tests", "tests", files));

  assert.ok(
    ranking.leads.every((item) => item.folder === "dashboard/tests/big"),
  );
  assert.equal(ranking.folderCount, 12);
  assert.deepEqual(
    ranking.folders.map((folder) => folder.folder),
    [11, 10, 9, 8, 7, 6, 5, 4, 3, 2].map(
      (folder) => `dashboard/tests/f${String(folder).padStart(2, "0")}`,
    ),
  );
  assert.deepEqual(ranking.folders[0], {
    folder: "dashboard/tests/f11",
    unit: "tests",
    items: 3,
    files: 3,
    cases: 6,
    timedCases: 6,
    durationMs: 36_000,
    untimed: 0,
  });
  assert.deepEqual(ranking.tail, [
    {
      unit: "tests",
      items: 6,
      files: 6,
      cases: 12,
      timedCases: 12,
      durationMs: 9000,
      untimed: 0,
    },
  ]);
  assert.equal(ranking.totalMs, 2_000_000 + 3 * 78 * 1000);
  assert.equal(
    totalOf(ranking.leads) + totalOf(ranking.folders) + totalOf(ranking.tail),
    ranking.totalMs,
  );
});

test("mixed units stay apart: totals, folders and tail rows each carry one unit, and shares are of the scope's summed time", () => {
  const items = [
    ...itemsOf("dashboard/tests", "tests", [
      ["dashboard/tests/a.spec.ts", 10, 60_000],
      ["dashboard/tests/b.spec.ts", 2, 4000],
    ]),
    ...itemsOf("tests", "checks", [
      ["tests/a.sh", 1, 30_000],
      ["tests/b.sh", 1, 6000],
    ]),
  ];

  const ranking = rankedLeads(items);

  assert.equal(ranking.totalMs, 100_000);
  assert.deepEqual(
    ranking.units.map(({ unit, entries, files, cases, durationMs }) => ({
      unit,
      entries,
      files,
      cases,
      durationMs,
    })),
    [
      { unit: "tests", entries: 1, files: 2, cases: 12, durationMs: 64_000 },
      { unit: "checks", entries: 1, files: 2, cases: 2, durationMs: 36_000 },
    ],
  );
  assert.deepEqual(
    ranking.leads.map(({ path, unit, cases }) => [path, unit, cases]),
    [
      ["dashboard/tests/a.spec.ts", "tests", 10],
      ["tests/a.sh", "checks", 1],
      ["tests/b.sh", "checks", 1],
      ["dashboard/tests/b.spec.ts", "tests", 2],
    ],
  );
});

test("beyond the leads, each folder row and each tail row keeps one unit", () => {
  const items = [
    ...itemsOf("dashboard/tests", "tests", [
      ...Array.from({ length: 20 }, (...[, index]) => [
        `dashboard/tests/big/b${String(index).padStart(2, "0")}.spec.ts`,
        1,
        100_000,
      ]),
      ...Array.from({ length: 12 }, (...[, index]) => [
        `dashboard/tests/f${String(index).padStart(2, "0")}/s.spec.ts`,
        2,
        1000 * (index + 1),
      ]),
    ]),
    ...itemsOf(
      "tests",
      "checks",
      Array.from({ length: 12 }, (...[, index]) => [
        `tests/g${String(index).padStart(2, "0")}/c.sh`,
        1,
        1000 * (index + 1) + 500,
      ]),
    ),
  ];

  const ranking = rankedLeads(items);

  assert.ok(
    ranking.folders.every(
      (folder) =>
        folder.unit ===
        (folder.folder.startsWith("tests/") ? "checks" : "tests"),
    ),
  );
  assert.deepEqual(
    ranking.tail.map(
      ({ unit, items: count, cases, timedCases, durationMs }) => ({
        unit,
        items: count,
        cases,
        timedCases,
        durationMs,
      }),
    ),
    [
      { unit: "checks", items: 7, cases: 7, timedCases: 7, durationMs: 31_500 },
      {
        unit: "tests",
        items: 7,
        cases: 14,
        timedCases: 14,
        durationMs: 28_000,
      },
    ],
  );
});

test("items that recorded no duration count in the unit totals but never rank", () => {
  const items = scopeOf(
    makeMe.aCiProofSummary
      .withEntries(
        makeMe.aCiProofEntry
          .at("tests")
          .countingIn("checks")
          .withFile("tests/timed.sh", { passed: 2, durationMs: 800 })
          .withFile("tests/untimed.sh", { passed: 3 })
          .please(),
      )
      .please(),
    undefined,
  ).items;

  const ranking = rankedLeads(items);

  assert.deepEqual(
    ranking.leads.map((item) => item.path),
    ["tests/timed.sh"],
  );
  assert.deepEqual(ranking.units, [
    {
      unit: "checks",
      entries: 1,
      items: 2,
      files: 2,
      cases: 5,
      timedCases: 2,
      durationMs: 800,
      untimed: 3,
    },
  ]);
  assert.deepEqual([ranking.folders, ranking.tail], [[], []]);
});
