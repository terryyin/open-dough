// Launch-record persistence fixtures for an isolated machine directory.
// Seeding and reading use the machine launch store dashboard servers read
// (./support/launchStore.ts), in the machine's `home`.

import path from "node:path";
import {
  keepLaunchStoreText,
  keptLaunchStore,
  launchStoreFile,
} from "./support/launchStore.ts";

// The home directory of an isolated machine directory.
export const machineHome = (machine: string) => path.join(machine, "home");

export function storeFile(machine: string): string {
  return launchStoreFile(machineHome(machine));
}

// Writes exactly `text` as the machine's store.
export function seedStore(machine: string, text: string): void {
  keepLaunchStoreText(machineHome(machine), text);
}

// The project's records as the store file holds them, before any retention.
export function storedRecords(machine: string): unknown[] {
  return keptLaunchStore(machineHome(machine))["open-dough"] ?? [];
}

// ISO times measured from the server's real clock. Launch retention drops a
// Done mark after `launchRetentionDays` (30); fixtures that must still list
// in Recently done use a small age so calendar drift cannot expire them.
export function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

// A Done mark still inside launch retention (lists under Recently done).
export function retainedDoneAt(): string {
  return daysAgo(1);
}
