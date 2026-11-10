// Workers request the app build, server bundle, an installed origin layout or
// the story-columns history when they need it. Each completed artifact is
// shared read-only across the run. The run removes its own directories.
//
// Before starting workers, it runs the committed fixture executables once
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
import {
  storyColumnsPrefixArtifact,
  storyColumnsPrefixArtifactKey,
} from "../launchJourney.ts";
import { buildDashboardTo, dashboardAppArtifactKey } from "./dashboardBuild.ts";
import { runFixtureExecutablesOnce } from "./fixtureExecutable.ts";
import { requestRunArtifact, startRunArtifacts } from "./runArtifacts.ts";
import {
  bundleServerEntries,
  createServerBundleDirectory,
  serverBundleArtifactKey,
} from "./serverBundle.ts";
import {
  describeRunProcesses,
  endRunProcesses,
  identifyRun,
} from "./runProcesses.ts";
import { startOriginArtifacts } from "./startOriginPreparation.ts";
import { comparisonMountArtifact } from "./comparisonMountArtifact.ts";
import { publishedMainSourceArtifact } from "./publishedMainSource.ts";

export default async function globalSetup(): Promise<() => Promise<void>> {
  const runId = identifyRun();
  runFixtureExecutablesOnce();
  const requests = mkdtempSync(path.join(tmpdir(), "dough-dashboard-gh-"));
  const ownerless = ownerlessRequestRoot(requests);
  const remove = (): void => {
    process.off("exit", remove);
    rmSync(requests, { recursive: true, force: true });
  };
  // Playwright runs the returned teardown after a graceful interruption.
  // Exit also covers interruption while asynchronous setup is still pending.
  process.once("exit", remove);
  const closeArtifacts = await startRunArtifacts(
    new Map([
      [
        dashboardAppArtifactKey,
        {
          create: () =>
            mkdtempSync(path.join(tmpdir(), "dough-dashboard-build-")),
          prepare: buildDashboardTo,
        },
      ],
      [
        serverBundleArtifactKey,
        {
          create: createServerBundleDirectory,
          prepare: bundleServerEntries,
        },
      ],
      ...startOriginArtifacts(),
      comparisonMountArtifact(),
      publishedMainSourceArtifact(),
      storyColumnsPrefixArtifact(),
    ]),
  ).catch(async (error: unknown) => {
    remove();
    await releaseLocalSuites();
    throw error;
  });
  // The story-columns history is built now, overlapping the workers' start and
  // the app build, so the first page journeys find it ready instead of waiting
  // for one cold build. A failure here is kept for the workers that ask: each
  // receives it as its own setup failure.
  void requestRunArtifact(storyColumnsPrefixArtifactKey).catch(() => {});
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
