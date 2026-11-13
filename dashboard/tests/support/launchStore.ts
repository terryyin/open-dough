// The machine launch store a dashboard server reads
// (../../server/launchRecordDocument.ts): one document,
// `<home>/.open-dough/dashboard/agent-launches.json`, holding each project's
// kept launch and creation records by project id. Every test keeps records
// there through this one owner, written as the plain document the store
// keeps, with no retention applied; exact text a case puts under test
// (malformed, legacy or unreadable stores) goes through
// `keepLaunchStoreText`. The file and its location are harness, never facts
// a record's builder states.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import type { CreationRecord } from "../../src/launchCreation.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import {
  changeMachineDocument,
  heldMachineDocument,
} from "./machineDocument.ts";

// A machine's home directory, or a dashboard server running on it.
export type MachineHome = string | Pick<DashboardServer, "home">;

// A record the store keeps: a launch, or a creation not yet settled into one.
export type KeptLaunch = LaunchRecord | CreationRecord;

// The store's document: each project's kept records, by project id.
export type LaunchStoreDocument = Record<string, KeptLaunch[]>;

export function launchStoreFile(home: MachineHome): string {
  return path.join(
    typeof home === "string" ? home : home.home,
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
}

// The document the store keeps now, as written.
export function keptLaunchStore(home: MachineHome): LaunchStoreDocument {
  return JSON.parse(
    readFileSync(launchStoreFile(home), "utf8"),
  ) as LaunchStoreDocument;
}

// The project's records as the store holds them, including unresolved creations.
export function keptLaunchRecords(
  home: MachineHome,
  source = "open-dough",
): KeptLaunch[] {
  return keptLaunchStore(home)[source] ?? [];
}

// Writes exactly `text` as the store, for cases whose store text is under
// test.
export function keepLaunchStoreText(home: MachineHome, text: string): void {
  const file = launchStoreFile(home);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, text);
}

// Keeps these records, by project, as the whole store, and answers the
// store's text.
export function keepLaunchStore(
  home: MachineHome,
  byProject: Readonly<Record<string, readonly KeptLaunch[]>>,
): string {
  const text = JSON.stringify(byProject);
  keepLaunchStoreText(home, text);
  return text;
}

// Rewrites the store with `change` applied to the document it keeps (an
// empty one when the store does not exist yet).
export function changeLaunchStore(
  home: MachineHome,
  change: (
    kept: LaunchStoreDocument,
  ) => Readonly<Record<string, readonly KeptLaunch[]>>,
): void {
  keepLaunchStore(
    home,
    change(
      (heldMachineDocument(launchStoreFile(home)) as
        LaunchStoreDocument | undefined) ?? {},
    ),
  );
}

// The document `kept` with `records` appended to the project `source`'s,
// leaving every other project's as kept.
function withMoreRecords(
  kept: LaunchStoreDocument,
  records: readonly KeptLaunch[],
  source: string,
): LaunchStoreDocument {
  return { ...kept, [source]: [...(kept[source] ?? []), ...records] };
}

// Appends `records` to the project `source`'s records already kept in the
// machine store, leaving every other project's as kept.
export function keepMoreLaunchRecords(
  home: MachineHome,
  records: readonly KeptLaunch[],
  source = "open-dough",
): void {
  changeLaunchStore(home, (kept) => withMoreRecords(kept, records, source));
}

// Appends `records` as `keepMoreLaunchRecords` does, while a running
// dashboard server may be rewriting the store: read and replaced under that
// server's write lock (./machineDocument.ts), so neither write undoes the
// other.
export function keepMoreLaunchRecordsBesideServer(
  home: MachineHome,
  records: readonly KeptLaunch[],
  source = "open-dough",
): Promise<void> {
  return changeMachineDocument(launchStoreFile(home), (held) =>
    withMoreRecords(
      (held as LaunchStoreDocument | undefined) ?? {},
      records,
      source,
    ),
  );
}

// The kept launch records of the project `source`, written into the machine
// store as its whole document.
export function keepLaunchRecords(
  home: MachineHome,
  records: readonly KeptLaunch[],
  source = "open-dough",
): void {
  keepLaunchStore(home, { [source]: records });
}
