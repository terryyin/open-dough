import assert from "node:assert/strict";
import { test } from "node:test";
import * as watcher from "../../../src/skills/dough-execute-plan/scripts/watch-ci-execution.mjs";

test("the execution watcher does not export a per-SHA watchCi", () => {
  assert.equal("watchCi" in watcher, false);
});
