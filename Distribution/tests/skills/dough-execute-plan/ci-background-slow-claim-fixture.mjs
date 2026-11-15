// Preload for a waiter process: hold any background-waiter claim write open
// for one second between creating and filling the file, so a concurrent
// reader meets the claim at its slowest observable point.
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";

const original = fs.writeFileSync;
fs.writeFileSync = (path, data, options) => {
  if (!String(path).includes("background-waiter"))
    return original(path, data, options);
  const fd = fs.openSync(path, options?.flag ?? "w", options?.mode);
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  fs.writeSync(fd, data);
  fs.closeSync(fd);
};
syncBuiltinESMExports();
