// Harness for the backlog CLI tests that change the backlog while a run waits
// for its lock: the real command run as a child process whose wait is
// observable.
import { spawn } from "node:child_process";
import { cli } from "./product-backlog-fixture.mjs";

// Observes the moment a run finds the backlog lock held, without adding a test
// hook to the command: a preloaded module reports the first refused lock
// directory over the IPC channel. Only then has the run finished everything it
// does before the lock, so a test may change the file behind it.
const lockBusyProbe = `data:text/javascript,${encodeURIComponent(`
  import fs from "node:fs";
  import { syncBuiltinESMExports } from "node:module";
  const mkdir = fs.mkdirSync;
  let reported = false;
  fs.mkdirSync = function (path, ...rest) {
    try {
      return mkdir.call(this, path, ...rest);
    } catch (error) {
      if (!reported && error.code === "EEXIST" && String(path).endsWith(".lock")) {
        reported = true;
        process.send("lock-busy");
      }
      throw error;
    }
  };
  syncBuiltinESMExports();
`)}`;

// Runs the real command like `run`, and also resolves `blocked` once the run is
// waiting for a held lock. `blocked` rejects if the run ends before that, so a
// run that never waits fails the test instead of hanging it.
export function runBlockedOnLock(project, arguments_, environment = {}) {
  const child = spawn(
    process.execPath,
    ["--import", lockBusyProbe, cli, ...arguments_],
    {
      cwd: project.directory,
      env: { ...process.env, ...environment },
      stdio: ["ignore", "pipe", "pipe", "ipc"],
    },
  );
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });
  const completed = new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => resolve({ code, stdout, stderr }));
  });
  const blocked = new Promise((resolve, reject) => {
    child.once("message", (message) => {
      if (message === "lock-busy") resolve();
    });
    completed.then(
      (result) =>
        reject(
          new Error(
            `The run ended before waiting for the lock: ${result.stderr}`,
          ),
        ),
      reject,
    );
  });
  // A run that waited as expected leaves `blocked` resolved, so the rejection
  // above is never observed; this keeps it from reporting as unhandled.
  blocked.catch(() => {});
  return { blocked, completed };
}
