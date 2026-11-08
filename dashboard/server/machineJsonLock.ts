// The directory lock beside a machine JSON document (`./machineJsonStore.ts`)
// that serializes each read-modify-write across dashboard processes. The lock
// records its owner's pid; a waiter whose deadline has not passed removes a
// lock whose owner process is gone (SIGKILL or an unhandled SIGTERM leaves
// the directory behind). A process that exits (a dashboard server exits once
// its close settles, whatever write it is in) removes every lock it holds,
// including one whose owner record it had not written yet. A lock with no
// owner record, or a live owner, is left until that owner releases it or a
// human removes it after confirming no writer holds it. Lock waits are
// bounded.

import { rmSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const lockOwnerFile = "owner";

function processAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function lockOwnerPid(lock: string): Promise<number | undefined> {
  try {
    const pid = Number(
      (await readFile(path.join(lock, lockOwnerFile), "utf8")).trim(),
    );
    return Number.isInteger(pid) && pid > 0 ? pid : undefined;
  } catch {
    return undefined;
  }
}

// Removes a lock only when its recorded owner is gone. A lock with no owner
// record stays: a human or test may be holding it without a pid file.
async function releaseAbandonedLock(lock: string): Promise<boolean> {
  const owner = await lockOwnerPid(lock);
  if (owner === undefined || processAlive(owner)) return false;
  try {
    await rm(lock, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

// The locks this process took and has not released, removed if it exits
// while holding them.
const heldLocks = new Set<string>();
process.on("exit", () => {
  for (const held of heldLocks) rmSync(held, { recursive: true, force: true });
});

export async function releaseWriteLock(lock: string): Promise<void> {
  heldLocks.delete(lock);
  await rm(lock, { recursive: true, force: true });
}

export async function acquireWriteLock(lock: string): Promise<void> {
  const deadline = Date.now() + 10_000;
  for (;;) {
    try {
      await mkdir(lock);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      if (await releaseAbandonedLock(lock)) continue;
      if (Date.now() >= deadline) {
        throw new Error(
          `The session store is locked: ${lock}. Nothing was written. Retry after the other writer finishes, or remove the lock only after confirming no writer holds it.`,
          { cause: error },
        );
      }
      await delay(25);
      continue;
    }
    heldLocks.add(lock);
    try {
      await writeFile(path.join(lock, lockOwnerFile), `${process.pid}\n`);
      return;
    } catch (error) {
      await releaseWriteLock(lock);
      throw error;
    }
  }
}
