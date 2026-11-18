import assert from "node:assert/strict";
import { test } from "node:test";
import * as watcher from "../../../src/skills/dough-execute-plan/scripts/watch-ci.mjs";

test("watch-ci does not export a per-SHA watchCi", () => {
  assert.equal("watchCi" in watcher, false);
});
