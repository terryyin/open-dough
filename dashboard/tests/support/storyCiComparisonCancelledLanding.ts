import { comparisonReading } from "../intentCiComparisonPage.ts";
// Cancelled Story Branch landings on Intent's CI timing comparison (SEED-254):
// later trunk builds' proofs, runs listings asked per later revision, and
// Landed's identity, figures and unused reason.

import { expect, type Locator, type Page } from "@playwright/test";
import type { CiRunAnswer } from "./baseCiActions.ts";
import { githubFor } from "../dashboardTest.ts";
import {
  mixedEntrySummary,
  proofRun,
  wall,
  type ComparisonProofServe,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";

export const mergeCancelled =
  "The CI build at the landing merge was cancelled.";
export const tipCancelled =
  "The CI build at the landed story revision was cancelled.";

// A usable proof summary for a later trunk build's run at `revision`.
export function laterProof(
  runId: number,
  revision: string,
): Record<number, ComparisonProofServe> {
  return {
    [runId]: {
      kind: "summary",
      artifactId: runId * 10,
      summary: mixedEntrySummary(proofRun(runId, revision), "landed"),
    },
  };
}

// A fast-forward landing's Baseline build and its story tip's cancelled run.
export function cancelledTipRuns(
  setup: StoryCiComparisonSetup,
): Record<string, readonly CiRunAnswer[]> {
  return {
    [setup.baseline]: [
      wall(setup.baseline, 401, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    [setup.completion]: [
      wall(
        setup.completion,
        402,
        "2026-11-05T14:00:00Z",
        "2026-11-05T14:01:00Z",
        "cancelled",
      ),
    ],
  };
}

// Runs listings asked per revision (`head_sha=`).
export function runListingsAt(
  page: Page,
  revisions: readonly string[],
): number[] {
  const calls = githubFor(page).calls;
  return revisions.map(
    (revision) =>
      calls.filter(
        ({ request }) =>
          request.kind === "actions-runs" && request.headSha === revision,
      ).length,
  );
}

export function landedOf(panel: Locator) {
  return {
    identity: comparisonReading(panel).identities.nth(2),
    wall: comparisonReading(panel).wallTimes.nth(2),
  };
}

// Landed unused with `why` after the cancelled explanation, no figures, and
// Branch versus Baseline active.
export async function expectLandedUnusedBecause(
  panel: Locator,
  cancelled: string,
  why: string,
) {
  const landed = landedOf(panel);
  await expect(landed.identity).toContainText(`${cancelled} ${why}`);
  await expect(landed.wall).toHaveText("—");
  await expect(comparisonReading(panel).activeComparison).toHaveText(
    "Baseline compared with Branch",
  );
  await expect(comparisonReading(panel).fallbackReason).toContainText(
    `Landed is not used: ${cancelled} ${why}`,
  );
}
