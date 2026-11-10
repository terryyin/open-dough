// Public wall-time history answer shapes the lifecycle journey asserts:
// an exact measured point, a final no-build gap, and a pending build gap.
import { expect } from "@playwright/test";
import { timeAfter } from "./landedCiTrunk.ts";

type LandingRef = {
  readonly revision: string;
  readonly at: string;
};

export function exactHistoryPoint(
  landing: LandingRef,
  run: { readonly runId: number; readonly durationMs: number },
) {
  return {
    kind: "point" as const,
    revision: landing.revision,
    runUrl: `https://ci.invalid/runs/${run.runId}`,
    runId: run.runId,
    runAttempt: 1,
    startedAt: landing.at,
    completedAt: timeAfter(landing.at, run.durationMs),
    landings: [
      {
        revision: landing.revision,
        receivedAt: landing.at,
        provenance: "exact" as const,
      },
    ],
  };
}

export function noBuildHistoryGap(landing: LandingRef) {
  return {
    kind: "gap" as const,
    reason: "no-build" as const,
    revision: landing.revision,
    receivedAt: landing.at,
  };
}

export function pendingBuildHistoryGap(landing: LandingRef, runId: number) {
  return {
    kind: "gap" as const,
    reason: "pending" as const,
    waitsFor: "build" as const,
    revision: landing.revision,
    receivedAt: landing.at,
    runUrl: `https://ci.invalid/runs/${runId}`,
    runId,
    runAttempt: 1,
  };
}

export function publicHistoryAnswer(
  entries: readonly ReturnType<
    | typeof exactHistoryPoint
    | typeof noBuildHistoryGap
    | typeof pendingBuildHistoryGap
  >[],
) {
  return { status: 200, body: expect.objectContaining({ entries }) };
}
