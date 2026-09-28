// Installs the synthetic `gh` (../fixtures/fake-gh) on a temp PATH directory
// and reads back the pid files it writes. What that `gh` answers comes from
// the test's own fake GitHub (./fakeGitHub.ts); nothing here launches a Vite
// dev/preview server (./dashboardServer.ts does).

import { readFileSync } from "node:fs";
import path from "node:path";
import { installFixtureExecutable } from "./fixtureExecutable.ts";

export type FakeGhPaths = {
  binDir: string;
  pidPath: string;
};

// Exported so a test that wants the plugin's own hooks directly (rather than
// a spawned Vite process) can install the same synthetic `gh`.
export function installFakeGh(tempRoot: string): FakeGhPaths {
  const binDir = path.join(tempRoot, "bin");
  installFixtureExecutable("fake-gh", binDir, "gh");
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
