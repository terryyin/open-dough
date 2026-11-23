// Exercise a signal received while the real source launch is still returning.
import childProcess from "node:child_process";
import { existsSync } from "node:fs";
import { syncBuiltinESMExports } from "node:module";

const release = process.env.SPAWN_RELEASE;
if (release === undefined) throw new Error("Missing setup spawn release path");

const spawn = childProcess.spawn;
const sleeper = new Int32Array(new SharedArrayBuffer(4));
childProcess.spawn = (...args) => {
  const child = spawn(...args);
  const deadline = Date.now() + 10_000;
  while (!existsSync(release)) {
    if (Date.now() >= deadline)
      throw new Error("Setup spawn was never released");
    Atomics.wait(sleeper, 0, 0, 5);
  }
  return child;
};
syncBuiltinESMExports();
