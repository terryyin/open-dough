// The toolbar names only a comparison the review can show, and offers the eye
// only when details hold something — including while a held Refresh keeps a
// prior answer, and not before the first answer or after a cleared failure.
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { reviewChanges } from "../../tests/storyCardControls.ts";
import { sessionReviewChanges } from "../../tests/recentlyDoneColumn.ts";
import { doneCard } from "../../tests/doneStoryReviewPage.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  frontendFileDiff,
  frontendPublishedReview,
  frontendReviewIds,
  frontendReviewSnapshot,
  installFrontendStoryReview,
} from "../../tests/support/frontendStoryReview.ts";
import {
  openFrontendBoardReview,
  storyA,
} from "../../tests/support/frontendRecentlyDoneBoardReview.ts";
import { openFrontendStoryReviewAsOpened } from "../../tests/support/frontendStoryReviewOpen.ts";
import { reviewFeedback } from "../../tests/support/reviewContextLine.ts";
import {
  filesToggle,
  reviewRefresh,
  reviewRegion,
  toolbarComparison,
} from "../../tests/support/reviewControls.ts";
import {
  expectDetailsCollapsed,
  expectEyeBesideComparison,
  expectNoToolbarComparisonOrDetails,
} from "../../tests/support/reviewDetails.ts";
import { fileDiff } from "../../tests/support/reviewTreeRows.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { landedReviewContextSchema } from "../../src/storyReviewLandedRun.ts";
import { fulfillJson } from "../../tests/support/frontendSubstituteAnswers.ts";

const added = (path: string) => ({
  kind: "added" as const,
  path,
  lines: { added: 1, removed: 0 },
});

test("a Done card holds progress with no name or eye until a published answer arrives", async ({
  page,
  frontendServices,
}) => {
  const published = frontendPublishedReview([added("done.txt")]);
  const answers = await installFrontendStoryReview(page, published);
  answers.answerFile(frontendFileDiff("done.txt", ["+done"]));
  const held = answers.holdNextSnapshot();
  await openFrontendBoardReview(page, frontendServices);
  await reviewChanges(doneCard(page, storyA.title)).click();
  const review = reviewRegion(page);
  await held.received;
  await expect(reviewFeedback(review)).toContainText(
    "Reading the story's changes…",
  );
  await expectNoToolbarComparisonOrDetails(review);
  held.release();
  await held.delivered;
  await expect(toolbarComparison(review)).toHaveText("Published completion");
  await expectEyeBesideComparison(review, "Show review details");
  await expect(fileDiff(review, "Added done.txt")).toContainText("+done");
});

test("an ad hoc landing holds the same pending toolbar, then names Landed runs", async ({
  page,
  frontendServices,
}) => {
  const title = "Open Dough session";
  const launchedAt = "2026-01-02T12:00:00.000Z";
  const { baseline: base, tree: revision } = frontendReviewIds;
  const path = "delivered.txt";
  const session = makeMe.aLaunchRecord
    .adHoc({ title })
    .inIsolatedWorkspace({
      workspace: "/tmp/toolbar-truthful-ad-hoc",
      branch: "ad-hoc/landed",
    })
    .withLanding(makeMe.aLaunchLanding.comparing({ base, revision }).please())
    .launchedAt(launchedAt)
    .markedDone()
    .please();
  const answers = await installFrontendStoryReview(page, {
    kind: "landed",
    baseline: base,
    tree: revision,
    files: [
      {
        kind: "modified",
        path,
        lines: { added: 1, removed: 1 },
      },
    ],
    landing: landedReviewContextSchema.parse({
      ...session.landing,
      workflow: "ad-hoc",
      launchedAt,
    }),
  });
  answers.answerFile(frontendFileDiff(path, ["+after"]), path);
  const held = answers.holdNextSnapshot();
  const { recent } = await openFrontendBoardReview(page, frontendServices, {
    doneSessions: [session],
  });
  await sessionReviewChanges(recent, title).click();
  const review = reviewRegion(page);
  await held.received;
  await expect(reviewFeedback(review)).toContainText(
    "Reading the story's changes…",
  );
  await expectNoToolbarComparisonOrDetails(review);
  held.release();
  await held.delivered;
  await expect(toolbarComparison(review)).toHaveText("Landed runs");
  await expectDetailsCollapsed(review);
  await expect(fileDiff(review, `Modified ${path}`)).toContainText("after");
});

