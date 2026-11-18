// Each unavailable or empty comparison explains the gap independently.
import { test } from "../../test-support/support/frontendApp.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { sessionReviewChanges } from "../../test-support/recentlyDoneColumn.ts";
import { sidePanelPages } from "../../test-support/sidePanelPages.ts";
import {
  frontendReviewIds,
  installFrontendStoryReview,
} from "../../test-support/support/frontendStoryReview.ts";
import { openFrontendBoardReview } from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";
import { landedReviewContextSchema } from "../../src/storyReviewLandedRun.ts";

for (const { title, answer, explanation } of [
  {
    title: "Not captured",
    answer: {
      kind: "landing-unavailable",
      comparison: "session-commits",
      explanation: "This session's changes were not captured.",
    },
    explanation: "This session's changes were not captured.",
  },
  {
    title: "No commits",
    answer: {
      kind: "landing-unavailable",
      comparison: "session-commits",
      explanation: "This session made no commits in the Default main checkout.",
    },
    explanation: "This session made no commits in the Default main checkout.",
  },
] satisfies { title: string; answer: StoryReview; explanation: string }[]) {
  test(`an ad hoc review explains ${title.toLowerCase()}`, async ({
    page,
    frontendServices,
  }) => {
    const session = makeMe.aLaunchRecord.adHoc({ title }).markedDone().please();
    await installFrontendStoryReview(page, answer);
    const { recent } = await openFrontendBoardReview(page, frontendServices, {
      doneSessions: [session],
    });

    await sessionReviewChanges(recent, title).click();

    await sidePanelPages(page).phase(
      "the panel explains the missing comparison",
      (pages) => {
        pages.storyReview.expectStory(title);
        pages.storyReview.expectFeedback(explanation);
        pages.storyReview.expectNoChangedFiles(/changed file/);
      },
    );
  });
}

test("an unavailable saved session landing keeps its landed description", async ({
  page,
  frontendServices,
}) => {
  const title = "Unreadable repository";
  const explanation =
    "The captured landing repository is missing or unreadable.";
  const { baseline: base, tree: revision } = frontendReviewIds;
  const session = makeMe.aLaunchRecord
    .adHoc({ title })
    .inIsolatedWorkspace({
      workspace: "/tmp/retired-ad-hoc-review",
      branch: "ad-hoc/landed",
    })
    .withLanding(makeMe.aLaunchLanding.comparing({ base, revision }).please())
    .markedDone()
    .please();
  await installFrontendStoryReview(page, {
    kind: "landing-unavailable",
    explanation,
  });
  const { recent } = await openFrontendBoardReview(page, frontendServices, {
    doneSessions: [session],
  });

  await sessionReviewChanges(recent, title).click();

  await sidePanelPages(page).phase(
    "the panel describes the saved landing",
    (pages) => {
      pages.storyReview.expectDescription(
        "Read-only: this landed run's fixed delivered change from its captured base to its accepted revision.",
      );
      pages.reviewToolbar.expectName("Landed runs");
      pages.storyReview.expectFeedback(explanation);
      pages.storyReview.expectNoChangedFiles(/changed file/);
    },
  );
});

test("an ad hoc review explains an empty comparison", async ({
  page,
  frontendServices,
}) => {
  const title = "Empty comparison";
  const session = makeMe.aLaunchRecord.adHoc({ title }).markedDone().please();
  const { baseline, tree } = frontendReviewIds;
  await installFrontendStoryReview(page, {
    kind: "landed",
    baseline,
    tree,
    files: [],
    landing: landedReviewContextSchema.parse({
      ...makeMe.aLaunchLanding
        .comparing({ base: baseline, revision: tree })
        .please(),
      workflow: "ad-hoc",
      launchedAt: "2026-01-02T12:00:00.000Z",
    }),
  });
  const { recent } = await openFrontendBoardReview(page, frontendServices, {
    doneSessions: [session],
  });

  await sessionReviewChanges(recent, title).click();

  await sidePanelPages(page).phase(
    "the panel explains the empty comparison",
    (pages) => {
      pages.storyReview.expectStory(title);
      pages.storyReview.expectBodyText(
        "No changes: this session's delivered comparison is empty.",
      );
      pages.storyReview.expectNoChangedFiles(/changed file/);
    },
  );
});
