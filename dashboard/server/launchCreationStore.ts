// Unresolved native creation evidence shares the retained launch document.
import type { CreationRecord } from "../src/launchCreation.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { sameLaunch } from "../src/launchRequest.ts";
import { readStoredRecords, replaceRecords } from "./launchRecordDocument.ts";

// A creation attempt has no session identity. Keep it in this existing document
// until a known conversation replaces it or native creation explicitly refuses.
export async function creationOf(
  request: LaunchRecord["request"],
): Promise<CreationRecord | "unreadable" | undefined> {
  const read = await readStoredRecords();
  if (read.kind === "unreadable") return "unreadable";
  return read.document[request.source]?.find(
    (entry): entry is CreationRecord =>
      !("session" in entry) && sameLaunch(entry.request, request),
  );
}
export async function keepCreation(record: CreationRecord): Promise<void> {
  await replaceRecords((kept) => ({
    ...kept,
    [record.request.source]: [
      ...(kept[record.request.source] ?? []).filter(
        (entry) =>
          "session" in entry || !sameLaunch(entry.request, record.request),
      ),
      record,
    ],
  }));
}
export async function removeCreation(
  request: LaunchRecord["request"],
): Promise<void> {
  await replaceRecords((kept) => ({
    ...kept,
    [request.source]: (kept[request.source] ?? []).filter(
      (entry) => "session" in entry || !sameLaunch(entry.request, request),
    ),
  }));
}

export async function keptCreations(): Promise<CreationRecord[]> {
  const read = await readStoredRecords();
  return read.kind === "unreadable"
    ? []
    : Object.values(read.document)
        .flat()
        .filter((entry): entry is CreationRecord => !("session" in entry));
}
