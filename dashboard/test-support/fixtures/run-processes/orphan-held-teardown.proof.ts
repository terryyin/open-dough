import { spawnSync } from "node:child_process";
import { test } from "../../support/pageTest.ts";
import { runIdVariable } from "../../support/runProcesses.ts";

// Leaves a process the way a server killed mid-test leaves the Cursor runner
// it detached: started by a child that has already exited, so by the time
// this worker exits it descends from nothing the worker could find, and
// inheriting this environment as a product child does. Its teardown then
// holds past the timeout, so the worker's own cleanup is abandoned too. The
// outer test reads the pid and this run's identity from the record file.
test("leaves an orphaned process and holds its teardown", () => {
  const record = process.env["OPEN_DOUGH_ORPHAN_RECORD"];
  if (record === undefined) throw new Error("Missing orphan record path.");
  // The starter records the orphan's pid itself, then exits.
  const starter = spawnSync(
    process.execPath,
    [
      "-e",
      `const child = require("node:child_process").spawn(
         process.execPath,
         ["-e", "setInterval(() => {}, 1000)", "dough-run-processes-orphan"],
         { detached: true, stdio: "ignore" },
       );
       child.unref();
       require("node:fs").writeFileSync(
         ${JSON.stringify(record)},
         JSON.stringify({
           pid: child.pid,
           runId: process.env[${JSON.stringify(runIdVariable)}],
         }),
       );`,
    ],
    { stdio: "ignore" },
  );
  if (starter.status !== 0) throw new Error("The starter did not exit 0.");
});

test.afterEach(async () => {
  await new Promise(() => {});
});
