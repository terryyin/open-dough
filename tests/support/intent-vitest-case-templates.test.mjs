import assert from "node:assert/strict";
import { test } from "node:test";
import { vitestRowsOf } from "../../dashboard/src/vitestCases.ts";
import { lines, namesOf, passed } from "./intent-vitest-observations.mjs";

test("a template's observed names expand in code-point order from unsorted observations", () => {
  const source = lines(
    'describe("rounds", () => {',
    '  it.each([1, 2, 10])("value %i", (n) => {});',
    "});",
  );
  for (const order of [
    ["value 2", "value 10", "value 1"],
    ["value 1", "value 10", "value 2"],
  ]) {
    const rows = vitestRowsOf(
      source,
      order.map((name) => passed(["rounds", name])),
    );
    assert.deepEqual(rows, [
      { name: "rounds > value 1", line: 2 },
      { name: "rounds > value 10", line: 2 },
      { name: "rounds > value 2", line: 2 },
    ]);
  }
});

test("each placeholder kind fits the names Vitest fills in", () => {
  const source = lines(
    'it.each(cases)("string %s", () => {});',
    'it.each(cases)("number %d and %f", () => {});',
    'it.each(cases)("index %# of %$", () => {});',
    'it.each(cases)("json %j object %o", () => {});',
    'it.each(cases)("field $name at $place.city", () => {});',
    'it.for(cases)("for %s", () => {});',
    'it.each(cases)("100%% of %s", () => {});',
  );
  const names = [
    "string anything goes",
    "number -1.5 and 2",
    "index 0 of 1",
    'json {"a":1} object { a: 1 }',
    "field Ann at Oslo",
    "for row",
    "100% of rows",
  ];
  const rows = vitestRowsOf(
    source,
    names.map((name) => passed([name])),
  );
  assert.deepEqual(namesOf(rows), names);
});

test("a number placeholder does not fit a word", () => {
  const rows = vitestRowsOf('it.each(cases)("count %i", () => {});', [
    passed(["count many"]),
  ]);
  assert.deepEqual(rows, [{ name: "count %i", line: 1 }]);
});

test("an unobserved template is one row named as written", () => {
  const rows = vitestRowsOf('it.each([1, 2])("value %i", () => {});', []);
  assert.deepEqual(rows, [{ name: "value %i", line: 1 }]);
});

test("a template without placeholders names one case", () => {
  const rows = vitestRowsOf('it.each([1, 2])("adds every row", (n) => {});', [
    passed(["adds every row"]),
  ]);
  assert.deepEqual(rows, [{ name: "adds every row", line: 1 }]);
});

test("placeholders outside each and for are part of a literal name", () => {
  const rows = vitestRowsOf('it("shows %s literally", () => {});', [
    passed(["shows x literally"]),
  ]);
  assert.deepEqual(rows, [{ name: "shows %s literally", line: 1 }]);
});

test("type arguments and tagged tables keep the template", () => {
  const rows = vitestRowsOf(
    lines(
      'it.each<{ a: number; f: () => void }>(cases)("typed %s", () => {});',
      "it.each`",
      "  a    | b",
      "  ${1} | ${2}",
      '`("tagged $a plus $b", ({ a, b }) => {});',
    ),
    [passed(["typed x"]), passed(["tagged 1 plus 2"])],
  );
  assert.deepEqual(rows, [
    { name: "typed x", line: 1 },
    { name: "tagged 1 plus 2", line: 2 },
  ]);
});

test("an observed name a literal test or earlier template names is not another template's", () => {
  const rows = vitestRowsOf(
    lines(
      'it("adds 2", () => {});',
      'it.each(cases)("adds %s", () => {});',
      'it.each(cases)("adds %i", () => {});',
    ),
    [passed(["adds 2"]), passed(["adds 3"]), passed(["adds x"])],
  );
  assert.deepEqual(rows, [
    { name: "adds 2", line: 1 },
    { name: "adds 3", line: 2 },
    { name: "adds x", line: 2 },
    { name: "adds %i", line: 3 },
  ]);
});

test("a template's rows order names first, then each name's projects", () => {
  const rows = vitestRowsOf('it.each(cases)("row %s", () => {});', [
    passed(["row b"], "chromium-touch"),
    passed(["row b"], "chromium"),
    passed(["row a"], "chromium-touch"),
  ]);
  assert.deepEqual(rows, [
    { name: "row a", variant: ["chromium-touch"], line: 1 },
    { name: "row b", variant: ["chromium"], line: 1 },
    { name: "row b", variant: ["chromium-touch"], line: 1 },
  ]);
});
