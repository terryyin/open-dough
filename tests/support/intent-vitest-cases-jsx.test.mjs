import assert from "node:assert/strict";
import { test } from "node:test";
import { vitestRowsOf } from "../../dashboard/src/vitestCases.ts";
import { lines } from "./intent-vitest-observations.mjs";

test("a JSX self-closing tag is not a regular expression", () => {
  const rows = vitestRowsOf(
    lines(
      'it("renders", () => {',
      "  render(<Card status={status} />)",
      "})",
      'it("renders again", () => {',
      "  render(<Card />)",
      "})",
    ),
    [],
  );
  assert.deepEqual(rows, [
    { name: "renders", line: 1 },
    { name: "renders again", line: 4 },
  ]);
});

test("JSX text with an apostrophe, a URL or a backtick keeps every row on its line", () => {
  for (const { source, rows } of [
    {
      source: lines(
        'it("a", () => {',
        "  render(<p>Don't</p>);",
        "});",
        'it("b", () => {});',
        'it("c", () => {});',
      ),
      rows: [
        { name: "a", line: 1 },
        { name: "b", line: 4 },
        { name: "c", line: 5 },
      ],
    },
    {
      source: lines(
        'it("a", () => { render(<p>see http://x</p>); });',
        'it("b", () => {});',
      ),
      rows: [
        { name: "a", line: 1 },
        { name: "b", line: 2 },
      ],
    },
    {
      source: lines(
        'it("a", () => { render(<code>`</code>); });',
        'it("b", () => {});',
      ),
      rows: [
        { name: "a", line: 1 },
        { name: "b", line: 2 },
      ],
    },
  ]) {
    assert.deepEqual(vitestRowsOf(source, []), rows);
  }
});
