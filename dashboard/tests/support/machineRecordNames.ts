// What a machine dashboard directory (`../../server/machineHome.ts`) holds,
// without this user's incident record (`incidents/`,
// `../../server/incidentRecordFiles.ts`). Any dashboard process of this user
// may write that record at any moment, for instance when a read fails, so
// whether it exists says nothing about the records a test asserts on; it is
// operational evidence, not one of them.

import { readdirSync } from "node:fs";
import path from "node:path";

const incidentRecordDirectory = "incidents";

// The incident record's folder, relative to a home directory.
export const incidentRecordInHome = path.join(
  ".open-dough",
  "dashboard",
  incidentRecordDirectory,
);

// The sorted entry names of `directory`, without the incident record.
export function machineRecordNames(directory: string): string[] {
  return readdirSync(directory)
    .filter((name) => name !== incidentRecordDirectory)
    .sort();
}

// Whether `relative`, a path under a home directory, lies in that home's
// incident record.
export function inIncidentRecord(relative: string): boolean {
  return (
    relative === incidentRecordInHome ||
    relative.startsWith(`${incidentRecordInHome}${path.sep}`)
  );
}
