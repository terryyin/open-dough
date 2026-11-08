// Home and retention clock fixtures for an isolated machine.

import path from "node:path";
// The home directory of an isolated machine directory.
export const machineHome = (machine: string) => path.join(machine, "home");

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
