import { existsSync, readFileSync } from "node:fs";

// The JSON records a fake has finished appending to a `.jsonl` file, one per
// newline-terminated line. A reader can catch a fake mid-append (Linux shows a
// long record's first page before the rest), so the unterminated tail is left
// for a later read, once its writer finishes.
export function appendedRecords<T>(content: string): T[] {
  return content
    .split("\n")
    .slice(0, -1)
    .filter((line) => line !== "")
    .map((line) => JSON.parse(line) as T);
}

// The appended records of `file`, none while nothing has created it yet.
export function appendedFileRecords<T>(file: string): T[] {
  return existsSync(file) ? appendedRecords<T>(readFileSync(file, "utf8")) : [];
}
