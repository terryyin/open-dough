// Each unavailable or empty comparison explains the gap independently.
import { test } from "../../test-support/support/frontendApp.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionReviewChanges } from "../../test-support/recentlyDoneColumn.ts";
import { sidePanelPages } from "../../test-support/sidePanelPages.ts";
import {
  frontendReviewIds,
  installFrontendStoryReview,
} from "../../test-support/support/frontendStoryReview.ts";
import { openFrontendBoardReview } from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";
import { landedReviewContextSchema } from "../../src/storyReviewLandedRun.ts";

test("an ad hoc review explains missing published provenance", async ({
  page,
  frontendServices,
}) => {
  const title = "Missing published provenance";
  const explanation = "No published comparison is available for this session.";
  const session = makeMe.aLaunchRecord.adHoc({ title }).markedDone().please();
  await installFrontendStoryReview(page, { kind: "unavailable", explanation });
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

test("an unavailable saved session landing keeps its landed description", async ({
  page,
  frontendServices,
}) => {
  const title = "Unreadable repository";
  const explanation =
    "The accepted comparison could not be confirmed on the configured origin.";
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
        "No changes: this published comparison is empty.",
      );
      pages.storyReview.expectNoChangedFiles(/changed file/);
    },
  );
});
