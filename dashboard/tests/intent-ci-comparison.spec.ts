// Intent's CI timing comparison for a selected done story
// (../src/IntentCiComparison.tsx, ../server/intentCiComparisonRead.ts):
// baseline, branch and landed wall times against the pre-story build, with
// measured-ancestor labelling, persistence after trunk advance and branch
// delete, SEED-236 earlier landing, unrecoverable history, and mixed entry
// rows (SEED-244#compare-story-ci-timing-changes examples 1–4, 8 and
// observed-not-attributed / whole-second). Entry-proof expiry and missing
// durations live in ./intent-ci-comparison-entries.spec.ts; Trunk Mode,
// running, failed and missing builds live in
// ./intent-ci-comparison-gaps.spec.ts. Taken-story and no-selection homepage
// journeys stay in ./intent-ci-status*.spec.ts.

import { expect, test } from "./support/preparationPage.ts";
import { shortSha } from "../src/baseCiWording.ts";
import { observedNotAttributed } from "../src/storyCiComparisonWording.ts";
import { publishCodeLandedBeforeCompletion } from "./support/storyCiComparisonEarlierLanding.ts";
import { publishComparedStoryBranch } from "./support/storyCiComparisonFixture.ts";
import { expectCiComparisonEntryRows } from "./support/expectCiComparisonEntryRows.ts";
import { selectDoneStoryForCiComparison } from "./support/selectDoneStoryForCiComparison.ts";
import { completedPublishedStory } from "./support/completedPublishedStory.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { commitAll, git, writeAt } from "./support/storyReviewWorktree.ts";
import { push } from "./support/storyReviewTrunkCommits.ts";

const unrecoverable =
  "Published execution history does not establish a complete claim and its attributed commits for this completion.";

test.setTimeout(240_000);

test("a selected done Story Branch story compares named baseline, branch and landed wall times and entry rows", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishComparedStoryBranch(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);

  await expect(panel.getByRole("heading")).toHaveText(
    `CI timing changes for ${setup.identity}`,
  );
  await expect(panel).toContainText(observedNotAttributed);
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
      name: "run 103 #1",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://ci.invalid/runs/103");
  await expect(panel.locator(".intent-ci-comparison-wall").nth(0)).toHaveText(
    "3 min",
  );
  await expect(
    panel.locator(".intent-ci-comparison-wall").nth(1),
  ).toContainText("3 min 20 s");
  await expect(
    panel.locator(".intent-ci-comparison-wall").nth(1),
  ).toContainText("+20 s");
  await expect(
    panel.locator(".intent-ci-comparison-wall").nth(2),
  ).toContainText("4 min");
  await expect(
    panel.locator(".intent-ci-comparison-wall").nth(2),
  ).toContainText("+1 min");
  await expect(panel).not.toContainText("Entry comparison is not yet shown.");
  await expectCiComparisonEntryRows(panel, [
    [
      "dashboard/tests",
      "10 passed tests",
      "4 min",
      "4 min 30 s +30 s",
      "5 min +1 min",
      "1 of 1 part present",
    ],
    [
      "tests",
      "5 passed checks",
      "2 min",
      "1 min 30 s -30 s",
      "1 min -1 min",
      "1 of 1 part present",
    ],
    [
      "src/skills",
      "3 passed checks",
      "added",
      "30 s",
      "30 s",
      "1 of 1 part present",
    ],
  ]);
});

test("code landed before completion uses the merge branch-side ancestor and the completion build (SEED-236)", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishCodeLandedBeforeCompletion(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const branchBuild = setup.branchAncestor ?? setup.branchSide;

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
  ).toContainText(shortSha(setup.completion));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText("exact revision");
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
  await expect(
    panel.locator(".intent-ci-comparison-wall").nth(1),
  ).toContainText("+20 s");
  await expect(
    panel.locator(".intent-ci-comparison-wall").nth(2),
  ).toContainText("+1 min");
  // Later trunk's 10 min build must not replace Branch or Landed.
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
