// Public wall-time history answer shapes the lifecycle journey asserts, each
// one entry of `makeMe.aCiHistoryAnswer` for a landing built from when it was
// recorded: an exact measured point, a final no-build gap, and a pending
// build gap.
import { expect } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type {
  LandedCiEntry,
  LandedCiHistory,
} from "../../src/landedCiHistory.ts";
import { timeAfter } from "./landedCiTrunk.ts";

type LandingRef = {
  readonly revision: string;
  readonly at: string;
};

const onlyEntry = ({ entries: [entry] }: LandedCiHistory): LandedCiEntry => {
  if (entry === undefined) throw new Error("The answer must hold its entry.");
  return entry;
};

export function exactHistoryPoint(
  landing: LandingRef,
  run: { readonly runId: number; readonly durationMs: number },
) {
  return onlyEntry(
    makeMe.aCiHistoryAnswer
      .measuredBuild({
        revision: landing.revision,
        runId: run.runId,
        startedAt: landing.at,
        completedAt: timeAfter(landing.at, run.durationMs),
      })
      .please(),
  );
}

export function noBuildHistoryGap(landing: LandingRef) {
  return onlyEntry(
    makeMe.aCiHistoryAnswer
      .unmeasuredLanding({
        revision: landing.revision,
        receivedAt: landing.at,
        reason: "no-build",
      })
      .please(),
  );
}

export function pendingBuildHistoryGap(landing: LandingRef, runId: number) {
  return onlyEntry(
    makeMe.aCiHistoryAnswer
      .pendingLanding({
        revision: landing.revision,
        receivedAt: landing.at,
        waitsFor: "build",
        runId,
      })
      .please(),
  );
}

export function publicHistoryAnswer(entries: readonly LandedCiEntry[]) {
  return { status: 200, body: expect.objectContaining({ entries }) };
}
