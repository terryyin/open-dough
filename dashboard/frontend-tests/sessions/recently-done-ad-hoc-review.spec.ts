// Opening a standalone session's review keeps the board state on Close.
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  columnCountOf,
  standaloneSessionName,
} from "../../tests/dashboardParts.ts";
import {
  expectEntries,
  sessionReviewChanges,
} from "../../tests/recentlyDoneColumn.ts";
import { doneStories, storyA } from "../../tests/recentlyDoneReviewState.ts";
import { sidePanelPages } from "../../tests/sidePanelPages.ts";
import { reviewTargetName } from "../../src/storyReviewContract.ts";
import { landedReviewContextSchema } from "../../src/storyReviewLandedRun.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  frontendFileDiff,
  frontendReviewIds,
  installFrontendStoryReview,
} from "../../tests/support/frontendStoryReview.ts";
import { openFrontendBoardReview } from "../../tests/support/frontendRecentlyDoneBoardReview.ts";

test("a standalone ad hoc Done entry opens its review from Review changes", async ({
  page,
  frontendServices,
}) => {
  const now = Date.now();
  const landedTitle = "Open Dough session";
  const noLandingTitle = "Default session";
  const launchedAt = "2026-01-02T12:00:00.000Z";
  const { baseline: base, tree: revision } = frontendReviewIds;
  const deliveredPath = "delivered.txt";
  const landed = makeMe.aLaunchRecord
    .adHoc({ title: landedTitle })
    .inIsolatedWorkspace({
      workspace: "/tmp/retired-ad-hoc-review",
      branch: "ad-hoc/landed",
    })
    .withLanding(makeMe.aLaunchLanding.comparing({ base, revision }).please())
    .launchedAt(launchedAt)
    .markedDoneAt(new Date(now - 30 * 60_000).toISOString())
    .please();
  const noLanding = makeMe.aLaunchRecord
    .adHoc({ title: noLandingTitle })
    .launchedAt(new Date(now - 6 * 60_000).toISOString())
    .markedDoneAt(new Date(now - 5 * 60_000).toISOString())
    .please();
  const answers = await installFrontendStoryReview(page, {
    kind: "landed",
    baseline: base,
    tree: revision,
    files: [
      {
        kind: "modified",
        path: deliveredPath,
        lines: { added: 1, removed: 1 },
      },
    ],
    landing: landedReviewContextSchema.parse({
      ...landed.landing,
      workflow: "ad-hoc",
      launchedAt,
    }),
  });
  answers.answerFile(
    frontendFileDiff(deliveredPath, ["+after"]),
    deliveredPath,
  );

  const { recent } = await openFrontendBoardReview(page, frontendServices, {
    doneSessions: [landed, noLanding],
  });

  const landedName = standaloneSessionName("Ad hoc", landedTitle);
  const noLandingName = standaloneSessionName("Ad hoc", noLandingTitle);
  const count = columnCountOf(recent);
  const countWords = await count.textContent();
  // Newest first: recent no-landing session, then the three done cards, then
  // the older landed session (fixed launch time).
  const namesBefore = [
    noLandingName,
    ...doneStories.map(({ title }) => title),
    landedName,
  ];
  await expectEntries(recent, namesBefore);
  const action = sessionReviewChanges(recent, landedTitle);
  const journey = sidePanelPages(page);

  await expect(action).toBeVisible();
  await expect(sessionReviewChanges(recent, noLandingTitle)).toBeVisible();

  await journey.phase(
    "select a story before reviewing the session",
    (pages) => {
      pages.board.storyCard(storyA.title).clickEmptyArea().expectSelected();
    },
  );

  await action.click();
  await journey.phase(
    "the panel shows the session's landed review",
    (pages) => {
      pages.storyReview.expectStory(landedTitle);
      pages.storyReview.expectSession(landed.session.sessionId);
      pages.storyReview.expectLandedContext({
        launchedAt,
        remoteTarget: reviewTargetName({
          remote: "origin",
          target: "refs/heads/main",
        }),
        base,
        revision,
      });
      pages.storyReview.expectChangedFiles("1 changed file");
      pages.storyReview.expectChangedFile(
        "1 changed file",
        `Modified ${deliveredPath}`,
      );
      pages.storyReview.expectFileChosen(
        "1 changed file",
        `Modified ${deliveredPath}`,
      );
      pages.storyReview.expectFileDiff(`Modified ${deliveredPath}`, "after");
      pages.storyReview.expectNoComparisonSwitch();
      pages.storyReview.expectNoLineFollowUp();
      pages.storyReview.expectNoNoteActions();
    },
  );

  await journey.phase(
    "reviewing the session clears the selected story",
    (pages) => {
      pages.board.storyCard(storyA.title).expectNotSelected();
    },
  );

  await journey.phase(
    "Close returns to Review changes and keeps the column",
    (pages) => {
      pages.storyReview.close();
    },
  );
  await expect(action).toBeFocused();
  await expectEntries(recent, namesBefore);
  await expect(count).toHaveText(countWords ?? "");
});
