// A machine JSON document (../../server/machineJsonStore.ts) as a test keeps
// it on a machine whose dashboard servers may be writing it. Every writer of
// such a document holds the directory lock beside it
// (../../server/machineJsonLock.ts) from its read to its replacement and
// replaces the file whole, so a test keeps its document the same way: written
// in place outside that lock, it could land between a server's read and its
// replacement and be replaced by what the server read before, or be read half
// written. A test that changes what the document holds reads it under the
// same lock, so it neither undoes a server's write nor is undone by one.

import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  acquireWriteLock,
  releaseWriteLock,
} from "../../server/machineJsonLock.ts";

// The document `file` holds now, or undefined when there is none yet.
export function heldMachineDocument(file: string): unknown {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

// Keeps what `produce` answers as the whole of `file`, produced and written
// once no other writer holds it.
async function replaceWhenUnheld(
  file: string,
  produce: () => unknown,
): Promise<void> {
  mkdirSync(path.dirname(file), { recursive: true });
  const lock = `${file}.lock`;
  await acquireWriteLock(lock);
  try {
    const replacement = `${file}.kept.tmp`;
    writeFileSync(replacement, JSON.stringify(produce()));
    renameSync(replacement, file);
  } finally {
    releaseWriteLock(lock);
  }
}

// Keeps `document` as the whole of `file`, once no other writer holds it.
export function keepMachineDocument(
  file: string,
  document: unknown,
): Promise<void> {
  return replaceWhenUnheld(file, () => document);
}

// Keeps `change` applied to the document `file` holds, read and replaced once
// no other writer holds it.
export function changeMachineDocument(
  file: string,
  change: (held: unknown) => unknown,
): Promise<void> {
  return replaceWhenUnheld(file, () => change(heldMachineDocument(file)));
}
