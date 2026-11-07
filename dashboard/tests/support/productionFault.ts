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

// productionFault whose matching cause, once present, waits while
// HOME/fault-<phase>-held exists, then is consumed as it fails: the cause
// fails one build or start only.
export const heldOnceFault = productionFault
  .replace(
    'import { existsSync } from "node:fs";',
    'import { existsSync, unlinkSync } from "node:fs";',
  )
  .replace(
    'if (existsSync(path.join(homedir(), "fault-" + phase))) {',
    `const cause = path.join(homedir(), "fault-" + phase);
if (existsSync(cause)) {
  while (existsSync(cause + "-held"))
    await new Promise((resolve) => setTimeout(resolve, 100));
  unlinkSync(cause);`,
  );

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
