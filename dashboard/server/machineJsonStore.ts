// The discipline of a JSON document this machine keeps in one file outside
// every repository, shared by each store of the local launch boundary
// (`./launchRecordStore.ts`). Every read consults the file, so each
// dashboard server on this machine -- dev and preview alike -- sees every
// write on its next read. While the file keeps its identity (inode,
// modification time, and size), a read answers the document this server last
// parsed from it instead of parsing it again; that held document is shared by
// every reader and frozen, so no reader can change what another is answered.
// A file modified too recently for its identity to be trusted is parsed afresh
// (Linux file times can be coarser than successive writes, and a replacement
// may reuse a freed inode). A read under the write lock always parses afresh.
// A directory lock beside the file serializes each read-modify-write across
// dashboard processes, and replacement remains atomic for readers.
// Lock waits are bounded; an abandoned lock is never removed automatically.
// A missing file holds the empty document. A file that does not parse, or does
// not match the document's schema, is unreadable: a read answers it as such
// and leaves it as it is, and the next write starts a new document and moves
// the unreadable one aside as `<file>.unreadable`, or as
// `<file>.unreadable-<move time>` when an earlier copy already has that name,
// so nothing is silently lost.

import { randomUUID } from "node:crypto";
import type { BigIntStats } from "node:fs";
import {
  access,
  mkdir,
  open,
  rename,
  rm,
  rmdir,
  stat,
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

// The document each file last parsed to, by file path, with the identity the
// file had when it was read.
type HeldDocument = {
  readonly ino: bigint;
  readonly mtimeNs: bigint;
  readonly size: bigint;
  readonly document: unknown;
};

const heldDocuments = new Map<string, HeldDocument>();

// How long after a file's modification its identity is trusted to tell it
// apart from a later replacement.
const settledIdentityNs = 1_000_000_000n;

function sameIdentity(held: HeldDocument, stats: BigIntStats): boolean {
  return (
    held.ino === stats.ino &&
    held.mtimeNs === stats.mtimeNs &&
    held.size === stats.size
  );
}

function settled(stats: BigIntStats): boolean {
  const nowNs = BigInt(Date.now()) * 1_000_000n;
  return nowNs - stats.mtimeNs >= settledIdentityNs;
}

function frozen<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    for (const entry of Object.values(value)) frozen(entry);
    Object.freeze(value);
  }
  return value;
}

// Reads, parses, and validates the file; `stats` is the identity of the very
// file whose text was read.
async function parsedMachineJson<T>(
  store: MachineJsonStore<T>,
): Promise<{ read: StoreRead<T>; stats?: BigIntStats }> {
  let text: string;
  let stats: BigIntStats;
  try {
    const handle = await open(store.file, "r");
    try {
      stats = await handle.stat({ bigint: true });
      text = await handle.readFile("utf8");
    } finally {
      await handle.close();
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { read: { kind: "document", document: store.empty } };
    }
    return { read: { kind: "unreadable" } };
  }
  try {
    const parsed = store.schema.safeParse(JSON.parse(text));
    return parsed.success
      ? { read: { kind: "document", document: parsed.data }, stats }
      : { read: { kind: "unreadable" } };
  } catch {
    return { read: { kind: "unreadable" } };
  }
}

// The document as the file holds it now. An unchanged file answers the
// document held from its last parse, frozen and shared with every reader.
export async function readMachineJson<T>(
  store: MachineJsonStore<T>,
): Promise<StoreRead<T>> {
  const held = heldDocuments.get(store.file);
  if (held !== undefined) {
    try {
      if (sameIdentity(held, await stat(store.file, { bigint: true }))) {
        return { kind: "document", document: held.document as T };
      }
    } catch {
      // Answered below as the file is now.
    }
  }
  heldDocuments.delete(store.file);
  const { read, stats } = await parsedMachineJson(store);
  if (read.kind === "unreadable" || stats === undefined) return read;
  const document = frozen(read.document);
  if (settled(stats)) {
    heldDocuments.set(store.file, {
      ino: stats.ino,
      mtimeNs: stats.mtimeNs,
      size: stats.size,
      document,
    });
  }
  return { kind: "document", document };
}

// The document as the file holds it now, parsed afresh and shared with no
// other reader, for a read under the write lock.
async function authoritativeMachineJson<T>(
  store: MachineJsonStore<T>,
): Promise<StoreRead<T>> {
  return (await parsedMachineJson(store)).read;
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
    const read = await authoritativeMachineJson(store);
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
    return await observe(await authoritativeMachineJson(store));
  } finally {
    await rmdir(lock);
  }
}
