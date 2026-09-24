import { existsSync } from "node:fs";
import { setTimeout as pause } from "node:timers/promises";

// A killed observer cannot clean up its children. Disposable commands must
// also end when their owning process or fixture disappears.
export function guardFixtureProcess(root, timeoutMs = 60_000) {
  const parent = process.ppid;
  const deadline = Date.now() + timeoutMs;
  const timer = setInterval(() => {
    if (process.ppid === 1 || process.ppid !== parent || !existsSync(root))
      process.exit(0);
    if (Date.now() >= deadline) {
      console.error(`Fixture process exceeded ${timeoutMs}ms: ${root}`);
      process.exit(1);
    }
  }, 20);
  timer.unref();
}

// Filesystem notifications may be coalesced or lost. The file is the durable
// handshake; polling it also bounds a missing release and honors cancellation.
export async function waitForFixtureRelease(
  path,
  { signal, timeoutMs = 15_000 } = {},
) {
  const deadline = Date.now() + timeoutMs;
  while (!existsSync(path)) {
    signal?.throwIfAborted();
    if (Date.now() >= deadline)
      throw new Error(`Missing fixture release: ${path}`);
    await pause(20, undefined, { signal });
  }
}
