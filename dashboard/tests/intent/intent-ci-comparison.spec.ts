// Intent's CI timing comparison for a selected done story
// (../../src/IntentCiComparison.tsx, ../../server/intentCiComparisonRead.ts):
// baseline, branch and landed wall times against the pre-story build, with
// measured-ancestor labelling, persistence after trunk advance and branch
// delete, SEED-236 earlier landing, unrecoverable history, and mixed entry
// rows (SEED-244#compare-story-ci-timing-changes examples 1–4, 8 and
// observed-not-attributed / whole-second). SEED-248 fast-forward landings
// live in ./intent-ci-comparison-fast-forward.spec.ts; entry-proof expiry
// and missing durations live in ./intent-ci-comparison-entries.spec.ts;
// Trunk Mode, running, failed and missing builds live in
// ./intent-ci-comparison-gaps.spec.ts. Taken-story provisional journeys live
// in ./intent-ci-comparison-taken.spec.ts; no-selection homepage consumers
// stay in ./intent-ci-status*.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { observedNotAttributed } from "../../src/storyCiComparisonWording.ts";
import { publishCodeLandedBeforeCompletion } from "../support/storyCiComparisonEarlierLanding.ts";
import { comparisonWorkflowPath } from "../support/storyCiComparisonFixture.ts";
import { serveObservedComparisonAttempts } from "../support/storyCiObservedJobs.ts";
import { publishComparedStoryBranch } from "../support/storyCiComparisonDoneFixture.ts";
import { expectCiComparisonEntryRows } from "../support/expectCiComparisonEntryRows.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { completedPublishedStory } from "../support/completedPublishedStory.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { commitAll, git, writeAt } from "../support/storyReviewWorktree.ts";
import { push } from "../support/storyReviewTrunkCommits.ts";

const unrecoverable =
  "Published execution history does not establish a complete claim and its attributed commits for this completion.";

test.setTimeout(240_000);

const comparisonEntryRows = [
  [
    "dashboard/tests",
    "2,090 → 2,092 +2 tests",
    "4 min",
    "4 min 30 s +30 s",
    "5 min +1 min",
    "1 of 1 part present",
  ],
  [
    "tests",
    "5 → 5 0 checks",
    "2 min",
    "1 min 30 s -30 s",
    "1 min -1 min",
    "1 of 1 part present",
  ],
  [
    "src/skills",
    "added → 3 checks",
    "added",
    "30 s",
    "30 s",
    "1 of 1 part present",
  ],
] as const;

for (const variant of [
  undefined,
  "own-conflict-extra",
  "non-owning-story-file",
] as const) {
  const label =
    variant === undefined
      ? "clean landing"
      : variant === "own-conflict-extra"
        ? "owning merge-resolution edits"
        : "non-owning merge resolution on a story file";
  test(`a selected done Story Branch story with ${label} compares named builds by CI time without runner waits and compares entry rows`, async ({
    page,
    origin,
  }) => {
    test.slow();
    const setup = await publishComparedStoryBranch(page, origin, variant);
    // An incompatible workflow at the local tip cannot supply historical
    // dependencies. The selected path exists in each build's own revision.
    writeAt(origin.project, comparisonWorkflowPath, "jobs: {}\n");
    commitAll(origin.project, "change the workflow after the compared builds");
    const landedJobsUnavailable = variant === "non-owning-story-file";
    serveObservedComparisonAttempts(
      setup,
      landedJobsUnavailable ? "jobs-unavailable" : "rerun",
    );
    const { panel } = await selectDoneStoryForCiComparison(page);

    await expect(panel.getByRole("heading")).toHaveText(
      `CI timing changes for ${setup.identity}`,
    );
    await expect(panel).toContainText(observedNotAttributed);
    await expect(
      panel.locator(".intent-ci-comparison-identity").nth(0),
    ).toContainText("No build at");
    await expect(
      panel.locator(".intent-ci-comparison-identity").nth(0),
    ).toContainText("the workflow at that revision could not be read");
    await expect(
      panel.locator(".intent-ci-comparison-identity").nth(0),
    ).toContainText(shortSha(setup.baseline));
    await expect(
      panel.locator(".intent-ci-comparison-identity").nth(0),
    ).toContainText(
      `ancestor: ${String(setup.laterWithoutBuild)} later revision`,
    );
    await expect(
      panel.locator(".intent-ci-comparison-identity").nth(1),
    ).toContainText(shortSha(setup.branchSide));
    await expect(
      panel.locator(".intent-ci-comparison-identity").nth(2),
    ).toContainText(shortSha(setup.completion));
    await expect(
      panel.locator(".intent-ci-comparison-identity").nth(0).getByRole("link", {
        name: "run 101 #1",
        exact: true,
      }),
    ).toHaveAttribute("href", "https://ci.invalid/runs/101");
    await expect(
      panel.locator(".intent-ci-comparison-identity").nth(1).getByRole("link", {
        name: "run 102 #1",
        exact: true,
      }),
    ).toHaveAttribute("href", "https://ci.invalid/runs/102");
    await expect(
      panel.locator(".intent-ci-comparison-identity").nth(2).getByRole("link", {
        name: "run 103 #2",
        exact: true,
      }),
    ).toHaveAttribute("href", "https://ci.invalid/runs/103");
    await expect(
      panel.getByRole("columnheader", { name: "CI wall time" }),
    ).toBeVisible();
    await expect(
      panel.getByRole("columnheader", { name: "CI time without runner waits" }),
    ).toBeVisible();
    await expect(panel.locator(".intent-ci-comparison-wall")).toHaveText([
      "4 min 59 s",
      "13 min 27 s",
      "5 min 19 s",
    ]);
    await expect(
      panel.locator(".intent-ci-comparison-without-waits"),
    ).toHaveText([
      "4 min 55 s",
      "4 min 47 s -8 s",
      landedJobsUnavailable
        ? "Unavailable. The build's attempt jobs could not be read."
        : "5 min 12 s +17 s",
    ]);
    await expect(panel).not.toContainText("Entry comparison is not yet shown.");
    await expectCiComparisonEntryRows(panel, comparisonEntryRows);
  });
}

