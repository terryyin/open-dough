// Ranking a scope's items within each unit into leads, the folders beyond
// them and the tail, with every unit's totals (./ci-proof-ranking.mjs).
// Which items a summary puts in scope: ./ci-proof-scope.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { rankedLeads } from "./ci-proof-ranking.mjs";
import { scopeOf } from "./ci-proof-scope.mjs";

// The scope items of ENTRIES.
const itemsOf = (...entries) =>
  scopeOf(makeMe.aCiProofSummary.withEntries(...entries).please(), undefined)
    .items;

// An entry at PATH whose results are in UNIT, with FILES as
// `[path, results, durationMs]`.
function entryOf(path, unit, files) {
  const entry = makeMe.aCiProofEntry.at(path).counting(1, unit);
  for (const [file, passed, durationMs] of files)
    entry.withFile(file, { passed, durationMs });
  return entry.please();
}

const totalOf = (rows) => rows.reduce((sum, row) => sum + row.durationMs, 0);

test("leads are a unit's largest items by summed time, at most 20, equal times in path order", () => {
  const files = Array.from({ length: 30 }, (...[, index]) => [
    `tests/t${String(index).padStart(2, "0")}.sh`,
    1,
    index === 7 ? 999_000 : 1000 * (index % 10),
  ]);

  const [ranking] = rankedLeads(
    itemsOf(entryOf("tests", "file", files)),
  ).rankings;

  assert.equal(ranking.unit, "file");
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

test("folders beyond the leads gather the rest, at most 10, and the tail holds what remains, so every timed second of the unit is counted once", () => {
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

  const [ranking] = rankedLeads(
    itemsOf(entryOf("dashboard/tests", "case", files)),
  ).rankings;

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
    items: 3,
    paths: 3,
    results: 6,
    timedResults: 6,
    durationMs: 36_000,
    untimed: 0,
  });
  assert.deepEqual(ranking.tail, {
    items: 6,
    paths: 6,
    results: 12,
    timedResults: 12,
    durationMs: 9000,
    untimed: 0,
  });
  assert.equal(ranking.totalMs, 2_000_000 + 3 * 78 * 1000);
  assert.equal(
    totalOf(ranking.leads) + totalOf(ranking.folders) + ranking.tail.durationMs,
    ranking.totalMs,
  );
});

test("units stay apart: each has its totals and its own ranking of its own time, test cases before test files, sharing the lead and folder budget", () => {
  const items = itemsOf(
    entryOf("tests", "file", [
      ["tests/a.sh", 1, 30_000],
      ...Array.from({ length: 16 }, (...[, index]) => [
        `tests/g${String(index).padStart(2, "0")}/c.sh`,
        1,
        1000 * (index + 1),
      ]),
    ]),
    entryOf("dashboard/tests", "case", [
      ["dashboard/tests/a.spec.ts", 10, 60_000],
      ["dashboard/tests/b.spec.ts", 2, 4000],
    ]),
  );

  const ranking = rankedLeads(items);

  assert.deepEqual(
    ranking.units.map(({ unit, entries, paths, results, durationMs }) => ({
      unit,
      entries,
      paths,
      results,
      durationMs,
    })),
    [
      { unit: "case", entries: 1, paths: 2, results: 12, durationMs: 64_000 },
      { unit: "file", entries: 1, paths: 17, results: 17, durationMs: 166_000 },
    ],
  );
  const [cases, files] = ranking.rankings;
  assert.deepEqual(
    [cases.unit, cases.totalMs, cases.leads.map((item) => item.path)],
    [
      "case",
      64_000,
      ["dashboard/tests/a.spec.ts", "dashboard/tests/b.spec.ts"],
    ],
  );
  assert.deepEqual(
    [files.unit, files.totalMs, files.leads.length, files.folders.length],
    ["file", 166_000, 10, 5],
  );
  assert.ok(files.leads.every((item) => item.unit === "file"));
  assert.equal(
    totalOf(files.leads) + totalOf(files.folders) + files.tail.durationMs,
    files.totalMs,
  );
});

test("items that recorded no duration count in the unit totals but never rank, and a unit with none timed has no ranking", () => {
  const items = itemsOf(
    makeMe.aCiProofEntry
      .at("tests")
      .withFile("tests/timed.sh", { passed: 2, durationMs: 800 })
      .withFile("tests/untimed.sh", { passed: 3 })
      .please(),
    makeMe.aCiProofEntry.at("e2e").counting(4, "file").please(),
  );

  const ranking = rankedLeads(items);

  assert.deepEqual(ranking.units, [
    {
      unit: "case",
      entries: 1,
      items: 2,
      paths: 2,
      results: 5,
      timedResults: 2,
      durationMs: 800,
      untimed: 3,
    },
    {
      unit: "file",
      entries: 1,
      items: 1,
      paths: 0,
      results: 4,
      timedResults: 0,
      durationMs: 0,
      untimed: 4,
    },
  ]);
  assert.deepEqual(
    ranking.rankings.map(({ unit, leads, folders, tail }) => ({
      unit,
      leads: leads.map((item) => item.path),
      folders,
      tail,
    })),
    [{ unit: "case", leads: ["tests/timed.sh"], folders: [], tail: undefined }],
  );
});
