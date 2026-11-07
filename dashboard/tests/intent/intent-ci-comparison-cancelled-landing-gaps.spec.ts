// Cancelled Story Branch landings without later proof in reach on Intent's
// CI timing comparison (../../src/IntentCiComparison.tsx): Landed keeps the
// cancelled explanation, says why and shows no figures, and an answer still
// waiting for a later trunk build is read again (SEED-254
// use-later-ci-proof-for-cancelled-landings). Cancelled landings that find
// later proof live in ./intent-ci-comparison-cancelled-landing.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { publishCodeLandedBeforeCompletion } from "../support/storyCiComparisonEarlierLanding.ts";
import {
  laterTrunkRevisions,
  serveEarlierLandingWithLandedOutcome,
} from "../support/storyCiComparisonLandedOutcome.ts";
import { publishFastForwardLandedStory } from "../support/storyCiComparisonFastForward.ts";
import { advanceCompletedTrunk } from "../support/completedPublishedStory.ts";
import { git } from "../support/storyReviewWorktree.ts";
import {
  cancelledTipRuns,
  expectLandedUnusedBecause,
  landedOf,
  laterProof,
  mergeCancelled,
  runListingsAt,
  tipCancelled,
} from "../support/storyCiComparisonCancelledLanding.ts";
import { wall } from "../support/storyCiComparisonFixture.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";

test("a cancelled landing merge whose only later trunk build published no proof names that build without figures", async ({
  page,
  origin,
}) => {
  const setup = await publishCodeLandedBeforeCompletion(page, origin);
  const landing = setup.landingMerge ?? setup.completion;
  const later = laterTrunkRevisions(origin.origin, landing);
  expect(later).toHaveLength(3);
  const [, , third = ""] = later;
  serveEarlierLandingWithLandedOutcome(setup, "cancelled", {
    [third]: [wall(third, 399, "2026-11-05T15:00:00Z", "2026-11-05T15:05:00Z")],
  });
  const { panel } = await selectDoneStoryForCiComparison(page);
  await expectLandedUnusedBecause(
    panel,
    mergeCancelled,
    `The nearest later trunk build at ${shortSha(third)} (run 399 #1) published no CI proof summary.`,
  );
  await expect(panel).not.toContainText("5 min");
  expect(runListingsAt(page, later)).toEqual([1, 1, 1]);
});

test("a cancelled landing whose next trunk build is still running says so without figures", async ({
  page,
  origin,
}) => {
  const setup = await publishFastForwardLandedStory(page, origin);
  const tip = setup.completion;
  const [next = ""] = laterTrunkRevisions(origin.origin, tip);
  setup.serveRuns({
    ...cancelledTipRuns(setup),
    [next]: [
      {
        headSha: next,
        id: 403,
        attempt: 1,
        status: "in_progress",
        createdAt: "2026-11-05T14:30:00Z",
        startedAt: "2026-11-05T14:30:00Z",
        url: "https://ci.invalid/runs/403",
      },
    ],
  });
  const { panel } = await selectDoneStoryForCiComparison(page);
  await expectLandedUnusedBecause(
    panel,
    tipCancelled,
    `A later trunk build at ${shortSha(next)} (run 403 #1) is still running, so no later trunk build has finished yet.`,
  );
});

test("a cancelled landing names the proofless build before a running build and reads again when it finishes", async ({
  page,
  origin,
}) => {
  const setup = await publishCodeLandedBeforeCompletion(page, origin);
  const landing = setup.landingMerge ?? setup.completion;
  const later = laterTrunkRevisions(origin.origin, landing);
  expect(later).toHaveLength(3);
  const [proofless = "", running = ""] = later;
  const runs = {
    [proofless]: [
      wall(proofless, 304, "2026-11-05T14:30:00Z", "2026-11-05T14:35:00Z"),
    ],
  };
  const startedAt = "2026-11-05T14:40:00Z";
  serveEarlierLandingWithLandedOutcome(setup, "cancelled", {
    ...runs,
    [running]: [
      { headSha: running, id: 305, status: "in_progress", startedAt },
    ],
  });

  const first = await selectDoneStoryForCiComparison(page);
  await expectLandedUnusedBecause(
    first.panel,
    mergeCancelled,
    `The nearest later trunk build at ${shortSha(proofless)} (run 304 #1) published no CI proof summary. A later trunk build at ${shortSha(running)} (run 305 #1) is still running.`,
  );
  await expect(landedOf(first.panel).identity).not.toContainText(
    "no later trunk build has finished yet",
  );
  await expect(
    first.panel.locator(".intent-ci-comparison-without-waits").nth(2),
  ).toHaveText("—");

  serveEarlierLandingWithLandedOutcome(setup, "cancelled", {
    ...runs,
    [running]: [wall(running, 305, startedAt, "2026-11-05T14:47:00Z")],
  });
  setup.serveProofs(laterProof(305, running));
  const { panel } = await selectDoneStoryForCiComparison(page);
  const landed = landedOf(panel);
  await expect(landed.identity).toContainText(
    "run 305 #1 · passed · later trunk build: includes 2 later trunk revisions",
  );
  await expect(landed.wall).toHaveText("7 min");
});

test("a cancelled landing at the read trunk head waits for a later trunk build and uses it once pushed", async ({
  page,
  origin,
}) => {
  const setup = await publishFastForwardLandedStory(page, origin, true);
  const tip = setup.completion;
  expect(laterTrunkRevisions(origin.origin, tip)).toEqual([]);
  const runs = cancelledTipRuns(setup);
  setup.serveRuns(runs);
  const first = await selectDoneStoryForCiComparison(page);
  await expectLandedUnusedBecause(
    first.panel,
    tipCancelled,
    "No later trunk build has finished yet.",
  );

  advanceCompletedTrunk(origin);
  const next = git(origin.origin, "rev-parse", "main");
  expect(laterTrunkRevisions(origin.origin, tip)).toEqual([next]);
  setup.serveRuns({
    ...runs,
    [next]: [wall(next, 403, "2026-11-05T14:30:00Z", "2026-11-05T14:37:00Z")],
  });
  setup.serveProofs(laterProof(403, next));
  const { panel } = await selectDoneStoryForCiComparison(page);
  const landed = landedOf(panel);
  await expect(landed.identity).toContainText(`Cancelled at ${shortSha(tip)}.`);
  await expect(landed.identity).toContainText(
    "run 403 #1 · passed · later trunk build: includes 1 later trunk revision",
  );
  await expect(landed.wall).toHaveText("7 min");
  await expect(panel).not.toContainText(
    "No later trunk build has finished yet.",
  );
});
