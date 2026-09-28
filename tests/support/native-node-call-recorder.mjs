// Appends this node process's arguments to $NATIVE_NODE_CALL_LOG, as a native
// fixture's PATH node wrapper does, for hosts whose login shell rebuilds PATH
// without that wrapper. Loaded through NODE_OPTIONS=--import. Skips the
// process the wrapper already recorded, and never disturbs the process itself.
import { appendFileSync } from "node:fs";

const log = process.env.NATIVE_NODE_CALL_LOG;
if (log && process.env.NATIVE_NODE_WRAPPED_PID !== String(process.pid)) {
  try {
    appendFileSync(log, `${process.argv.slice(1).join(" ")}\n`);
  } catch {
    // An unwritable log leaves the call unrecorded; the run itself proceeds.
  }
}
