import assert from "node:assert/strict";
import { test } from "node:test";
import {
  recordedCaseSuffix,
  resolveCaseTargetLine,
} from "../../dashboard/src/intentCaseTargetLine.ts";

const file = [
  "def test_example():",
  '    assert "ok"',
  "",
  "def test_unique():",
  "    assert True",
  "",
  "def test_shared():",
  "    pass",
  "def test_shared():",
  "    pass",
].join("\n");

test("numeric path:line resolves when in range", () => {
  assert.equal(resolveCaseTargetLine(file, "4"), 4);
  assert.equal(resolveCaseTargetLine(file, "1"), 1);
  assert.equal(resolveCaseTargetLine(file, "0"), undefined);
  assert.equal(resolveCaseTargetLine(file, "99"), undefined);
});

test("unique case name resolves to its only line", () => {
  assert.equal(resolveCaseTargetLine(file, "test_unique"), 4);
});

test("absent or duplicated case name leaves the file start", () => {
  assert.equal(resolveCaseTargetLine(file, "missing"), undefined);
  assert.equal(resolveCaseTargetLine(file, "test_shared"), undefined);
});

test("recordedCaseSuffix formats line and name targets", () => {
  assert.equal(recordedCaseSuffix("44"), ":44");
  assert.equal(recordedCaseSuffix("test_clip"), "::test_clip");
});
