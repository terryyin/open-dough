// Recovering an unavailable done-story CI timing comparison in the same
// dashboard process (SEED-118#retry-unavailable-ci-comparison-slots): an
// answer with an unavailable slot is not remembered
// (../../server/intentCiComparisonAnswers.ts), so the next read lists the
// endpoint afresh; once final, reading again asks GitHub nothing. Gap
// journeys live in ./intent-ci-comparison-gaps.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { wall } from "../support/storyCiComparisonFixture.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import {
  advanceCompletedTrunk,
  completedPublishedStory,
} from "../support/completedPublishedStory.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { noConnection } from "../originAnswers.ts";
import { commitAll, git, writeAt } from "../support/storyReviewWorktree.ts";
import { push } from "../support/storyReviewTrunkCommits.ts";
import {
  actionsRunsAnswer,
  actionsWorkflowAnswer,
} from "../support/baseCiActions.ts";

test("a Baseline listing that failed once is listed again on the next read, then remembered", async ({
  page,
  origin,
}) => {
  writeAt(origin.project, "src/built.ts", "built before claim\n");
  commitAll(origin.project, "ship a built revision");
  const baseline = git(origin.project, "rev-parse", "HEAD");
  push(origin.project);
  await completedPublishedStory(origin, "trunk");
  advanceCompletedTrunk(origin);
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: git(origin.origin, "rev-parse", "main"),
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  let baselineListings = 0;
  committed.serveActions((argv) => {
    const route = argv.find((a) => a.startsWith("repos/")) ?? "";
    if (/\/actions\/workflows\/[^/?]+$/.test(route))
      return actionsWorkflowAnswer();
    const runs = /\/actions\/workflows\/[^/]+\/runs\?(.*)$/.exec(route);
    if (runs?.[1] === undefined) return undefined;
    if (new URLSearchParams(runs[1]).get("head_sha") !== baseline)
      return actionsRunsAnswer([]);
    baselineListings += 1;
    if (baselineListings === 1) return noConnection;
    return actionsRunsAnswer([
      wall(baseline, 200, "2026-11-05T11:00:00Z", "2026-11-05T11:03:00Z"),
    ]);
  });
  const baselineCell = (panel: import("@playwright/test").Locator) =>
    panel.locator(".intent-ci-comparison-identity").first();

  const failed = await selectDoneStoryForCiComparison(page);
  await expect(baselineCell(failed.panel)).toContainText(
    `head_sha=${baseline}`,
  );
  await expect(baselineCell(failed.panel)).toContainText(
    "GitHub is unreachable",
  );

  const recovered = await selectDoneStoryForCiComparison(page);
  await expect(baselineCell(recovered.panel)).toContainText("run 200");
  const listedToRecover = baselineListings;
  expect(listedToRecover).toBeGreaterThan(1);

  const remembered = await selectDoneStoryForCiComparison(page);
  await expect(baselineCell(remembered.panel)).toContainText("run 200");
  expect(baselineListings).toBe(listedToRecover);
});
