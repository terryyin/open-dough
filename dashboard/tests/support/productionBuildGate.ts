// Published with main: each real build appends its ordinal and checkout, then
// waits while HOME/hold-build-<ordinal> exists. It delays the build, never
// supplying its result.
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PathChanges } from "./publishedMainFixture.ts";

const buildGate = `
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
const log = path.join(homedir(), "builds.log");
appendFileSync(log, process.pid + " " + path.basename(process.cwd()) + "\\n");
const ordinal = readFileSync(log, "utf8").trim().split("\\n").length;
while (existsSync(path.join(homedir(), "hold-build-" + ordinal)))
  await new Promise((resolve) => setTimeout(resolve, 100));
`;

// The development package with its dashboard build behind the gate.
export async function buildGateChanges(
  development: string,
): Promise<PathChanges> {
  const packageJson = JSON.parse(
    await readFile(path.join(development, "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };
  packageJson.scripts["build:dashboard"] =
    `node build-gate.mjs && ${packageJson.scripts["build:dashboard"]}`;
  return {
    "package.json": `${JSON.stringify(packageJson, null, 2)}\n`,
    "build-gate.mjs": buildGate,
  };
}

export function holdBuildPath(home: string, ordinal: number) {
  return path.join(home, `hold-build-${ordinal}`);
}

// Builds started so far, in order, with their process and checkout names.
export async function recordedBuilds(home: string) {
  return (await readFile(path.join(home, "builds.log"), "utf8").catch(() => ""))
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [pid, checkout] = line.split(" ");
      return { pid: Number(pid), checkout: checkout ?? "" };
    });
}

// The commit prefix naming each recorded build's checkout, in build order.
export async function builtCommitPrefixes(home: string) {
  return (await recordedBuilds(home)).map((build) =>
    build.checkout.slice(0, 12),
  );
}
