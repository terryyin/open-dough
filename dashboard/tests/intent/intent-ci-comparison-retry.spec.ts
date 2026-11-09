// Recovering an unavailable done-story CI timing comparison in the same
// dashboard process: an answer with an unavailable slot is not remembered
// (../../server/intentCiComparisonAnswers.ts), so the next read, by
// reselecting the story or by its Check again
// (../../src/IntentCiComparison.tsx), lists the endpoint afresh and reads the
// endpoint proofs again; once final, reading again asks GitHub nothing. A
// whole-answer gap, such as unrecoverable published history
// (SEED-244#compare-story-ci-timing-changes), and a failed whole read
// recover the same way. Other gap journeys live in
// ./intent-ci-comparison-gaps.spec.ts.

import type { Locator } from "@playwright/test";
import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { readWaitLimitMs } from "../../src/authenticatedReadRules.ts";
import { expectSourceCue } from "../support/expectCiComparisonSourceCue.ts";
import { wall } from "../support/storyCiComparisonFixture.ts";
import { publishComparedStoryBranch } from "../support/storyCiComparisonDoneFixture.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import {
  checkAgainOf,
  checkComparisonAgain,
  listedHeadSha,
  publishTrunkStoryWithBaseline,
  watchComparisonReads,
} from "../support/storyCiComparisonRetry.ts";
import { parseRequest } from "../support/ghRequest.ts";
import { noConnection } from "../originAnswers.ts";
import { completedPublishedStory } from "../support/completedPublishedStory.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { commitAll, git, writeAt } from "../support/storyReviewWorktree.ts";
import { push } from "../support/storyReviewTrunkCommits.ts";
import { actionsRunsAnswer } from "../support/baseCiActions.ts";

const unrecoverable =
  "Published execution history does not establish a complete claim and its attributed commits for this completion.";

const baselineCell = (panel: Locator) =>
  panel.locator(".intent-ci-comparison-identity").first();

test("a Baseline listing that failed once is listed again on the next read, then remembered", async ({
  page,
  origin,
}) => {
  const { baseline, listings } = await publishTrunkStoryWithBaseline(
    page,
    origin,
    (listing) =>
      listing === 1
        ? noConnection
        : actionsRunsAnswer([
            wall(baseline, 200, "2026-11-05T11:00:00Z", "2026-11-05T11:03:00Z"),
          ]),
  );

  const failed = await selectDoneStoryForCiComparison(page);
  await expect(baselineCell(failed.panel)).toContainText(
    `head_sha=${baseline}`,
  );
  await expect(baselineCell(failed.panel)).toContainText(
    "GitHub is unreachable",
  );

  const recovered = await selectDoneStoryForCiComparison(page);
  await expect(baselineCell(recovered.panel)).toContainText(shortSha(baseline));
  await expectSourceCue(baselineCell(recovered.panel));
  const listedToRecover = listings.baseline;
  expect(listedToRecover).toBeGreaterThan(1);

  const remembered = await selectDoneStoryForCiComparison(page);
  await expect(baselineCell(remembered.panel)).toContainText(
    shortSha(baseline),
  );
  expect(listings.baseline).toBe(listedToRecover);
});

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
  const reads = await watchComparisonReads(page);

  const { panel } = await selectDoneStoryForCiComparison(page);
  const identity = panel.locator(".intent-ci-comparison-identity");
  await expect(identity.nth(0)).toContainText("GitHub is unreachable");
  await expect(identity.nth(1)).toContainText(shortSha(setup.branchSide));
  await expect(identity.nth(2)).toContainText(shortSha(setup.completion));
  const checkAgain = checkAgainOf(panel);

  await checkComparisonAgain(page, panel);
  await expect(identity.nth(0)).toContainText(shortSha(setup.baseline));
  await expectSourceCue(identity.nth(0));
  await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
    "Baseline compared with Landed",
  );
  await expect(
    panel.locator(".intent-ci-comparison-overall-counts"),
  ).toHaveText("2,090 → 2,092 tests (+2); 5 → 8 checks (+3)");
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
  await expect(
    again.panel.locator(".intent-ci-comparison-identity").nth(0),
  ).toContainText(shortSha(setup.baseline));
  await expect.poll(() => reads.finished.proof).toBe(proofs + 6);
  expect(asked).toBe(askedBefore);
});

test("Check again reads the endpoint proof that failed once again", async ({
  page,
  origin,
}) => {
  const setup = await publishComparedStoryBranch(page, origin);
  let landedArtifactListings = 0;
  setup.interceptActions((argv) => {
    const request = parseRequest(argv);
    if (request.kind !== "actions-run-artifacts" || request.runId !== 103)
      return undefined;
    landedArtifactListings += 1;
    return landedArtifactListings === 1 ? noConnection : undefined;
  });

  const { panel } = await selectDoneStoryForCiComparison(page);
  await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
    "Baseline compared with Branch",
  );
  await checkComparisonAgain(page, panel);
  await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
    "Baseline compared with Landed",
  );
  await expect(
    panel.locator(".intent-ci-comparison-overall-counts"),
  ).toHaveText("2,090 → 2,092 tests (+2); 5 → 8 checks (+3)");
  expect(landedArtifactListings).toBe(2);
});

test("while the Baseline listing keeps failing, each Check again lists it again and shows why", async ({
  page,
  origin,
}) => {
  const { baseline, listings } = await publishTrunkStoryWithBaseline(
    page,
    origin,
    () => noConnection,
  );
  const reads = await watchComparisonReads(page);

  const { panel } = await selectDoneStoryForCiComparison(page);
  await expect(baselineCell(panel)).toContainText("GitHub is unreachable");
  const checkAgain = checkAgainOf(panel);
  for (let round = 0; round < 2; round += 1) {
    const listed = listings.baseline;
    const comparisons = reads.finished.comparison;
    const release = reads.hold();
    await checkAgain.click();
    await expect(checkAgain).toBeDisabled();
    release();
    await expect
      .poll(() => reads.finished.comparison, {
        timeout: readWaitLimitMs + 15_000,
      })
      .toBe(comparisons + 1);
    await expect(checkAgain).toBeEnabled();
    await expect(baselineCell(panel)).toContainText(`head_sha=${baseline}`);
    await expect(baselineCell(panel)).toContainText("GitHub is unreachable");
    expect(listings.baseline).toBeGreaterThan(listed);
  }
});

test("Check again reads the comparison again after its whole read failed", async ({
  page,
  origin,
}) => {
  const { baseline } = await publishTrunkStoryWithBaseline(page, origin, () =>
    actionsRunsAnswer([
      wall(baseline, 200, "2026-11-05T11:00:00Z", "2026-11-05T11:03:00Z"),
    ]),
  );
  const reads = await watchComparisonReads(page);
  reads.refuseNext();

  const { panel } = await selectDoneStoryForCiComparison(page);
  await expect(panel.locator(".intent-ci-gap")).toBeVisible();
  await expect(panel.locator(".intent-ci-comparison")).toHaveCount(0);
  await checkComparisonAgain(page, panel);
  await expect(baselineCell(panel)).toContainText(shortSha(baseline));
  await expectSourceCue(baselineCell(panel));
  await expect(panel.locator(".intent-ci-gap")).toHaveCount(0);
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
  await expect(panel.locator(".intent-ci-gap")).toContainText(unrecoverable);
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
  await expect(panel.locator(".intent-ci-gap")).toHaveCount(0);
  await expect(checkAgain).toBeEnabled();
});
