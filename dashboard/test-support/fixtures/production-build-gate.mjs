// The native build gate published with main (../support/productionBuildGate.ts):
// it records its arrival, then waits for its hold file under HOME to be
// removed. A plain argument gates the build's start (hold-build-<ordinal>,
// arrival appended to builds.log); "completed" gates after Vite succeeds
// (hold-completed-build, arrival written to completed-build).
// Distribution/tests/test-runner/production-build-gate.sh proves arrival
// accepts an immediate release.
import {
  appendFileSync,
  existsSync,
  readFileSync,
  watch,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
// The deployment checkout the build runs in, not the repository root.
// eslint-disable-next-line no-restricted-syntax
const checkout = path.basename(process.cwd());
const log = path.join(homedir(), "builds.log");
let hold;
let arrived;
if (process.argv[2] === "completed") {
  hold = path.join(homedir(), "hold-completed-build");
  arrived = () =>
    writeFileSync(path.join(homedir(), "completed-build"), checkout);
} else {
  const ordinal = readFileSync(log, "utf8").split("\n").slice(0, -1).length + 1;
  hold = path.join(homedir(), `hold-build-${ordinal}`);
  arrived = () => appendFileSync(log, `${process.pid} ${checkout}\n`);
}
let observer;
let looking;
try {
  await new Promise((resolve, reject) => {
    let published = false;
    function check() {
      if (published && !existsSync(hold)) resolve();
    }
    try {
      observer = watch(hold, check);
      observer.once("error", reject);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    // Also observe the release state when macOS delays a file event under load.
    looking = setInterval(check, 20);
    // Actual-file observation is armed by the next poll. Publish arrival
    // only after it, including when invoked from a poll callback.
    setImmediate(() =>
      setImmediate(() => {
        arrived();
        published = true;
        check();
      }),
    );
  });
} finally {
  clearInterval(looking);
  observer?.close();
}
