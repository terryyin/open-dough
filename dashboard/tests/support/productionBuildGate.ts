// Published with main: record each build's process and checkout, and allow
// the test to gate the real build before it starts or after Vite succeeds.
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PathChanges } from "./publishedMainFixture.ts";
import type { ProductionWatcher } from "./productionWatcher.ts";
import { waitForWatcherFile } from "./watcherEvents.ts";

const completedBuildFile = "completed-build";
const completedBuildHold = "hold-completed-build";

const buildGate = `
import { appendFileSync, existsSync, readFileSync, watch, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
const checkout = path.basename(process.cwd());
let hold;
if (process.argv[2] === "completed") {
  hold = path.join(homedir(), "${completedBuildHold}");
  writeFileSync(path.join(homedir(), "${completedBuildFile}"), checkout);
} else {
  const log = path.join(homedir(), "builds.log");
  appendFileSync(log, process.pid + " " + checkout + "\\n");
  const ordinal = readFileSync(log, "utf8").trim().split("\\n").length;
  hold = path.join(homedir(), "hold-build-" + ordinal);
}
if (existsSync(hold)) {
  let observer;
  try {
    await new Promise((resolve, reject) => {
      function check() {
        if (!existsSync(hold)) resolve();
      }
      observer = watch(homedir(), check);
      observer.once("error", reject);
      check();
    });
  } finally {
    observer?.close();
  }
}
`;

// The development package with its dashboard build behind the gate.
export async function buildGateChanges(
  development: string,
): Promise<PathChanges> {
  const packageJson = JSON.parse(
    await readFile(path.join(development, "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };
  packageJson.scripts["build:dashboard"] =
    `node build-gate.mjs && ${packageJson.scripts["build:dashboard"]} && if [ -e "$HOME/${completedBuildHold}" ]; then node build-gate.mjs completed; fi`;
  return {
    "package.json": `${JSON.stringify(packageJson, null, 2)}\n`,
    "build-gate.mjs": buildGate,
  };
}

export function holdBuildPath(home: string, ordinal: number) {
  return path.join(home, `hold-build-${ordinal}`);
}

export function holdCompletedBuildPath(home: string) {
  return path.join(home, completedBuildHold);
}

export function waitForCompletedBuild(
  watcher: ProductionWatcher,
  home: string,
) {
  const file = path.join(home, completedBuildFile);
  return waitForWatcherFile(watcher, home, () => {
    try {
      return readFileSync(file, "utf8") || undefined;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      return undefined;
    }
  });
}

// Builds started so far, in order, with their process and checkout names.
function buildsFrom(text: string) {
  return text
    .split("\n")
    .slice(0, -1)
    .map((line) => {
      const [pid, checkout] = line.split(" ");
      return { pid: Number(pid), checkout: checkout ?? "" };
    });
}

export async function recordedBuilds(home: string) {
  return buildsFrom(
    await readFile(path.join(home, "builds.log"), "utf8").catch(() => ""),
  );
}

export function waitForBuild(
  watcher: ProductionWatcher,
  home: string,
  ordinal: number,
) {
  const file = path.join(home, "builds.log");
  return waitForWatcherFile(watcher, home, () => {
    try {
      return buildsFrom(readFileSync(file, "utf8"))[ordinal - 1];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      return undefined;
    }
  });
}

// The commit prefix naming each recorded build's checkout, in build order.
export async function builtCommitPrefixes(home: string) {
  return (await recordedBuilds(home)).map((build) =>
    build.checkout.slice(0, 12),
  );
}
