// Atomic latest.json refresh for one proof directory, serialized with a
// sibling lock that has no `.json` extension.
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  renameSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { compareObservations, identityOf } from "./proofObservationOrder.mjs";

function observationsAt(file) {
  try {
    const proof = JSON.parse(readFileSync(file, "utf8"));
    return Array.isArray(proof?.observations) ? proof.observations : [];
  } catch {
    return [];
  }
}

function writeAtomically(file, observations) {
  const temporary = `${file}.${String(process.pid)}.tmp`;
  try {
    writeFileSync(
      temporary,
      `${JSON.stringify({ version: 1, observations }, null, 2)}\n`,
    );
    renameSync(temporary, file);
  } finally {
    if (existsSync(temporary)) unlinkSync(temporary);
  }
}

/** Sibling lock without a `.json` extension; removed when the caller finishes. */
function acquire(directory) {
  const lock = `${directory}.lock`;
  const deadline = Date.now() + 5_000;
  const waiting = new Int32Array(new SharedArrayBuffer(4));
  for (;;) {
    try {
      symlinkSync(String(process.pid), lock);
      return () => {
        try {
          unlinkSync(lock);
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
      };
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      try {
        const owner = Number(readlinkSync(lock));
        if (owner > 0) process.kill(owner, 0);
      } catch (ownerError) {
        const code = ownerError.code;
        if (code === "ESRCH") {
          try {
            unlinkSync(lock);
          } catch (released) {
            if (released.code !== "ENOENT") throw released;
          }
        } else if (code !== "ENOENT") {
          throw ownerError;
        }
      }
      if (Date.now() >= deadline) {
        throw new Error(`Proof directory is busy: ${directory}`, {
          cause: error,
        });
      }
      Atomics.wait(waiting, 0, 0, 10);
    }
  }
}

/**
 * Reduce every `.json` proof file in `directory` and `observation` to each
 * identity's latest result (an unsuccessful result wins a timestamp tie), keep
 * only passes in stable order as `latest.json`, and remove other `.json` files.
 * Pass `observation` with a non-`passed` outcome to clear that identity.
 */
export function refreshProof(directory, observation) {
  mkdirSync(directory, { recursive: true });
  const release = acquire(directory);
  try {
    const files = readdirSync(directory, { recursive: true, encoding: "utf8" })
      .filter((name) => name.endsWith(".json"))
      .map((name) => path.join(directory, name));
    const latest = new Map();
    function consider(row) {
      if (!row || typeof row.file !== "string" || !Array.isArray(row.test)) {
        return;
      }
      const identity = identityOf(row);
      const previous = latest.get(identity);
      const time = Date.parse(row.finishedAt);
      const previousTime = previous
        ? Date.parse(previous.finishedAt)
        : -Infinity;
      const rowTime = Number.isFinite(time) ? time : Date.now();
      if (
        !previous ||
        rowTime > previousTime ||
        (rowTime === previousTime &&
          (row.outcome !== "passed" ||
            (row === observation && previous.outcome === "passed")))
      ) {
        latest.set(identity, row);
      }
    }
    for (const file of files) {
      for (const row of observationsAt(file)) consider(row);
    }
    if (observation) consider(observation);
    const observations = [...latest.values()]
      .filter((row) => row.outcome === "passed")
      .sort(compareObservations);
    const snapshot = path.join(directory, "latest.json");
    if (observations.length > 0) writeAtomically(snapshot, observations);
    for (const file of files) {
      if (file !== snapshot || observations.length === 0) {
        try {
          unlinkSync(file);
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
      }
    }
    if (observations.length === 0 && existsSync(snapshot)) {
      unlinkSync(snapshot);
    }
  } finally {
    release();
  }
}
