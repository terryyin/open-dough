// Vite and other suite descendants may explicitly enable Node's compile
// cache. The group run (../../../scripts/dashboard-group-run.mjs and
// ../../test-support/support/runnerConfig.mjs) disables its writes before any
// worker starts, so every descendant inherits the disable and leaves another
// session's cache intact however it ends.
import { expect, test } from "vitest";

test("suite descendants inherit the compile-cache disable", () => {
  expect(process.env["NODE_DISABLE_COMPILE_CACHE"]).toBe("1");
});
