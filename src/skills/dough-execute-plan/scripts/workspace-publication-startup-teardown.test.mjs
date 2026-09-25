// How a startup race test's teardown ends a push it held, even when the test
// failed before releasing it.
import { spawn } from "node:child_process";
import { once } from "node:events";
import { test } from "node:test";
import { git } from "./publication-test-fixtures.mjs";
import { createQueuedTrunk } from "./workspace-publication-fixtures.mjs";
import { holdFirstPush } from "./workspace-publication-startup-test-fixtures.mjs";

test("fixture teardown releases a held push that arrived before the test released it", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const barrier = await holdFirstPush(trunk);
  await git(trunk.integration, "switch", "--quiet", "-c", "exec/a");
  const push = spawn("git", ["push", "--quiet", "origin", "exec/a"], {
    cwd: trunk.integration,
    stdio: "ignore",
  });
  const exited = once(push, "exit");
  await barrier.awaitArrival({ result: exited });
  // A failing assertion here skips the test's own release; only teardown runs.
  await trunk.cleanup();
  await exited;
});
