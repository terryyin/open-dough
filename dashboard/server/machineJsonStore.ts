// The discipline of a JSON document this machine keeps in one file outside
// every repository, shared by each store of the local launch boundary
// (`./launchRecordStore.ts`). Every read reads the file afresh, so each
// dashboard server on this machine -- dev and preview alike -- sees every
// write. A write replaces the file atomically; two writes at the same instant
// can still race, which is accepted rather than locked against.
// A missing file holds the empty document. A file that does not parse, or does
// not match the document's schema, is unreadable: a read answers it as such
// and leaves it as it is, and the next write starts a new document and moves
// the unreadable one aside as `<file>.unreadable`, or as
// `<file>.unreadable-<move time>` when an earlier copy already has that name,
// so nothing is silently lost.

import { randomUUID } from "node:crypto";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
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

// Rewrites the document with `change` applied to what is kept, replacing the
// file atomically. An unreadable file is moved aside and `change` starts from
// the empty document.
export async function replaceMachineJson<T>(
  store: MachineJsonStore<T>,
  change: (stored: T) => T,
): Promise<void> {
  const { file } = store;
  await mkdir(path.dirname(file), { recursive: true });
  const read = await readMachineJson(store);
  let stored = store.empty;
  if (read.kind === "unreadable") {
    await rename(file, await unreadableCopy(file));
  } else {
    stored = read.document;
  }
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(change(stored), null, 2)}\n`);
  await rename(temporary, file);
}