test("a refused first read keeps the problem and Refresh; retry reveals the answer", async ({
  page,
  frontendServices,
}) => {
  const published = frontendPublishedReview([added("retry.txt")]);
  const answers = await installFrontendStoryReview(page, published);
  answers.answerFile(frontendFileDiff("retry.txt", ["+retry"]));
  let refuse = true;
  await page.route(
    (url) => url.pathname === storyReviewEndpoint,
    async (route) => {
      if (!refuse) {
        await route.fallback();
        return;
      }
      refuse = false;
      await fulfillJson(route, { error: "refused for proof" }, 500);
    },
  );
  await openFrontendBoardReview(page, frontendServices);
  await reviewChanges(doneCard(page, storyA.title)).click();
  const review = reviewRegion(page);
  await expect(reviewFeedback(review)).toContainText(
    "The review could not be read:",
  );
  await expectNoToolbarComparisonOrDetails(review);
  await expect(reviewRefresh(review, { exact: true })).toBeVisible();
  await reviewRefresh(review, { exact: true }).click();
  await expect(toolbarComparison(review)).toHaveText("Published completion");
  await expectEyeBesideComparison(review, "Show review details");
  await expect(fileDiff(review, "Added retry.txt")).toContainText("+retry");
});

test("Refresh of a readable comparison keeps its name, eye and diff while progress shows", async ({
  page,
  frontendServices,
}) => {
  const { review, answers } = await openFrontendStoryReviewAsOpened(
    page,
    frontendServices,
    frontendReviewSnapshot({ files: [added("keep.txt")] }),
    (initial) => {
      initial.answerFile(frontendFileDiff("keep.txt", ["+keep"]));
    },
  );
  await expect(toolbarComparison(review)).toHaveText("All changes");
  await expectDetailsCollapsed(review);
  await expect(fileDiff(review, "Added keep.txt")).toContainText("+keep");
  const held = answers.holdNextSnapshot();
  try {
    await reviewRefresh(review, { exact: true }).click();
    await held.received;
    await expect(reviewFeedback(review)).toContainText(
      "Refreshing the review…",
    );
    await expect(toolbarComparison(review)).toHaveText("All changes");
    await expectDetailsCollapsed(review);
    await expect(fileDiff(review, "Added keep.txt")).toContainText("+keep");
  } finally {
    held.release();
  }
  await expect(reviewFeedback(review)).toContainText("Review refreshed");
  await page.route(
    (url) => url.pathname === storyReviewEndpoint,
    (route) => fulfillJson(route, { error: "unreadable" }, 500),
  );
  await reviewRefresh(review, { exact: true }).click();
  await expect(reviewFeedback(review)).toContainText(
    "The review could not be read:",
  );
  await expectNoToolbarComparisonOrDetails(review);
  await expect(reviewRefresh(review, { exact: true })).toBeVisible();
});

test("the files toggle stays independent of whether details are offered", async ({
  page,
  frontendServices,
}) => {
  const { review } = await openFrontendStoryReviewAsOpened(
    page,
    frontendServices,
    frontendReviewSnapshot({ files: [added("toggle.txt")] }),
    (initial) => {
      initial.answerFile(frontendFileDiff("toggle.txt", ["+toggle"]));
    },
  );
  await expect(filesToggle(review)).toBeVisible();
  await expectDetailsCollapsed(review);
  await filesToggle(review).click();
  await expect(filesToggle(review, "Show files")).toBeVisible();
  await expectDetailsCollapsed(review);
  await filesToggle(review, "Show files").click();
  await expect(filesToggle(review)).toBeVisible();
});
