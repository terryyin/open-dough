// Installs the synthetic `gh` (../fixtures/fake-gh) on a temp PATH directory
// and reads back the pid files it writes. What that `gh` answers comes from
// the test's own fake GitHub (./fakeGitHub.ts); nothing here launches a Vite
// dev/preview server (./dashboardServer.ts does).

import {
  chmodSync,
  copyFileSync,
  linkSync,
  mkdirSync,
  readFileSync,
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

export type FakeGhPaths = {
  binDir: string;
  pidPath: string;
};

// Exported so a test that wants the plugin's own hooks directly (rather than
// a spawned Vite process) can install the same synthetic `gh`.
//
// Each install hard-links the one committed script instead of copying it:
// macOS assesses every newly created executable on its first run -- about
// 0.1s on a quiet machine, several seconds on a busy one -- and a fresh copy
// per server paid that on the page's first read, inside its wait. A link is
// that already-assessed file under this directory's name (a symbolic link
// would not do: Node would load the script from the repository, where
// extensionless files are ES modules). Only across filesystems, where no link
// can be made, is it copied.
export function installFakeGh(tempRoot: string): FakeGhPaths {
  const binDir = path.join(tempRoot, "bin");
  mkdirSync(binDir, { recursive: true });
  const ghPath = path.join(binDir, "gh");
  try {
    linkSync(fakeGhSource, ghPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EXDEV") {
      throw error;
    }
    copyFileSync(fakeGhSource, ghPath);
    chmodSync(ghPath, 0o755);
  }
  return { binDir, pidPath: path.join(tempRoot, "gh.pid") };
}

// The environment that puts this synthetic `gh` first on PATH and points it
// at a fake GitHub.
export function fakeGhEnv(
  gh: FakeGhPaths,
  githubUrl: string,
): Record<string, string> {
  return {
    PATH: `${gh.binDir}${path.delimiter}${process.env["PATH"] ?? ""}`,
    FAKE_GH_ORIGIN: githubUrl,
    FAKE_GH_PIDFILE: gh.pidPath,
  };
}

// The one place that reads a pid file written by the fake `gh` back into a
// number, shared by the harness's `DashboardServer.ghPid()` and any test
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
