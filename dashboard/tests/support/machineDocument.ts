// A machine JSON document (../../server/machineJsonStore.ts) as a test keeps
// it on a machine whose dashboard servers may be writing it. Every writer of
// such a document holds the directory lock beside it
// (../../server/machineJsonLock.ts) from its read to its replacement and
// replaces the file whole, so a test keeps its document the same way: written
// in place outside that lock, it could land between a server's read and its
// replacement and be replaced by what the server read before, or be read half
// written.

import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  acquireWriteLock,
  releaseWriteLock,
} from "../../server/machineJsonLock.ts";

// Keeps `document` as the whole of `file`, once no other writer holds it.
export async function keepMachineDocument(
  file: string,
  document: unknown,
): Promise<void> {
  mkdirSync(path.dirname(file), { recursive: true });
  const lock = `${file}.lock`;
  await acquireWriteLock(lock);
  try {
    const replacement = `${file}.kept.tmp`;
    writeFileSync(replacement, JSON.stringify(document));
    renameSync(replacement, file);
  } finally {
    releaseWriteLock(lock);
  }
}