test("code landed before completion uses the merge branch-side ancestor and the landing merge build (SEED-236)", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishCodeLandedBeforeCompletion(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const branchBuild = setup.branchAncestor ?? setup.branchSide;
  const landed = setup.landingMerge ?? setup.completion;

  await expect(panel.getByRole("heading")).toHaveText(
    `CI timing changes for ${setup.identity}`,
  );
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(1),
  ).toContainText(shortSha(branchBuild));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(1),
  ).toContainText("ancestor:");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(1),
  ).not.toContainText(shortSha(setup.completion));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText(shortSha(landed));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText("exact revision");
  // Completion D and trunk-side parent of M must not replace Landed.
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).not.toContainText(shortSha(setup.completion));
  if (setup.trunkSide !== undefined) {
    await expect(
      panel.locator(".intent-ci-comparison-identity").nth(2),
    ).not.toContainText(shortSha(setup.trunkSide));
  }
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(1).getByRole("link", {
      name: "run 302 #1",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://ci.invalid/runs/302");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2).getByRole("link", {
      name: "run 303 #1",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://ci.invalid/runs/303");
  await expect(panel.locator(".intent-ci-comparison-wall").nth(1)).toHaveText(
    "3 min 20 s",
  );
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "4 min",
  );
  // Completion's later run and later trunk must not replace Branch or Landed.
  await expect(panel).not.toContainText("run 304");
  await expect(panel).not.toContainText("run 398");
  await expect(panel).not.toContainText("run 399");
  await expect(panel).not.toContainText("10 min");
});

test("unrecoverable published history shows the published-review explanation without inventing builds", async ({
  page,
  origin,
}) => {
  test.slow();
  writeAt(origin.project, "src/built.ts", "built\n");
  commitAll(origin.project, "ship a built revision");
  push(origin.project);
  await completedPublishedStory(origin, "story-branch");
  // Shallow project checkout: claim history cannot be recovered.
  git(origin.project, "fetch", "--quiet", "--depth=1", "origin", "main");
  const published = git(origin.origin, "rev-parse", "main");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  const { panel } = await selectDoneStoryForCiComparison(page);
  await expect(panel.getByRole("heading")).toHaveText(
    "CI timing changes for SEED-A#a",
  );
  await expect(panel.locator(".intent-ci-gap")).toContainText(unrecoverable);
  await expect(panel.locator(".intent-ci-comparison")).toHaveCount(0);
  await expect(panel).not.toContainText("run ");
  await expect(panel).not.toContainText("+");
});
