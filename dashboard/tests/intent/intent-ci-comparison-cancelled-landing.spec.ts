// Cancelled Story Branch landings on Intent's CI timing comparison
// (../../src/IntentCiComparison.tsx): Landed keeps Cancelled at the landing
// and uses the nearest later trunk build with usable proof, named as a later
// trunk build with how many later trunk revisions it includes (SEED-254
// use-later-ci-proof-for-cancelled-landings). Failed landing gaps live in
// ./intent-ci-comparison-landing-gaps.spec.ts.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { githubFor } from "../dashboardTest.ts";
import { proofCalls } from "../intentCiProofPage.ts";
import { publishCodeLandedBeforeCompletion } from "../support/storyCiComparisonEarlierLanding.ts";
import {
  laterTrunkRevisions,
  serveEarlierLandingWithLandedOutcome,
} from "../support/storyCiComparisonLandedOutcome.ts";
import { publishFastForwardLandedStory } from "../support/storyCiComparisonFastForward.ts";
import {
  mixedEntrySummary,
  proofRun,
  wall,
  type ComparisonProofServe,
} from "../support/storyCiComparisonFixture.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";

test.setTimeout(240_000);

function laterProof(
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

// Runs listings asked per revision (`head_sha=`).
function runListingsAt(page: Page, revisions: readonly string[]): number[] {
  const calls = githubFor(page).calls;
  return revisions.map(
    (revision) =>
      calls.filter(
        ({ request }) =>
          request.kind === "actions-runs" && request.headSha === revision,
      ).length,
  );
}

function landedOf(panel: Locator) {
  return {
    identity: panel.locator(".intent-ci-comparison-identity").nth(2),
    wall: panel.locator(".intent-ci-comparison-wall").nth(2),
  };
}

test("a cancelled landing merge uses the next trunk push's passing build as a later build", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishCodeLandedBeforeCompletion(page, origin);
  const landing = setup.landingMerge ?? setup.completion;
  const later = laterTrunkRevisions(origin.origin, landing);
  expect(later[0]).toBe(setup.completion);
  serveEarlierLandingWithLandedOutcome(setup, "cancelled", {
    [setup.completion]: [
      wall(
        setup.completion,
        304,
        "2026-11-05T14:30:00Z",
        "2026-11-05T14:34:00Z",
      ),
    ],
  });
  setup.serveProofs(laterProof(304, setup.completion));
  const { panel } = await selectDoneStoryForCiComparison(page);
  const landed = landedOf(panel);
  await expect(landed.identity).toContainText(
    `Cancelled at ${shortSha(landing)}.`,
  );
  await expect(landed.identity).toContainText(shortSha(setup.completion));
  await expect(landed.identity).toContainText("run 304 #1");
  await expect(landed.identity).toContainText(
    "passed · later trunk build: includes 1 later trunk revision",
  );
  await expect(landed.wall).toHaveText("4 min");
  // Branch versus Baseline stays readable; the trunk-side parent never stands in.
  await expect(panel.locator(".intent-ci-comparison-wall").nth(1)).toHaveText(
    "3 min 20 s",
  );
  await expect(panel).not.toContainText("run 398");
  expect(runListingsAt(page, later)).toEqual([1, 0, 0]);
  expect(
    proofCalls(githubFor(page).calls).filter((call) =>
      call.startsWith("artifacts of run 304"),
    ),
  ).toEqual(["artifacts of run 304: ci-proof-summary-attempt-1"]);
});

