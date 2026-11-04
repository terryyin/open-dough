import assert from "node:assert/strict";
import { test } from "node:test";
import {
  latestProofOf,
  observedRowsOf,
} from "../../dashboard/src/proofCases.ts";
import { vitestCaseName } from "../../dashboard/src/vitestCaseNames.ts";
import { vitestRowsOf } from "../../dashboard/src/vitestCases.ts";
import { file, lines, namesOf, passed } from "./intent-vitest-observations.mjs";

test("a case is named by its suite path joined as Vitest joins full names", () => {
  assert.equal(
    vitestCaseName(["Cart", "totals", "adds"]),
    "Cart > totals > adds",
  );
});

test("it and test calls are rows at their call's 1-based line", () => {
  const rows = vitestRowsOf(
    lines(
      'import { it, test } from "vitest";',
      "",
      'it("adds an item", () => {});',
      "test('removes an item', () => {});",
      "it(",
      '  "spans lines",',
      "  () => {},",
      ");",
    ),
    [],
  );
  assert.deepEqual(rows, [
    { name: "adds an item", line: 3 },
    { name: "removes an item", line: 4 },
    { name: "spans lines", line: 5 },
  ]);
});

test("modifier chains name the same cases", () => {
  const rows = vitestRowsOf(
    lines(
      'it.skip("skipped", () => {});',
      'it.only("only", () => {});',
      'it.todo("todo");',
      'test.concurrent("concurrent", async () => {});',
      'it.concurrent.skip("chained", async () => {});',
      'it.skipIf(process.env.CI)("skipped in CI", () => {});',
      'describe.skip("Suite", () => { it("inside", () => {}); });',
    ),
    [],
  );
  assert.deepEqual(namesOf(rows), [
    "skipped",
    "only",
    "todo",
    "concurrent",
    "chained",
    "skipped in CI",
    "Suite > inside",
  ]);
});

test("names are string literals or template literals without substitutions", () => {
  const rows = vitestRowsOf(
    lines(
      "it(`plain template`, () => {});",
      "it(`with ${kind}`, () => {});",
      "it(caseName, () => {});",
      'it("joined " + kind, () => {});',
      'it("escaped \\"quote\\" and \\u00e9", () => {});',
    ),
    [],
  );
  assert.deepEqual(rows, [
    { name: "plain template", line: 1 },
    { name: 'escaped "quote" and é', line: 5 },
  ]);
});

test("nested describe and suite calls name the path, describe.each included", () => {
  const rows = vitestRowsOf(
    lines(
      'describe("Cart", () => {',
      '  suite("totals", () => {',
      '    it("adds", () => {});',
      "  });",
      '  it("empties", () => {});',
      "});",
      'describe.each(["a", "b"])("letter %s", () => {',
      '  it("reads", () => {});',
      "});",
      'it("top level", () => {});',
    ),
    [passed(["letter b", "reads"]), passed(["letter a", "reads"])],
  );
  assert.deepEqual(rows, [
    { name: "Cart > totals > adds", line: 3 },
    { name: "Cart > empties", line: 5 },
    { name: "letter a > reads", line: 8 },
    { name: "letter b > reads", line: 8 },
    { name: "top level", line: 10 },
  ]);
});

test("a suite whose name is not a literal is not read, nor anything inside it", () => {
  const rows = vitestRowsOf(
    lines(
      "describe(Component.name, () => {",
      '  it("would be misnamed", () => {});',
      '  describe("inner", () => { it("also", () => {}); });',
      "});",
      "describe(`with ${kind}`, () => {",
      '  it("misnamed too", () => {});',
      "});",
      'it("kept", () => {});',
    ),
    [],
  );
  assert.deepEqual(rows, [{ name: "kept", line: 8 }]);
});

test("calls inside comments, strings, template literals and regular expressions are not read", () => {
  const rows = vitestRowsOf(
    lines(
      '// it("line comment", () => {});',
      '/* it("block comment", () => {});',
      '   it("still comment", () => {}); */',
      'const text = "it(\\"in a string\\", () => {})";',
      "const other = 'test(\"single\", () => {})';",
      "const doc = `",
      '  it("in a template", () => {});',
      '  ${tag(`it("nested template", () => {})`)}',
      "`;",
      'const pattern = /it\\("regex"/;',
      'helper.it("member call", () => {});',
      'it("real", () => {});',
    ),
    [],
  );
  assert.deepEqual(rows, [{ name: "real", line: 12 }]);
});

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

test("a test's observed projects are rows in code-point order from reversed input", () => {
  const rows = vitestRowsOf('it("renders", () => {});', [
    passed(["renders"], "chromium-touch"),
    passed(["renders"], "chromium"),
  ]);
  assert.deepEqual(rows, [
    { name: "renders", variant: ["chromium"], line: 1 },
    { name: "renders", variant: ["chromium-touch"], line: 1 },
  ]);
});

test("projects order by code point, uppercase first, a name without a project first", () => {
  const rows = vitestRowsOf('it("renders", () => {});', [
    passed(["renders"], "firefox"),
    passed(["renders"], "Webkit"),
    passed(["renders"]),
  ]);
  assert.deepEqual(
    rows.map(({ variant }) => variant?.[0]),
    [undefined, "Webkit", "firefox"],
  );
});

test("a test with no observations is one plain row beside observed ones", () => {
  const source = lines(
    'it("observed", () => {});',
    'it("never run", () => {});',
  );
  const observations = [passed(["observed"], "chromium")];
  const rows = observedRowsOf(
    file,
    source,
    vitestRowsOf,
    latestProofOf(observations),
  );
  assert.deepEqual(
    rows.map(({ row, observation }) => [row, observation?.durationMs]),
    [
      [{ name: "observed", variant: ["chromium"], line: 1 }, 12.5],
      [{ name: "never run", line: 2 }, undefined],
    ],
  );
});
