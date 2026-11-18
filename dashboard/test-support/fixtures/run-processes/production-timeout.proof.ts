import { test } from "../../support/pageTest.ts";
import { tmpdir } from "node:os";
import { ownedProcess } from "../../../server/productionProcess.mjs";

// Starts a process group the way the production deployment does, as its own
// detached group with a child of its own, and times out before any cleanup
// of the test's own could stop it.
test("times out while a production process runs", async () => {
  const keeper = ownedProcess(
    process.execPath,
    [
      "-e",
      `require("node:child_process").spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], { stdio: "ignore" });
console.log("started");
setInterval(() => {}, 1000);`,
    ],
    { cwd: tmpdir() },
  );
  await test.step("the process has started", async () => {
    while (!keeper.output().includes("started")) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  });
  await new Promise(() => {});
});
