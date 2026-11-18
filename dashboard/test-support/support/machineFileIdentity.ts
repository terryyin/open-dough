// A machine document's file identity (../../server/machineJsonStore.ts): the
// inode, modification time, and size a server trusts to answer what it last
// parsed instead of parsing again.

import { renameSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { expect } from "./pageTest.ts";

// Dates the file a minute back, so its identity is settled and a server holds
// what it parsed from it.
export function settleFile(file: string): void {
  const earlier = new Date(Date.now() - 60_000);
  utimesSync(file, earlier, earlier);
}

// Replaces the file the way a writer of another process does, by renaming a
// new file over it, keeping its size and times so only the file itself
// differs.
export function replaceFileKeepingTimes(file: string, text: string): void {
  const { atime, mtime, size } = statSync(file);
  expect(Buffer.byteLength(text)).toBe(size);
  const temporary = `${file}.replacement.tmp`;
  writeFileSync(temporary, text);
  utimesSync(temporary, atime, mtime);
  renameSync(temporary, file);
}
