// Hold the initial fetch at the Git process boundary. The parent spec sends
// progress and control messages before allowing Git to reach its real origin.
import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";

const log = process.env.DOUGH_SYNC_TEST_LOG;
const reports = `${log}.${process.pid}`;
writeFileSync(reports, "");
appendFileSync(log, `pid ${process.pid}\n`);

let handled = 0;
while (true) {
  const lines = readFileSync(reports, "utf8").split("\n").slice(handled, -1);
  for (const report of lines) {
    if (report === "fetch") {
      const result = spawnSync(
        process.env.DOUGH_SYNC_TEST_GIT,
        process.argv.slice(2),
        { stdio: "inherit" },
      );
      process.exit(result.status ?? 1);
    }
    if (report === "hold-child") {
      const child = spawn("sleep", ["30"], { stdio: "inherit" });
      appendFileSync(log, `child ${child.pid}\n`);
      await new Promise((done) => child.once("close", done));
    } else {
      const output =
        report === "flood"
          ? "remote diagnostics\n".repeat(100000)
          : `${report}\r`;
      await new Promise((done) => process.stderr.write(output, done));
    }
    appendFileSync(log, `sent ${report}\n`);
    handled += 1;
  }
  await delay(10);
}
