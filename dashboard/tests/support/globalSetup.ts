// Builds the production dashboard once per suite run into the run's own
// temporary directory, which every page journey's own preview server then
// serves read-only (./dashboardServer.ts), so no run exercises stale assets
// and two runs from one checkout never rebuild each other's. Workers inherit
// the runner's environment, so the directory reaches them in
// `builtDashboardVariable`. The returned function is the run's global
// teardown: it removes the directory after every run whose setup succeeded,
// passing or failing; a failed build removes it here.
//
// Before building, it runs the committed fixture executables once
// (./fixtureExecutable.ts), so a fresh checkout's first run of each happens
// here and not inside a page's first read.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { buildDashboardTo, builtDashboardVariable } from "./dashboardBuild.ts";
import { runFixtureExecutablesOnce } from "./fixtureExecutable.ts";

export default function globalSetup(): () => void {
  runFixtureExecutablesOnce();
  const outDir = mkdtempSync(path.join(tmpdir(), "dough-dashboard-build-"));
  const remove = (): void => {
    rmSync(outDir, { recursive: true, force: true });
  };
  try {
    buildDashboardTo(outDir);
  } catch (error) {
    remove();
    throw error;
  }
  process.env[builtDashboardVariable] = outDir;
  return remove;
}
