// Puts one synthetic executable from ../fixtures (the fake `gh`, the fake
// `claude`, the fake `osascript`), or a module one loads from beside itself,
// into a test's own PATH directory under its command or module name.

import { spawnSync } from "node:child_process";
import { chmodSync, copyFileSync, linkSync, mkdirSync } from "node:fs";
import path from "node:path";
import { repoRoot } from "./repositoryRoot.ts";

const fixturesDir = path.join(repoRoot, "dashboard", "tests", "fixtures");

// Each install hard-links the one committed script instead of copying it:
// macOS assesses every newly created executable on its first run -- about
// 0.1s on a quiet machine, several seconds on a busy one -- and a fresh copy
// per server paid that on the page's first read, inside its wait. A link is
// that one file under this directory's name, assessed once per checkout, by
// the run's global setup (`runFixtureExecutablesOnce`) in a fresh one (a
// symbolic link would not do: Node would load the script from the repository,
// where extensionless files are ES modules). Only across filesystems, where
// no link can be made, is it copied.
export function installFixtureExecutable(
  fixture:
    | "fake-gh"
    | "fake-claude"
    | "fake-claude-attach.cjs"
    | "fake-host-environment.cjs"
    | "fake-osascript"
    | "fake-codex"
    | "fake-cursor"
    | "fake-cursor-attach",
  binDir: string,
  command: string,
): void {
  const source = path.join(fixturesDir, fixture);
  const target = path.join(binDir, command);
  mkdirSync(binDir, { recursive: true });
  try {
    linkSync(source, target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EXDEV") {
      throw error;
    }
    copyFileSync(source, target);
    chmodSync(target, 0o755);
  }
}

// The committed executables a page's first actions wait on. Started with none
// of its `FAKE_*` variables, each one names the missing variable on stderr and
// exits 1 at once, having written nothing.
const refusingWithoutItsVariables = [
  "fake-gh",
  "fake-claude",
  "fake-osascript",
] as const;

// Runs each of those once, for the suite's global setup (./globalSetup.ts):
// in a fresh checkout the first run of each file is the assessed one, and
// this pays it before any worker starts, so no page's first read does. In a
// checkout that has run them before it is three quick starts.
export function runFixtureExecutablesOnce(): void {
  for (const fixture of refusingWithoutItsVariables) {
    const result = spawnSync(path.join(fixturesDir, fixture), [], {
      env: { PATH: process.env.PATH },
      stdio: "pipe",
      encoding: "utf8",
      timeout: 60_000,
    });
    if (result.error !== undefined || result.status !== 1) {
      throw new Error(
        `dashboard/tests/fixtures/${fixture} did not run and refuse as expected: ${
          result.error?.message ??
          `status ${String(result.status)}, signal ${String(result.signal)}`
        }\n${result.stdout}\n${result.stderr}`,
      );
    }
  }
}
