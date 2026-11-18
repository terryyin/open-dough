// Landed outcomes at the earlier owning merge M of
// ./storyCiComparisonEarlierLanding.ts: a failed or cancelled build at M, and
// for a cancelled landing (SEED-254) the later trunk revisions whose builds
// may stand in as a later trunk build.

import type { CiRunAnswer } from "./baseCiActions.ts";
import {
  wall,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";
import { git } from "./storyReviewWorktree.ts";

// SEED-236 / SEED-248 gap journeys: same A/B/tempting builds as the happy
// path, with Landed at M overridden (failed or cancelled) while the
// trunk-side parent keeps a build that must not become C. Completion D keeps
// one too unless `laterTrunk` serves the trunk revisions after M instead
// (SEED-254 cancelled landings, by revision).
export function serveEarlierLandingWithLandedOutcome(
  setup: StoryCiComparisonSetup,
  landedConclusion: "failure" | "cancelled",
  laterTrunk?: Record<string, readonly CiRunAnswer[]>,
): void {
  const landed = setup.landingMerge ?? setup.completion;
  const branchBuild = setup.branchAncestor ?? setup.branchSide;
  setup.serveRuns({
    [setup.baseline]: [
      wall(setup.baseline, 301, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    [branchBuild]: [
      wall(branchBuild, 302, "2026-11-05T13:00:00Z", "2026-11-05T13:03:20Z"),
    ],
    [setup.branchSide]: [],
    ...(setup.trunkSide === undefined
      ? {}
      : {
          [setup.trunkSide]: [
            wall(
              setup.trunkSide,
              398,
              "2026-11-05T13:30:00Z",
              "2026-11-05T13:40:00Z",
            ),
          ],
        }),
    [landed]: [
      wall(
        landed,
        303,
        "2026-11-05T14:00:00Z",
        "2026-11-05T14:04:00Z",
        landedConclusion,
      ),
    ],
    ...(laterTrunk ?? {
      [setup.completion]: [
        wall(
          setup.completion,
          304,
          "2026-11-05T14:30:00Z",
          "2026-11-05T14:08:00Z",
        ),
      ],
    }),
  });
}

// Trunk's first-parent revisions after `landing` up to the published main,
// nearest first (D, the advance commit, then the later trunk build).
export function laterTrunkRevisions(repo: string, landing: string): string[] {
  return git(
    repo,
    "rev-list",
    "--first-parent",
    "--reverse",
    "--ancestry-path",
    `${landing}..main`,
  )
    .split("\n")
    .filter(Boolean);
}
