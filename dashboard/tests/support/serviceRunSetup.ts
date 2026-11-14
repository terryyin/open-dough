// What a dashboard run whose workers start dashboard servers, real Git and
// synthetic hosts owns before they start, whichever group it runs
// (./globalSetup.ts, ./backendGlobalSetup.ts), on top of the shared run
// lifecycle (./runLifecycle.ts).
//
// It runs the committed fixture executables once (./fixtureExecutable.ts), so
// a fresh checkout's first run of each happens here and not inside a test's
// first read.
//
// Every test asks GitHub through a request owner of its own (./fakeGh.ts).
// The run's processes otherwise inherit a root that admits no owner, so a
// test that names none asks neither another test's owner nor this machine's
// real one, and the teardown fails the run when that root was reached.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { ownerlessRequestRoot } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs";
import { runFixtureExecutablesOnce } from "./fixtureExecutable.ts";
import { identifyRun } from "./runProcesses.ts";
import { ownDashboardRun } from "./runLifecycle.ts";

// Apple's /usr/bin/git launches the selected developer tool on every call.
// Use that same Git directly for this run's many real Git operations. Keep
// caller-preferred PATH entries ahead of it, as well as fixture PATH prefixes.
function bindSelectedGit(): void {
  if (process.platform !== "darwin") return;
  const search = (process.env["PATH"] ?? "").split(path.delimiter);
  const launcher = search.indexOf("/usr/bin");
  if (launcher === -1) return;
  if (
    execFileSync("which", ["git"], { encoding: "utf8" }).trim() !==
    "/usr/bin/git"
  )
    return;
  const selected = execFileSync("xcrun", ["--find", "git"], {
    encoding: "utf8",
  }).trim();
  search.splice(launcher, 0, path.dirname(selected));
  process.env["PATH"] = search.join(path.delimiter);
}

// Registers `artifacts` as the run's own and returns its teardown.
export async function ownServiceRun(
  artifacts: Parameters<typeof ownDashboardRun>[1],
): Promise<() => Promise<void>> {
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
  bindSelectedGit();
  const teardown = await ownDashboardRun(runId, artifacts, {
    remove,
    check: () => {
      if (existsSync(ownerless))
        throw new Error(
          "A test asked GitHub without a request owner of its own: give every process that can run `gh` the environment of `fakeGhEnv` (dashboard/tests/support/fakeGh.ts).",
        );
    },
  });
  process.env["DOUGH_GITHUB_REQUEST_OWNER_ROOT"] = ownerless;
  return teardown;
}
