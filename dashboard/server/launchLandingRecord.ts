// Capture authority is established once, then follows the original bound record.
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { LandingReporting } from "../src/launchLanding.ts";

export function boundLandingReporting(
  attempt: LaunchAttemptRecord | undefined,
  existing: LaunchRecord | undefined,
): LandingReporting | undefined {
  if (existing?.landingReporting !== undefined)
    return existing.landingReporting;
  if (
    attempt?.landingRepository === undefined ||
    attempt.reportingOrigin === undefined
  )
    return undefined;
  return {
    origin: attempt.reportingOrigin,
    authority: attempt.landingRepository,
    preparations: attempt.landingPreparations ?? [],
    ...(attempt.settledAt === undefined
      ? {}
      : { settledAt: attempt.settledAt }),
  };
}
