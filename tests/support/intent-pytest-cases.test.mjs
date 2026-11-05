import assert from "node:assert/strict";
import { test } from "node:test";
import { pytestRowsOf } from "../../dashboard/src/pytestCases.ts";

const passed = (name, parameterId) => ({
  file: "tests/test_rounding.py",
  name,
  ...(parameterId === undefined ? {} : { variant: [parameterId] }),
  outcome: "passed",
  attempts: 1,
  durationMs: 10,
  finishedAt: "2026-11-04T00:00:00.000Z",
  commit: "aaaaaaa1111",
  fileBlob: "blob",
});

const source = [
  "def test_rounding(mode):",
  "    pass",
  "",
  "def test_plain():",
  "    pass",
  "",
].join("\n");

const idsOf = (rows) =>
  rows
    .filter(({ name }) => name === "test_rounding")
    .map(({ variant }) => variant?.[0]);

for (const ids of [
  ["up", "even"],
  ["even", "up"],
]) {
  test(`parameter ids ${ids.join(", ")} read in parameter id order`, () => {
    const rows = pytestRowsOf(
      source,
      ids.map((id) => passed("test_rounding", id)),
    );
    assert.deepEqual(idsOf(rows), ["even", "up"]);
  });
}

test("parameter ids order by code point, uppercase before lowercase", () => {
  const rows = pytestRowsOf(source, [
    passed("test_rounding", "a"),
    passed("test_rounding", "Z"),
  ]);
  assert.deepEqual(idsOf(rows), ["Z", "a"]);
});

test("parameter ids beyond the Basic Multilingual Plane order by code point", () => {
  for (const ids of [
    ["\u{1F600}", "｡"],
    ["｡", "\u{1F600}"],
  ]) {
    const rows = pytestRowsOf(
      source,
      ids.map((id) => passed("test_rounding", id)),
    );
    assert.deepEqual(idsOf(rows), ["｡", "\u{1F600}"]);
  }
});

test("functions keep definition order and an unobserved one is one plain row", () => {
  const rows = pytestRowsOf(source, [
    passed("test_rounding", "up"),
    passed("test_rounding", "even"),
  ]);
  assert.deepEqual(rows, [
    { name: "test_rounding", variant: ["even"], line: 1 },
    { name: "test_rounding", variant: ["up"], line: 1 },
    { name: "test_plain", line: 4 },
  ]);
});
