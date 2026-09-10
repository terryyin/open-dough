import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
test("default greeting", () => {
  assert.equal(execFileSync(process.execPath, ["src/greet.mjs"], {encoding:"utf8"}), "Hello, Guest!\n");
});
test("trims surrounding whitespace from name", () => {
  assert.equal(execFileSync(process.execPath, ["src/greet.mjs", "  Ada  "], {encoding:"utf8"}), "Hello, Ada!\n");
});
test("preserves internal spaces in name", () => {
  assert.equal(execFileSync(process.execPath, ["src/greet.mjs", "Ada Lovelace"], {encoding:"utf8"}), "Hello, Ada Lovelace!\n");
});
