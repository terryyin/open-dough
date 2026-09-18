// Applies one validated change to a backlog file. Cooperating script runs are
// serialized through a lock directory beside the file and always re-read the
// file inside the lock, so a concurrent run cannot lose the other's update.
// This coordinates script writers only; it cannot protect the file from an
// arbitrary external writer that ignores the lock.

import {
  mkdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  writeFileSync,
} from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { BacklogError } from "./product-backlog-document.mjs";

// Where a project keeps its backlog unless a caller names another file.
export const defaultBacklogPath = ".planning/PRODUCT-BACKLOG.md";

const pollMilliseconds = 25;

function lockTimeout() {
  const configured = Number(process.env.DOUGH_BACKLOG_LOCK_TIMEOUT_MS);
  return Number.isFinite(configured) && configured > 0 ? configured : 10000;
}

async function acquire(lockPath) {
  const deadline = Date.now() + lockTimeout();
  for (;;) {
    try {
      mkdirSync(lockPath);
      return;
    } catch (error) {
      if (error.code !== "EEXIST") {
        throw error;
      }
      if (Date.now() >= deadline) {
        throw new BacklogError(
          `The backlog is locked by another run: ${lockPath}. Nothing was written. Wait for that run, or remove the lock by hand once you have established that no run holds it.`,
        );
      }
      await delay(pollMilliseconds);
    }
  }
}

function read(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new BacklogError(`Backlog file not found: ${path}`);
    }
    throw error;
  }
}

// Reads the file, applies `change` to its current bytes, and replaces the file
// atomically. A refused change leaves the file untouched.
export async function applyToBacklog(path, change) {
  const lockPath = `${path}.lock`;
  await acquire(lockPath);
  try {
    const next = change(read(path));
    const temporaryPath = `${path}.tmp-${process.pid}`;
    writeFileSync(temporaryPath, next, "utf8");
    renameSync(temporaryPath, path);
  } finally {
    rmdirSync(lockPath);
  }
}
