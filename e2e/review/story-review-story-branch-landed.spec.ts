// The installed start and trunk integration run against a real bare origin.
// Only native Codex transport and GitHub are substituted. The retired case is
// ./story-review-recorded-landing.spec.ts.
import {
  test,
  expect,
} from "../../dashboard/test-support/support/codexStart.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { browserLocaleString } from "../../dashboard/test-support/browserLocale.ts";
import { openDoneStoryCard } from "../../dashboard/test-support/doneStoryReviewPage.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { claimedRecord } from "../../dashboard/test-support/support/storyBranchIntegration.ts";
import { landedStoryBranch } from "../../dashboard/test-support/support/storyBranchLandedReview.ts";

test("a Done story offers its exact accepted landing from published history beside its integrated workspace", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  const { refinement, story, accepted, record } =
    await test.step("Given Story A lands after refinement and keeps its integrated workspace", () => {
      // Two installed native launches and trunk integration precede the review.
      test.setTimeout(90_000);
      if (codexProtocol === undefined) throw new Error("No native fixture");
      return landedStoryBranch(dashboard, origin, codexProtocol);
    });
  await test.step("And the dashboard follows published trunk", () =>
    publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: accepted,
      repository: "terryyin/open-dough",
      follows: true,
    }));
  const card = await test.step("When I find Story A in Recently done", () =>
    openDoneStoryCard(page, "Story A"));
  const review = await test.step("And I open Review changes", () =>
    openIntentReviewChanges(page, card));
  await test.step("Then the review defaults to Published completion", async () => {
    expect(review.answer.kind).toBe("published");
    expect(review.answer.selectedRun).toBeUndefined();
    await review.comparison.expectChosen("Published completion");
  });
  await test.step("And the run list offers the newer execution before the refinement", () => {
    expect(review.answer.runs?.map((run) => run.key)).toEqual([
      story.reporting.reference,
      refinement.key,
    ]);
    expect(Date.parse(record.launchedAt)).toBeGreaterThan(
      Date.parse(refinement.record.launchedAt),
    );
  });
  await test.step("And the execution choice names its original range on origin/main", () => {
    expect(review.answer.runs?.[0]).toEqual({
      key: story.reporting.reference,
      workflow: "execution",
      launchedAt: record.launchedAt,
      remote: "origin",
      target: "main",
      comparison: { base: story.trunkTip, revision: accepted },
    });
  });
  await test.step("And the refinement choice names its own range on origin/main", () => {
    const { base, revision } = refinement.receipt;
    expect(review.answer.runs?.[1]).toEqual({
      key: refinement.key,
      workflow: "refinement",
      launchedAt: refinement.record.launchedAt,
      remote: "origin",
      target: "main",
      comparison: { base, revision },
    });
  });
  await test.step("And the landed run picker is available with no landing details shown yet", async () => {
    await review.landedRun.expectOffered();
    await review.landedRun.expectNotShown();
  });
  await test.step("When I choose the latest landed run", () =>
    review.landedRun.chooseLatest());
  await test.step("Then the picker selects the execution and labels both runs", async () => {
    await review.landedRun.expectChosen(story.reporting.reference, [
      `Execution — ${await browserLocaleString(page, record.launchedAt)} — ${accepted.slice(0, 8)}`,
      `Refinement — ${await browserLocaleString(page, refinement.record.launchedAt)} — ${refinement.receipt.revision.slice(0, 8)}`,
    ]);
  });
  await test.step("And the review shows the accepted landing revision", () =>
    review.landedRun.expectShown(accepted));
  await test.step("When I return to Development", () =>
    review.returnToDevelopment());
  await test.step("Then the execution still records the same landing", async () => {
    expect((await claimedRecord(dashboard)).landing).toEqual(record.landing);
  });
});
