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
