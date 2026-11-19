// Session commits, a selected landed evidence gap and a bare explanation each
// name the toolbar only when the review on screen supplies a comparison.
import { sessionReviewChanges } from "../../test-support/recentlyDoneColumn.ts";
import { sidePanelPages } from "../../test-support/sidePanelPages.ts";
import { test } from "../../test-support/support/frontendApp.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
  frontendSessionCommitsReview,
  installFrontendStoryReview,
} from "../../test-support/support/frontendStoryReview.ts";
import { openFrontendBoardReview } from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";
import type { FrontendServiceState } from "../../test-support/support/frontendServiceState.ts";
import { assumeReviewChanges } from "../../test-support/reviewChangesPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { Page } from "@playwright/test";

const launchedAt = "2026-01-02T12:00:00.000Z";
const { baseline: base, tree: revision } = frontendReviewIds;
const commitsTitle = "Default main session";
const gapTitle = "Selected gap";
const bareTitle = "Bare gap";
const gapKey = "gap-run-1";

async function openTruthfulGapsBoard(
  page: Page,
  frontendServices: FrontendServiceState,
) {
  const commitsSession = makeMe.aLaunchRecord
    .adHoc({ title: commitsTitle })
    .launchedAt(launchedAt)
    .markedDone()
    .keptSessionCommits({
      repository: "/tmp/toolbar-truthful-commits/.git",
      runs: [{ base, revision }],
    })
    .please();
  const gapSession = makeMe.aLaunchRecord
    .adHoc({ title: gapTitle })
    .markedDone()
    .please();
  const bareSession = makeMe.aLaunchRecord
    .adHoc({ title: bareTitle })
    .markedDone()
    .please();
  const answers = await installFrontendStoryReview(
    page,
    frontendSessionCommitsReview(commitsSession, [
      {
        kind: "modified",
        path: "committed.txt",
        lines: { added: 1, removed: 0 },
      },
    ]),
  );
  answers.answerFile(
    frontendFileDiff("committed.txt", ["+commit"]),
    "committed.txt",
  );
  const { recent } = await openFrontendBoardReview(page, frontendServices, {
    doneSessions: [commitsSession, gapSession, bareSession],
  });
  return { answers, recent, journey: sidePanelPages(page) };
}

test("session commits name the toolbar Session commits", async ({
  page,
  frontendServices,
}) => {
  const { recent, journey } = await openTruthfulGapsBoard(
    page,
    frontendServices,
  );
  await sessionReviewChanges(recent, commitsTitle).click();
  await journey.phase("session commits name the toolbar", (pages) => {
    pages.reviewToolbar.expectName("Session commits");
    pages.reviewToolbar.expectDetailsCollapsed();
    pages.reviewToolbar.expectFilesToggle(true);
  });
  const review = await assumeReviewChanges(page);
  await review.diffs.expectShows("Modified committed.txt", "+commit");
});

test("a selected landed gap offers Landed runs and the eye", async ({
  page,
  frontendServices,
}) => {
  const { answers, recent, journey } = await openTruthfulGapsBoard(
    page,
    frontendServices,
  );
  answers.answerNextSnapshot({
    kind: "landing-unavailable",
    explanation: "Accepted publication has a recoverable review evidence gap.",
    runs: [
      {
        key: gapKey,
        workflow: "ad-hoc",
        launchedAt,
        remote: "origin",
        target: "refs/heads/main",
      },
    ],
    selectedRun: gapKey,
  });
  await sessionReviewChanges(recent, gapTitle).click();
  await journey.phase(
    "selected landed gap offers Landed runs and the eye",
    (pages) => {
      pages.storyReview.expectFeedback(
        "Accepted publication has a recoverable review evidence gap.",
      );
      pages.reviewToolbar.expectName("Landed runs");
      pages.reviewToolbar.expectDetailsCollapsed();
      pages.reviewToolbar.expectFilesToggle(false);
    },
  );
  const review = await assumeReviewChanges(page);
  await review.details.reveal();
  await review.landedRun.expectChosen(gapKey);
});

test("a bare landing gap names Landed runs without an eye", async ({
  page,
  frontendServices,
}) => {
  const { answers, recent, journey } = await openTruthfulGapsBoard(
    page,
    frontendServices,
  );
  answers.answerNextSnapshot({
    kind: "landing-unavailable",
    explanation: "This session's changes were not captured.",
  });
  await sessionReviewChanges(recent, bareTitle).click();
  await journey.phase(
    "bare landing gap names Landed runs without an eye",
    (pages) => {
      pages.storyReview.expectFeedback(
        "This session's changes were not captured.",
      );
      pages.reviewToolbar.expectName("Landed runs");
      pages.reviewToolbar.expectNoDetails();
    },
  );
});
