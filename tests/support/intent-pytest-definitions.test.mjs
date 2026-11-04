import assert from "node:assert/strict";
import { test } from "node:test";
import { pytestRowsOf } from "../../dashboard/src/pytestCases.ts";

// The definitions a Python text yields, each as a plain row of its name and
// 1-based definition line.
const definitionsOf = (lines) => pytestRowsOf(lines.join("\n"), []);

test("a def test_ inside a triple-quoted string is not a case", () => {
  for (const quote of ['"""', "'''"]) {
    assert.deepEqual(
      definitionsOf([
        "def helper():",
        `    ${quote}Example:`,
        "def test_in_docstring():",
        `    ${quote}`,
        "",
        "def test_after():",
        "    pass",
      ]),
      [{ name: "test_after", line: 6 }],
    );
  }
});

test("a def test_ inside a bracketed multi-line expression is not a case", () => {
  assert.deepEqual(
    definitionsOf([
      "def test_open(",
      "    value,",
      "):",
      "    pass",
      "cases = [",
      "def test_in_brackets():",
      "]",
      "def test_after():",
      "    pass",
    ]),
    [
      { name: "test_open", line: 1 },
      { name: "test_after", line: 8 },
    ],
  );
});

test("a comment ends a line's scan, so its brackets and quotes do not count", () => {
  assert.deepEqual(
    definitionsOf([
      "# def test_commented():",
      "value = 1  # ( ''' [",
      "def test_after_comment():",
      "    pass",
    ]),
    [{ name: "test_after_comment", line: 3 }],
  );
});

test("a quoted # does not end a line's scan", () => {
  assert.deepEqual(
    definitionsOf([
      'marks = "#" + str(',
      "def test_in_brackets():",
      ")",
      "label = '#' + '''",
      "def test_in_string():",
      "'''",
      'escaped = "\\"(#"',
      "def test_after():",
      "    pass",
    ]),
    [{ name: "test_after", line: 8 }],
  );
});

test("an async def test_ is a case", () => {
  assert.deepEqual(definitionsOf(["async def test_waits():", "    pass"]), [
    { name: "test_waits", line: 1 },
  ]);
});

test("test_ methods of Test classes, nested ones included, are named with ::", () => {
  assert.deepEqual(
    definitionsOf([
      "class TestOuter:",
      "    def test_outer(self):",
      "        pass",
      "",
      "    class TestInner:",
      "        async def test_inner(self):",
      "            pass",
      "",
      "    def test_outer_again(self):",
      "        pass",
    ]),
    [
      { name: "TestOuter::test_outer", line: 2 },
      { name: "TestOuter::TestInner::test_inner", line: 6 },
      { name: "TestOuter::test_outer_again", line: 9 },
    ],
  );
});

test("nested helpers and methods outside Test classes are not cases", () => {
  assert.deepEqual(
    definitionsOf([
      "def test_outer():",
      "    def test_helper():",
      "        pass",
      "",
      "class Helpers:",
      "    def test_method(self):",
      "        pass",
      "",
      "    class TestHidden:",
      "        def test_hidden(self):",
      "            pass",
      "",
      "class TestCases:",
      "    def helper(self):",
      "        def test_nested(self):",
      "            pass",
      "    class Inner:",
      "        def test_in_inner(self):",
      "            pass",
    ]),
    [{ name: "test_outer", line: 1 }],
  );
});

test("a dedent ends a class's block", () => {
  assert.deepEqual(
    definitionsOf([
      "class TestCases:",
      "    def test_method(self):",
      "        pass",
      "",
      "def helper():",
      "    pass",
      "",
      "def test_module():",
      "    pass",
      "",
      "class TestMore:",
      "    pass",
      "# a comment at column 0 does not end the block",
      "    def test_more(self):",
      "        pass",
      "def test_last():",
      "    pass",
    ]),
    [
      { name: "TestCases::test_method", line: 2 },
      { name: "test_module", line: 8 },
      { name: "TestMore::test_more", line: 14 },
      { name: "test_last", line: 16 },
    ],
  );
});
