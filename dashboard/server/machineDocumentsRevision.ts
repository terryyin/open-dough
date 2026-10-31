// This server's write count and each machine document's file identity. A
// derived observation keys on it so a write by this server, or any process
// changing a machine document, makes the next demand observe afresh.

import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { machineDashboardDirectory } from "./machineHome.ts";

// How many documents this server replaced so far, so a derived observation
// can tell it predates one of this server's own writes.
let replacements = 0;

export function recordMachineJsonReplacement(): void {
  replacements += 1;
}

// Every machine document as its file stands now: any process replacing,
// adding, removing, or rewriting one changes it.
async function machineDocumentsIdentity(): Promise<string> {
  const folder = machineDashboardDirectory();
  let names: string[];
  try {
    names = (await readdir(folder)).filter((name) => name.endsWith(".json"));
  } catch {
    return "absent";
  }
  const files = await Promise.all(
    names.sort().map(async (name) => {
      try {
        const { ino, mtimeNs, size } = await stat(path.join(folder, name), {
          bigint: true,
        });
        return `${name}:${ino}:${mtimeNs}:${size}`;
      } catch {
        return `${name}:absent`;
      }
    }),
  );
  return files.join("|");
}

export async function machineDocumentsRevision(): Promise<string> {
  return `${replacements}:${await machineDocumentsIdentity()}`;
}
