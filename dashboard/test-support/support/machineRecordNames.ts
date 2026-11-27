// What a machine dashboard directory (`../../server/machineHome.ts`) holds,
// without this user's incident record (`incidents/`,
// `../../server/incidentRecordFiles.ts`). Any dashboard process of this user
// may write that record at any moment, for instance when a read fails, so
// whether it exists says nothing about the records a test asserts on; it is
// operational evidence, not one of them.

import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const incidentRecordDirectory = "incidents";

// Where the production watcher stages its deployments under a home directory.
export function productionDeployments(home: string) {
  return path.join(home, ".open-dough/dashboard/deployments");
}

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

// Names → file text for entries present now. Directories and names in
// `omitContentFor` map to `undefined` so the caller can rewrite those files
// without failing the later content check.
export function snapshotMachineRecords(
  directory: string,
  options: { omitContentFor?: Iterable<string> } = {},
): Map<string, string | undefined> {
  const omit = new Set(options.omitContentFor ?? []);
  return new Map(
    machineRecordNames(directory).map((name) => [
      name,
      omit.has(name) || !statSync(path.join(directory, name)).isFile()
        ? undefined
        : readFileSync(path.join(directory, name), "utf8"),
    ]),
  );
}

// Every previously snapped file still has the same text (incident record aside).
export function expectPreservedMachineRecordContents(
  directory: string,
  before: Map<string, string | undefined>,
): void {
  for (const [name, text] of before)
    if (text !== undefined)
      assert.equal(
        readFileSync(path.join(directory, name), "utf8"),
        text,
        `${name} keeps its text.`,
      );
}

// Same entry names as the snapshot, and every snapped file's text preserved.
export function expectUnchangedMachineRecords(
  directory: string,
  before: Map<string, string | undefined>,
): void {
  assert.deepEqual(
    machineRecordNames(directory),
    [...before.keys()].sort(),
    "The machine records keep their names.",
  );
  expectPreservedMachineRecordContents(directory, before);
}
