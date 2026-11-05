import assert from "node:assert/strict";
import { test } from "node:test";
import { vitestRowsOf } from "../../dashboard/src/vitestCases.ts";
import { lines, namesOf } from "./intent-vitest-observations.mjs";

// Playwright call forms on the shared test-call rule: family names as members
// of `test`, Playwright modifiers, anonymous describe read-through, and
// configure / use / hooks / step naming nothing. Vitest bare-call fixtures
// stay pinned in intent-vitest-cases*.test.mjs.

test("test.describe names the path and keeps the line of the test token", () => {
  const rows = vitestRowsOf(
    lines(
      'import { test } from "@playwright/test";',
      "",
      'test.describe("touch reading", () => {',
      '  test("keeps a long story readable", () => {});',
      "});",
    ),
    [],
  );
  assert.deepEqual(rows, [
    { name: "touch reading > keeps a long story readable", line: 4 },
  ]);
});

test("test.describe.serial and test.describe.parallel name suites", () => {
  const rows = vitestRowsOf(
    lines(
      'test.describe.serial("serial suite", () => {',
      '  test("first", () => {});',
      "});",
      'test.describe.parallel("parallel suite", () => {',
      '  test("alone", () => {});',
      "});",
    ),
    [],
  );
  assert.deepEqual(namesOf(rows), [
    "serial suite > first",
    "parallel suite > alone",
  ]);
  assert.deepEqual(
    rows.map(({ line }) => line),
    [2, 5],
  );
});

test("test.describe.configure names no case", () => {
  const rows = vitestRowsOf(
    lines(
      'test.describe.configure({ mode: "serial" });',
      'test("still listed", () => {});',
    ),
    [],
  );
  assert.deepEqual(rows, [{ name: "still listed", line: 2 }]);
});

test("anonymous test.describe(fn) adds no segment and is read through", () => {
  const rows = vitestRowsOf(
    lines(
      "test.describe(() => {",
      '  test("top of anonymous", () => {});',
      '  test.describe("inner", () => {',
      '    test("nested", () => {});',
      "  });",
      "});",
    ),
    [],
  );
  assert.deepEqual(rows, [
    { name: "top of anonymous", line: 2 },
    { name: "inner > nested", line: 4 },
  ]);
});

test("test.fixme and test.fail name cases; test.it is a test", () => {
  const rows = vitestRowsOf(
    lines(
      'test.fixme("deferred", () => {});',
      'test.fail("expected failure", () => {});',
      'test.it("alias", () => {});',
    ),
    [],
  );
  assert.deepEqual(rows, [
    { name: "deferred", line: 1 },
    { name: "expected failure", line: 2 },
    { name: "alias", line: 3 },
  ]);
});

test("test.use, hooks and test.step name no case", () => {
  const rows = vitestRowsOf(
    lines(
      "test.use({ viewport: { width: 800, height: 600 } });",
      "test.beforeEach(async () => {});",
      "test.afterAll(async () => {});",
      'test("body", async ({}, testInfo) => {',
      '  await test.step("detail", async () => {});',
      "});",
    ),
    [],
  );
  assert.deepEqual(rows, [{ name: "body", line: 4 }]);
});

test("a helper.test.describe member is not a family call", () => {
  const rows = vitestRowsOf(
    lines(
      'helper.test.describe("foreign", () => {',
      '  test("inside foreign", () => {});',
      "});",
      'test("own", () => {});',
    ),
    [],
  );
  assert.deepEqual(namesOf(rows), ["inside foreign", "own"]);
});
