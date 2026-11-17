// Each unavailable or empty comparison explains the gap independently.
import { test } from "../../tests/support/frontendApp.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionListing } from "../../src/sessionListing.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { sessionReviewChanges } from "../../tests/recentlyDoneColumn.ts";
import { sidePanelPages } from "../../tests/sidePanelPages.ts";
import {
  frontendReviewIds,
  installFrontendStoryReview,
} from "../../tests/support/frontendStoryReview.ts";
import { openFrontendBoardReview } from "../../tests/support/frontendRecentlyDoneBoardReview.ts";
import { landedReviewContextSchema } from "../../src/storyReviewLandedRun.ts";

for (const { title, answer, explanation } of [
  {
    title: "Not captured",
    answer: {
      kind: "landing-unavailable",
      explanation: "This session's changes were not captured.",
    },
    explanation: "This session's changes were not captured.",
  },
  {
    title: "Unreadable repository",
    answer: {
      kind: "landing-unavailable",
      explanation: "The captured landing repository is missing or unreadable.",
    },
    explanation: "The captured landing repository is missing or unreadable.",
  },
] satisfies { title: string; answer: StoryReview; explanation: string }[]) {
  test(`an ad hoc review explains ${title.toLowerCase()}`, async ({
    page,
    frontendServices,
  }) => {
    const session = makeMe.aLaunchRecord.adHoc({ title }).markedDone().please();
    const machine = makeMe.aMachineAnswer.observingDone(session).please();
    frontendServices.answerMachine({
      ...machine,
      records: machine.records.map(sessionListing),
    });
    await installFrontendStoryReview(page, answer);
    const { recent } = await openFrontendBoardReview(page, frontendServices);

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

test("an ad hoc review explains an empty comparison", async ({
  page,
  frontendServices,
}) => {
  const title = "Empty comparison";
  const session = makeMe.aLaunchRecord.adHoc({ title }).markedDone().please();
  const machine = makeMe.aMachineAnswer.observingDone(session).please();
  frontendServices.answerMachine({
    ...machine,
    records: machine.records.map(sessionListing),
  });
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
  const { recent } = await openFrontendBoardReview(page, frontendServices);

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
