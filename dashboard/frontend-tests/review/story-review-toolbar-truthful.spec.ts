// The toolbar names only a comparison the review can show, and offers the eye
// only when details hold something — including while a held Refresh keeps a
// prior answer, and not before the first answer or after a cleared failure.
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { reviewChanges } from "../../test-support/storyCardControls.ts";
import { sessionReviewChanges } from "../../test-support/recentlyDoneColumn.ts";
import { doneCard } from "../../test-support/doneStoryReviewPage.ts";
import { test } from "../../test-support/support/frontendApp.ts";
import {
  frontendFileDiff,
  frontendPublishedReview,
  frontendReviewIds,
  frontendReviewSnapshot,
  installFrontendStoryReview,
} from "../../test-support/support/frontendStoryReview.ts";
import {
  openFrontendBoardReview,
  storyA,
} from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";
import { openFrontendStoryReviewAsOpened } from "../../test-support/support/frontendStoryReviewOpen.ts";
import {
  openReviewChangesFrom,
  type ReviewChanges,
} from "../../test-support/reviewChangesPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { landedReviewContextSchema } from "../../src/storyReviewLandedRun.ts";
import { fulfillJson } from "../../test-support/support/frontendSubstituteAnswers.ts";

const added = (path: string) => ({
  kind: "added" as const,
  path,
  lines: { added: 1, removed: 0 },
});

// The first read is on its way: progress, with no comparison name or eye.
async function expectPending(review: ReviewChanges) {
  await review.status.expectFeedbackSays("Reading the story's changes…");
  await review.expectNoComparisonNameOrDetails();
}

// A refused read keeps the problem and Refresh, with no name or eye.
async function expectRefused(review: ReviewChanges) {
  await review.status.expectFeedbackSays("The review could not be read:");
  await review.expectNoComparisonNameOrDetails();
  await review.status.expectRefreshAndCloseOffered();
}

test("a Done card holds progress with no name or eye until a published answer arrives", async ({
  page,
  frontendServices,
}) => {
  const published = frontendPublishedReview([added("done.txt")]);
  const answers = await installFrontendStoryReview(page, published);
  answers.answerFile(frontendFileDiff("done.txt", ["+done"]));
  const held = answers.holdNextSnapshot();
  await openFrontendBoardReview(page, frontendServices);
  const review = await openReviewChangesFrom(
    page,
    reviewChanges(doneCard(page, storyA.title)),
  );
  await held.received;
  await expectPending(review);
  held.release();
  await held.delivered;
  await review.expectComparisonNamed("Published completion");
  await review.details.expectEyeBesideComparison("Show review details");
  await review.diffs.expectShows("Added done.txt", "+done");
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
  const review = await openReviewChangesFrom(
    page,
    sessionReviewChanges(recent, title),
  );
  await held.received;
  await expectPending(review);
  held.release();
  await held.delivered;
  await review.expectComparisonNamed("Landed runs");
  await review.details.expectCollapsed();
  await review.diffs.expectShows(`Modified ${path}`, "after");
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
  const review = await openReviewChangesFrom(
    page,
    reviewChanges(doneCard(page, storyA.title)),
  );
  await expectRefused(review);
  await review.status.refresh();
  await review.expectComparisonNamed("Published completion");
  await review.details.expectEyeBesideComparison("Show review details");
  await review.diffs.expectShows("Added retry.txt", "+retry");
});

test("Refresh of a readable comparison keeps its name, eye and diff while progress shows", async ({
  page,
  frontendServices,
}) => {
  const { reviewChanges: review, answers } =
    await openFrontendStoryReviewAsOpened(
      page,
      frontendServices,
      frontendReviewSnapshot({ files: [added("keep.txt")] }),
      (initial) => {
        initial.answerFile(frontendFileDiff("keep.txt", ["+keep"]));
      },
    );
  await review.expectComparisonNamed("All changes");
  await review.details.expectCollapsed();
  await review.diffs.expectShows("Added keep.txt", "+keep");
  const held = answers.holdNextSnapshot();
  try {
    await review.status.refresh();
    await held.received;
    await review.status.expectFeedbackSays("Refreshing the review…");
    await review.expectComparisonNamed("All changes");
    await review.details.expectCollapsed();
    await review.diffs.expectShows("Added keep.txt", "+keep");
  } finally {
    held.release();
  }
  await review.status.expectFeedbackSays("Review refreshed");
  await page.route(
    (url) => url.pathname === storyReviewEndpoint,
    (route) => fulfillJson(route, { error: "unreadable" }, 500),
  );
  await review.status.refresh();
  await expectRefused(review);
});

test("the files toggle stays independent of whether details are offered", async ({
  page,
  frontendServices,
}) => {
  const { reviewChanges: review } = await openFrontendStoryReviewAsOpened(
    page,
    frontendServices,
    frontendReviewSnapshot({ files: [added("toggle.txt")] }),
    (initial) => {
      initial.answerFile(frontendFileDiff("toggle.txt", ["+toggle"]));
    },
  );
  await review.expectFilesToggleNamed("Hide files");
  await review.details.expectCollapsed();
  await review.hideFiles();
  await review.expectFilesToggleNamed("Show files");
  await review.details.expectCollapsed();
  await review.showFiles();
  await review.expectFilesToggleNamed("Hide files");
});
