import path from "node:path";

// Playwright reports a test's begin before its body runs and drops a stop that
// arrives in between, so ordered.proof.ts marks its stopped test's body here,
// beside the run's configuration, for a signal sender to wait on.
export function stoppedBodyMarker(configFile: string): string {
  return path.join(path.dirname(configFile), "stopped-test-body-started");
}
