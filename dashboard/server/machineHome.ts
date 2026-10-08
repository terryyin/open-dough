// This machine's dashboard home, `~/.open-dough/dashboard/`, resolved through
// `HOME` at each call: where every dashboard process of this user, dev and
// preview alike, keeps what it shares with the others outside every
// repository.

import { homedir } from "node:os";
import path from "node:path";

export function machineDashboardDirectory(home = homedir()): string {
  return path.join(home, ".open-dough", "dashboard");
}

// `segments` under this machine's dashboard home.
export function machineDashboardPath(...segments: string[]): string {
  return path.join(machineDashboardDirectory(), ...segments);
}
