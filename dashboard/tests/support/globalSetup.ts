// Workers request the production app build from this runner when they first
// need it. One completed build is shared read-only across the run. The server
// entries and installed origins are prepared during setup. All these
// directories belong to this run and are removed when it ends.
//
// Before building, it runs the committed fixture executables once
// (./fixtureExecutable.ts), so a fresh checkout's first run of each happens
// here and not inside a page's first read.
//
// Every test asks GitHub through a request owner of its own (./fakeGh.ts).
// The run's processes otherwise inherit a root that admits no owner, so a
// test that names none asks neither another test's owner nor this machine's
// real one, and the teardown fails the run when that root was reached.
//
// No process a run starts outlives it. The run's identity is set here, before
// any worker starts, so every process of the run carries it, and the teardown
// runs after every worker has exited: whatever of the run is still running
// then is ended and named, and the run fails (./runProcesses.ts).

import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { releaseLocalSuites } from "../../../scripts/local-test-suite.mjs";
import { ownerlessRequestRoot } from "../../../src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs";
import { buildDashboardTo, dashboardAppArtifactKey } from "./dashboardBuild.ts";
import { runFixtureExecutablesOnce } from "./fixtureExecutable.ts";
import { startRunArtifacts } from "./runArtifacts.ts";
import {
  bundleServerEntries,
  createServerBundleDirectory,
  serverBundleVariable,
} from "./serverBundle.ts";
import {
  describeRunProcesses,
  endRunProcesses,
  identifyRun,
} from "./runProcesses.ts";
import {
  createStartOriginPreparationDirectory,
  prepareStartOrigins,
  startOriginPreparationVariable,
} from "./startOriginPreparation.ts";

export default async function globalSetup(): Promise<() => Promise<void>> {
  const runId = identifyRun();
  runFixtureExecutablesOnce();
  const requests = mkdtempSync(path.join(tmpdir(), "dough-dashboard-gh-"));
  const ownerless = ownerlessRequestRoot(requests);
  const bundle = createServerBundleDirectory();
  const origins = createStartOriginPreparationDirectory();
  const remove = (): void => {
    process.off("exit", remove);
    rmSync(bundle, { recursive: true, force: true });
    rmSync(requests, { recursive: true, force: true });
    rmSync(origins, { recursive: true, force: true });
  };
  // Playwright runs the returned teardown after a graceful interruption.
  // Exit also covers interruption while asynchronous setup is still pending.
  process.once("exit", remove);
  const start = async () => {
    await prepareStartOrigins(origins);
    await bundleServerEntries(bundle);
    return startRunArtifacts(
      new Map([
        [
          dashboardAppArtifactKey,
          {
            create: () =>
              mkdtempSync(path.join(tmpdir(), "dough-dashboard-build-")),
            prepare: buildDashboardTo,
          },
        ],
      ]),
    );
  };
  const closeArtifacts = await start().catch(async (error: unknown) => {
    remove();
    await releaseLocalSuites();
    throw error;
  });
  process.env[serverBundleVariable] = bundle;
  process.env[startOriginPreparationVariable] = origins;
  process.env["DOUGH_GITHUB_REQUEST_OWNER_ROOT"] = ownerless;
  const checkRun = async () => {
    try {
      const survived = await endRunProcesses(runId);
      if (survived.length > 0)
        throw new Error(
          `The run left ${String(survived.length)} of its processes running after its workers exited, now ended. Stop each where it is started (dashboard/tests/README.md, "No process outlives its run"):\n${describeRunProcesses(survived)}`,
        );
      if (existsSync(ownerless))
        throw new Error(
          "A test asked GitHub without a request owner of its own: give every process that can run `gh` the environment of `fakeGhEnv` (dashboard/tests/support/fakeGh.ts).",
        );
    } finally {
      remove();
      await releaseLocalSuites();
    }
  };
  return () => closeArtifacts().finally(checkRun);
}