test("a cancelled landing merge passes two cancelled trunk builds and counts three later revisions", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishCodeLandedBeforeCompletion(page, origin);
  const landing = setup.landingMerge ?? setup.completion;
  const later = laterTrunkRevisions(origin.origin, landing);
  expect(later).toHaveLength(3);
  const [first = "", second = "", third = ""] = later;
  serveEarlierLandingWithLandedOutcome(setup, "cancelled", {
    [first]: [
      wall(
        first,
        304,
        "2026-11-05T14:30:00Z",
        "2026-11-05T14:31:00Z",
        "cancelled",
      ),
    ],
    [second]: [
      wall(
        second,
        305,
        "2026-11-05T14:40:00Z",
        "2026-11-05T14:41:00Z",
        "cancelled",
      ),
    ],
    [third]: [wall(third, 399, "2026-11-05T15:00:00Z", "2026-11-05T15:05:00Z")],
  });
  setup.serveProofs(laterProof(399, third));
  const { panel } = await selectDoneStoryForCiComparison(page);
  const landed = landedOf(panel);
  await expect(landed.identity).toContainText(
    `Cancelled at ${shortSha(landing)}.`,
  );
  await expect(landed.identity).toContainText(shortSha(third));
  await expect(landed.identity).toContainText("run 399 #1");
  await expect(landed.identity).toContainText(
    "passed · later trunk build: includes 3 later trunk revisions",
  );
  await expect(landed.wall).toHaveText("5 min");
  await expect(panel).not.toContainText("run 304");
  await expect(panel).not.toContainText("run 305");
  expect(runListingsAt(page, later)).toEqual([1, 1, 1]);
  // One artifact listing per build checked; cancelled builds are not checked.
  expect(
    proofCalls(githubFor(page).calls).filter((call) =>
      /^artifacts of run (304|305|399):/.test(call),
    ),
  ).toEqual(["artifacts of run 399: ci-proof-summary-attempt-1"]);
});

test("a cancelled landing merge uses a failed later trunk build with proof, labelled failed", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishCodeLandedBeforeCompletion(page, origin);
  const landing = setup.landingMerge ?? setup.completion;
  serveEarlierLandingWithLandedOutcome(setup, "cancelled", {
    [setup.completion]: [
      wall(
        setup.completion,
        304,
        "2026-11-05T14:30:00Z",
        "2026-11-05T14:36:00Z",
        "failure",
      ),
    ],
  });
  setup.serveProofs(laterProof(304, setup.completion));
  const { panel } = await selectDoneStoryForCiComparison(page);
  const landed = landedOf(panel);
  await expect(landed.identity).toContainText(
    `Cancelled at ${shortSha(landing)}.`,
  );
  await expect(landed.identity).toContainText(shortSha(setup.completion));
  await expect(landed.identity).toContainText(
    "run 304 #1 · failed · later trunk build: includes 1 later trunk revision (failed build)",
  );
  await expect(landed.wall).toHaveText("6 min");
});

test("a fast-forward landing whose story tip's run was cancelled uses the next trunk build's proof", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishFastForwardLandedStory(page, origin);
  const tip = setup.completion;
  const later = laterTrunkRevisions(origin.origin, tip);
  expect(later).toHaveLength(1);
  const [next = ""] = later;
  setup.serveRuns({
    [setup.baseline]: [
      wall(setup.baseline, 401, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    [setup.mainSide]: [
      wall(setup.mainSide, 498, "2026-11-05T13:30:00Z", "2026-11-05T13:40:00Z"),
    ],
    [tip]: [
      wall(
        tip,
        402,
        "2026-11-05T14:00:00Z",
        "2026-11-05T14:01:00Z",
        "cancelled",
      ),
    ],
    [next]: [wall(next, 403, "2026-11-05T14:30:00Z", "2026-11-05T14:37:00Z")],
  });
  setup.serveProofs(laterProof(403, next));
  const { panel } = await selectDoneStoryForCiComparison(page);
  const landed = landedOf(panel);
  await expect(landed.identity).toContainText(`Cancelled at ${shortSha(tip)}.`);
  await expect(landed.identity).toContainText(shortSha(next));
  await expect(landed.identity).toContainText(
    "run 403 #1 · passed · later trunk build: includes 1 later trunk revision",
  );
  await expect(landed.wall).toHaveText("7 min");
  await expect(panel).not.toContainText("run 498");
  expect(runListingsAt(page, later)).toEqual([1]);
});
