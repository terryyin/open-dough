// The discipline of a JSON document this machine keeps in one file outside
// every repository, shared by each store of the local launch boundary
// (`./launchRecordStore.ts`). Every read reads the file afresh, so each
// dashboard server on this machine -- dev and preview alike -- sees every
// write. A directory lock beside the file serializes each read-modify-write
// across dashboard processes, and replacement remains atomic for readers.
// Lock waits are bounded; an abandoned lock is never removed automatically.
// A missing file holds the empty document. A file that does not parse, or does
// not match the document's schema, is unreadable: a read answers it as such
// and leaves it as it is, and the next write starts a new document and moves
// the unreadable one aside as `<file>.unreadable`, or as
// `<file>.unreadable-<move time>` when an earlier copy already has that name,
// so nothing is silently lost.

import { randomUUID } from "node:crypto";
import {
  access,
  mkdir,
  readFile,
  rename,
  rm,
  rmdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import type { ZodType } from "zod";

export type StoreRead<T> =
  | { readonly kind: "document"; readonly document: T }
  | { readonly kind: "unreadable" };

// A JSON document kept in one file: its location, the shape it must have,
// and what a missing file holds.
export type MachineJsonStore<T> = {
  readonly file: string;
  readonly schema: ZodType<T>;
  readonly empty: T;
};

export async function readMachineJson<T>(
  store: MachineJsonStore<T>,
): Promise<StoreRead<T>> {
  let text: string;
  try {
    text = await readFile(store.file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { kind: "document", document: store.empty };
    }
    return { kind: "unreadable" };
  }
  try {
    const parsed = store.schema.safeParse(JSON.parse(text));
    return parsed.success
      ? { kind: "document", document: parsed.data }
      : { kind: "unreadable" };
  } catch {
    return { kind: "unreadable" };
  }
}

// Where an unreadable file moves aside without replacing an earlier copy.
async function unreadableCopy(file: string): Promise<string> {
  const first = `${file}.unreadable`;
  try {
    await access(first);
  } catch {
    return first;
  }
  return `${first}-${new Date().toISOString().replaceAll(":", "-")}`;
}

async function acquireWriteLock(lock: string): Promise<void> {
  const deadline = Date.now() + 10_000;
  for (;;) {
    try {
      await mkdir(lock);
      return;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      if (Date.now() >= deadline) {
        throw new Error(
          `The session store is locked: ${lock}. Nothing was written. Retry after the other writer finishes, or remove the lock only after confirming no writer holds it.`,
          { cause: error },
        );
      }
      await delay(25);
    }
  }
}

// `change` returns this to leave the document as read, with no write.
export const leaveMachineJson = Symbol("leaveMachineJson");

// Rewrites the document with `change` applied to what is kept, replacing the
// file atomically. The authoritative read and change both run under the
// write lock. `change` may return a promise (for example to read another
// machine document while the lock is held); a synchronous `change` is
// unchanged for existing callers. Returning `leaveMachineJson` releases the
// lock without writing. An unreadable file is moved aside and `change`
// starts from the empty document.
export async function replaceMachineJson<T>(
  store: MachineJsonStore<T>,
  change: (
    stored: T,
  ) => T | typeof leaveMachineJson | Promise<T | typeof leaveMachineJson>,
): Promise<void> {
  const { file } = store;
  await mkdir(path.dirname(file), { recursive: true });
  const lock = `${file}.lock`;
  await acquireWriteLock(lock);
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    const read = await readMachineJson(store);
    let stored = store.empty;
    if (read.kind === "unreadable") {
      await rename(file, await unreadableCopy(file));
    } else {
      stored = read.document;
    }
    const next = await change(stored);
    if (next === leaveMachineJson) return;
    await writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`);
    await rename(temporary, file);
  } finally {
    try {
      await rm(temporary, { force: true });
    } finally {
      await rmdir(lock);
    }
  }
}

// Shares the document's writer lock while a related store binds its evidence.
// It does not rewrite this document; callers cannot fail a second write after disposition.
export async function readMachineJsonLocked<T, R>(
  store: MachineJsonStore<T>,
  observe: (read: StoreRead<T>) => Promise<R>,
): Promise<R> {
  await mkdir(path.dirname(store.file), { recursive: true });
  const lock = `${store.file}.lock`;
  await acquireWriteLock(lock);
  try {
    return await observe(await readMachineJson(store));
  } finally {
    await rmdir(lock);
  }
}
