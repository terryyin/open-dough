// How long the dashboard lets one CI adapter invocation (discover, proof or jobs)
// run: the shared adapter limit, which a test may lower to observe it without
// waiting it out.
import { defaultAdapterTimeoutMs } from "../../Distribution/src/skills/dough-execute-plan/scripts/ci-command-run.mjs";
import { configuredLimit } from "./configuredLimit.ts";

export const ciAdapterTimeoutMs = () =>
  configuredLimit("DOUGH_CI_ADAPTER_TIMEOUT_MS", defaultAdapterTimeoutMs);

export function comparisonDeadlineExpired(signal: AbortSignal): boolean {
  return (
    signal.aborted &&
    signal.reason instanceof Error &&
    signal.reason.name === "TimeoutError"
  );
}
