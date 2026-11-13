import { comparisonReading } from "../../dashboard/tests/intentCiComparisonPage.ts";
// Retained integration: real Git/provider acquisition reaches Check again and
// process memory, and actual shallow claim history recovers after unshallowing.
// Fast read/provider memory rules and mounted controls own the other variants.

import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import { shortSha } from "../../dashboard/src/baseCiWording.ts";
import { expectSourceCue } from "../../dashboard/tests/support/expectCiComparisonSourceCue.ts";
import { publishComparedStoryBranch } from "../../dashboard/tests/support/storyCiComparisonDoneFixture.ts";
import { selectDoneStoryForCiComparison } from "../../dashboard/tests/support/selectDoneStoryForCiComparison.ts";
import {
  checkAgainOf,
  checkComparisonAgain,
  listedHeadSha,
  watchComparisonReads,
} from "../../dashboard/tests/support/storyCiComparisonRetry.ts";
import { noConnection } from "../../dashboard/tests/originAnswers.ts";
import { completedPublishedStory } from "../../dashboard/tests/support/completedPublishedStory.ts";
import { publishCommittedOrigin } from "../../dashboard/tests/committedOrigin.ts";
import {
  commitAll,
  git,
  writeAt,
} from "../../dashboard/tests/support/storyReviewWorktree.ts";
import { push } from "../../dashboard/tests/support/storyReviewTrunkCommits.ts";

const unrecoverable =
  "Published execution history does not establish a complete claim and its attributed commits for this completion.";

test("Check again recovers a done Story Branch Baseline that failed once, then asks GitHub nothing", async ({
  page,
  origin,
}) => {
  const setup = await publishComparedStoryBranch(page, origin);
  let asked = 0;
  let baselineListings = 0;
  setup.interceptActions((argv) => {
    asked += 1;
    if (listedHeadSha(argv) !== setup.baseline) return undefined;
    baselineListings += 1;
    return baselineListings === 1 ? noConnection : undefined;
  });
  const reads = watchComparisonReads(page);

  const { panel } = await selectDoneStoryForCiComparison(page);
  const identity = comparisonReading(panel).identities;
  await expect(identity.nth(0)).toContainText("GitHub is unreachable");
  await expect(identity.nth(1)).toContainText(shortSha(setup.branchSide));
  await expect(identity.nth(2)).toContainText(shortSha(setup.completion));
  const checkAgain = checkAgainOf(panel);

  await checkComparisonAgain(page, panel);
  await expect(identity.nth(0)).toContainText(shortSha(setup.baseline));
  await expectSourceCue(identity.nth(0));
  await expect(comparisonReading(panel).activeComparison).toHaveText(
    "Baseline compared with Landed",
  );
  await expect(comparisonReading(panel).overallCounts).toHaveText(
    "2,090 → 2,092 test cases (+2); 5 → 8 test files (+3)",
  );
  await expect(checkAgain).toBeEnabled();
  await expect(panel.locator(".intent-ci-reading")).toHaveCount(0);

  // The final answer and its valid proof summaries are remembered: Check
  // again, and selecting the story again, read them without GitHub.
  const askedBefore = asked;
  const comparisons = reads.finished.comparison;
  const proofs = reads.finished.proof;
  await checkAgain.click();
  await expect.poll(() => reads.finished.comparison).toBe(comparisons + 1);
  await expect.poll(() => reads.finished.proof).toBe(proofs + 3);
  await expect(identity.nth(0)).toContainText(shortSha(setup.baseline));
  const again = await selectDoneStoryForCiComparison(page);
  await expect(comparisonReading(again.panel).identities.nth(0)).toContainText(
    shortSha(setup.baseline),
  );
  await expect.poll(() => reads.finished.proof).toBe(proofs + 6);
  expect(asked).toBe(askedBefore);
});

test("unrecoverable published history shows the published-review explanation without inventing builds, and Check again reads it again", async ({
  page,
  origin,
}) => {
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
  await expect(panel.getByRole("heading")).toHaveText("CI timing changes");
  await expect(comparisonReading(panel).gap).toContainText(unrecoverable);
  await expect(panel.locator(".intent-ci-comparison")).toHaveCount(0);
  await expect(panel).not.toContainText("run ");
  await expect(panel).not.toContainText("+");

  // The whole-answer gap is not remembered: once the claim history is
  // recoverable, Check again shows the comparison.
  const checkAgain = checkAgainOf(panel);
  await expect(checkAgain).toBeEnabled();
  git(origin.project, "fetch", "--quiet", "--unshallow", "origin", "main");
  await checkComparisonAgain(page, panel);
  await expect(panel.locator(".intent-ci-comparison")).not.toHaveCount(0);
  await expect(comparisonReading(panel).gap).toHaveCount(0);
  await expect(checkAgain).toBeEnabled();
});
