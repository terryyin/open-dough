// Published with a commit: its build/preview script fails while the matching
// machine-local HOME/fault-<phase> cause exists. Real npm/Vite build and
// serving otherwise run unchanged.
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PathChanges } from "./publishedMainFixture.ts";

export const productionFault = `
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
const phase = process.argv[2];
if (existsSync(path.join(homedir(), "fault-" + phase))) {
  console.error("TRANSIENT " + phase + " FAILURE");
  process.exit(42);
}
`;

// productionFault reading only HOME/fault-<phase>-<own>: a cause of the
// commit's own, which leaves every other commit's gate alone.
export const ownCauseFault = (own: string) =>
  productionFault.replace(
    'existsSync(path.join(homedir(), "fault-" + phase))',
    `existsSync(path.join(homedir(), "fault-" + phase + "-${own}"))`,
  );

// The machine-local cause that fails a phase: HOME/fault-<phase>, or
// HOME/fault-<phase>-<own> for a commit published with ownCauseFault(own).
export function faultCause(
  home: string,
  phase: "build" | "preview",
  own?: string,
) {
  return path.join(home, ["fault", phase, ...(own ? [own] : [])].join("-"));
}

// The development package with build and preview gated by productionFault.
async function faultGatedPackage(development: string) {
  const packageJson = JSON.parse(
    await readFile(path.join(development, "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };
  for (const phase of ["build", "preview"]) {
    const script = `${phase}:dashboard`;
    packageJson.scripts[script] =
      `node production-fault.mjs ${phase} && ${packageJson.scripts[script]}`;
  }
  return `${JSON.stringify(packageJson, null, 2)}\n`;
}

// The fault gate as published path changes: the development package with
// build and preview behind productionFault, and that script.
export async function faultGateChanges(
  development: string,
): Promise<PathChanges> {
  return {
    "package.json": await faultGatedPackage(development),
    "production-fault.mjs": productionFault,
  };
}
