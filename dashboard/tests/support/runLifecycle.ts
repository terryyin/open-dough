// The lifecycle every dashboard run's global setup owns, whichever group it
// runs (./globalSetup.ts, ./frontendGlobalSetup.ts): it registers the
// artifacts that run's workers may request, and its teardown, after every
// worker has exited, settles and removes them, ends and names whatever of the
// run is still running (./runProcesses.ts), applies the run's own `guard`,
// and releases the local full-suite admission the configuration took.

import { releaseLocalSuites } from "../../../scripts/local-test-suite.mjs";
import { startRunArtifacts } from "./runArtifacts.ts";
import { describeRunProcesses, endRunProcesses } from "./runProcesses.ts";

type Artifacts = Parameters<typeof startRunArtifacts>[0];

// A run's own check at teardown and the removal of what it holds; removal
// also runs when setup fails.
export type RunGuard = {
  readonly check: () => void;
  readonly remove: () => void;
};

const noGuard: RunGuard = { check: () => {}, remove: () => {} };

export async function ownDashboardRun(
  runId: string,
  artifacts: Artifacts,
  guard: RunGuard = noGuard,
): Promise<() => Promise<void>> {
  const closeArtifacts = await startRunArtifacts(artifacts).catch(
    async (error: unknown) => {
      guard.remove();
      await releaseLocalSuites();
      throw error;
    },
  );
  const checkRun = async () => {
    try {
      const survived = await endRunProcesses(runId);
      if (survived.length > 0)
        throw new Error(
          `The run left ${String(survived.length)} of its processes running after its workers exited, now ended. Stop each where it is started (dashboard/tests/README.md, "No process outlives its run"):\n${describeRunProcesses(survived)}`,
        );
      guard.check();
    } finally {
      guard.remove();
      await releaseLocalSuites();
    }
  };
  return () => closeArtifacts().finally(checkRun);
}
