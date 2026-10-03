// Replaces one machine file whole: the new text is written beside it and
// renamed over it, so a reader sees the previous file or the new one, never a
// partial write, and a failed write leaves the previous file as it was. The
// caller prepares the directory.
import { randomUUID } from "node:crypto";
import { renameSync, rmSync, writeFileSync } from "node:fs";

export function replaceFile(file: string, text: string, mode?: number): void {
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, text, { flag: "wx", mode });
    renameSync(temporary, file);
  } finally {
    try {
      rmSync(temporary, { force: true });
    } catch {
      /* Preserve the original error. */
    }
  }
}
