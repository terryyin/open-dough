// Published with a commit: its build/preview script fails while the matching
// machine-local HOME/fault-<phase> cause exists. Real npm/Vite build and
// serving otherwise run unchanged.
import { readFile } from "node:fs/promises";
import path from "node:path";

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

// The development package with build and preview gated by productionFault.
export async function faultGatedPackage(development: string) {
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
