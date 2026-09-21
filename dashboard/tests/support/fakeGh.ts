// The fixture and control-file concern for the private-read-boundary tests:
// installing the synthetic `gh` (../fixtures/fake-gh) on a temp PATH,
// writing the control file that tells it how to answer, and reading back
// what it logged or recorded. Kept apart from `./privateReadServer.ts`'s
// process-spawning concern: nothing here launches a Vite dev/preview server.

import {
  copyFileSync,
  chmodSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

// Playwright runs this suite from the repository root (as `npm run
// test:dashboard` and the isolated Vite launches both do); paths are built
// from that rather than from `import.meta.url`, since Playwright's own
// TypeScript transform loads test files as CommonJS, where `import.meta` is
// unavailable.
const repoRoot = process.cwd();
const fakeGhSource = path.join(
  repoRoot,
  "dashboard",
  "tests",
  "fixtures",
  "fake-gh",
);

export type FakeGhControl = {
  readonly mode?: "normal" | "hang" | "error";
  readonly revision?: string;
  readonly backlog?: string;
  readonly errorMessage?: string;
};

export type FakeGhPaths = {
  binDir: string;
  logPath: string;
  controlPath: string;
  pidPath: string;
};

// Exported so a test that wants the plugin's own hooks directly (rather than
// a spawned Vite process) can install the same synthetic `gh` and drive it
// with the same control/log/pid files this module uses.
export function installFakeGh(tempRoot: string): FakeGhPaths {
  const binDir = path.join(tempRoot, "bin");
  mkdirSync(binDir, { recursive: true });
  const ghPath = path.join(binDir, "gh");
  copyFileSync(fakeGhSource, ghPath);
  chmodSync(ghPath, 0o755);
  return {
    binDir,
    logPath: path.join(tempRoot, "gh-calls.log"),
    controlPath: path.join(tempRoot, "control.json"),
    pidPath: path.join(tempRoot, "gh.pid"),
  };
}

export function writeControl(
  controlPath: string,
  control: FakeGhControl,
): void {
  writeFileSync(controlPath, JSON.stringify({ mode: "normal", ...control }));
}

export function readGhCalls(logPath: string): string[][] {
  let raw: string;
  try {
    raw = readFileSync(logPath, "utf8");
  } catch {
    return [];
  }
  return raw
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as string[]);
}

// The one place that reads a pid file written by the fake `gh` (its own pid,
// or -- with `.exited` appended by the caller -- unused here) back into a
// number, shared by the harness's `PrivateReadServer.ghPid()` and any test
// that drives `installFakeGh` directly.
export function readPid(pidPath: string): number | undefined {
  try {
    const raw = readFileSync(pidPath, "utf8").trim();
    return raw ? Number(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function processAlive(pid: number | undefined): boolean {
  if (pid === undefined) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
