// A standalone ad hoc Done entry in Recently done offers Review changes and
// opens its retained landing in the side panel: session label as title, landed
// context, file browser and first file's diff; no Comparison switch, Mark
// reviewed or line Follow up; selected story cleared; Close returns the
// keyboard to the action and keeps Recently done's range and counts. An entry
// without a landing offers the action too. Absent, unreadable and empty
// answers explain the gap with no file browser or diff. Linked ad hoc rows
// keep revealing their story in recently-done-sessions-select-ad-hoc-check.spec.ts.

import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  columnCountOf,
  standaloneSessionName,
} from "../../tests/dashboardParts.ts";
import { expectEntries } from "../../tests/recentlyDoneColumn.ts";
import {
  doneCard,
  doneStories,
  storyA,
} from "../../tests/recentlyDoneReviewState.ts";
import { reviewChanges } from "../../tests/storyCardControls.ts";
import { emptyArea, expectSelected } from "../../tests/storyCardSelection.ts";
import { sidePanelPages } from "../../tests/sidePanelPages.ts";
import { sessionListing } from "../../src/sessionListing.ts";
import { reviewTargetName } from "../../src/storyReviewContract.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  frontendFileDiff,
  installFrontendStoryReview,
} from "../../tests/support/frontendStoryReview.ts";
import { openFrontendBoardReview } from "../../tests/support/frontendRecentlyDoneBoardReview.ts";
import {
  base,
  deliveredPath,
  doneAdHoc,
  emptyComparison,
  emptySession,
  emptyTitle,
  landedAnswer,
  landedSession,
  landedTitle,
  launchedAt,
  noLandingSession,
  noLandingTitle,
  notCaptured,
  revision,
  unavailableAnswer,
  unreadableRepo,
  unreadableSession,
  unreadableTitle,
} from "../../tests/support/frontendRecentlyDoneAdHocReview.ts";

test("a standalone ad hoc Done entry opens its review from Review changes", async ({
  page,
  frontendServices,
}) => {
  const now = Date.now();
  const landed = makeMe.aLaunchRecord
    .adHoc({ title: landedTitle, instruction: "Landed." })
    .inIsolatedWorkspace({
      workspace: "/tmp/retired-ad-hoc-review",
      branch: "ad-hoc/landed",
    })
    .inClaudeSession({ sessionId: landedSession, shortId: "landed01" })
    .withLanding(makeMe.aLaunchLanding.comparing({ base, revision }).please())
    .launchedAt(launchedAt)
    .markedDoneAt(new Date(now - 30 * 60_000).toISOString())
    .please();
  const noLanding = doneAdHoc(
    noLandingTitle,
    noLandingSession,
    "noland01",
    5 * 60_000,
  );
  const machine = makeMe.aMachineAnswer
    .observingDone(landed, noLanding)
    .please();
  const listings = machine.records.map(sessionListing);
  frontendServices.answerMachine({ ...machine, records: listings });
  expect(listings.every((each) => each.landing === undefined)).toBe(true);
  expect(listings.every((each) => each.request.reporting === undefined)).toBe(
    true,
  );

  const answers = await installFrontendStoryReview(page, landedAnswer());
  answers.answerFile(
    frontendFileDiff(deliveredPath, ["+after"]),
    deliveredPath,
  );

  const { recent } = await openFrontendBoardReview(page, frontendServices);

  const landedName = standaloneSessionName("Ad hoc", landedTitle);
  const noLandingName = standaloneSessionName("Ad hoc", noLandingTitle);
  const landedEntry = recent.getByRole("article", {
    name: landedName,
    exact: true,
  });
  const noLandingEntry = recent.getByRole("article", {
    name: noLandingName,
    exact: true,
  });
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
  const story = doneCard(page, storyA.title);
  const action = reviewChanges(landedEntry);

  await expect(action).toBeVisible();
  await expect(reviewChanges(noLandingEntry)).toBeVisible();

  await emptyArea(story).click();
  await expectSelected(story, true);

  await action.click();
  const journey = sidePanelPages(page);
  await journey.phase(
    "the panel shows the session's landed review",
    (pages) => {
      pages.storyReview.expectStory(landedTitle);
      pages.storyReview.expectSession(landedSession);
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
      pages.storyReview.expectNoMarkReviewed();
      pages.storyReview.expectNoLineFollowUp();
      pages.storyReview.expectNoNoteActions();
    },
  );

  await expectSelected(story, false);

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

test("an ad hoc review without a comparison explains the absence", async ({
  page,
  frontendServices,
}) => {
  const landing = makeMe.aLaunchLanding.comparing({ base, revision }).please();
  const noLanding = doneAdHoc(
    noLandingTitle,
    noLandingSession,
    "noland02",
    5 * 60_000,
  );
  const empty = doneAdHoc(
    emptyTitle,
    emptySession,
    "empty01",
    10 * 60_000,
    landing,
  );
  const unreadable = doneAdHoc(
    unreadableTitle,
    unreadableSession,
    "unread01",
    15 * 60_000,
    landing,
  );
  const machine = makeMe.aMachineAnswer
    .observingDone(noLanding, empty, unreadable)
    .please();
  frontendServices.answerMachine({
    ...machine,
    records: machine.records.map(sessionListing),
  });

  const answers = await installFrontendStoryReview(
    page,
    unavailableAnswer(notCaptured),
  );
  const { recent } = await openFrontendBoardReview(page, frontendServices);
  const journey = sidePanelPages(page);
  const noLandingName = standaloneSessionName("Ad hoc", noLandingTitle);
  const emptyName = standaloneSessionName("Ad hoc", emptyTitle);
  const unreadableName = standaloneSessionName("Ad hoc", unreadableTitle);

  await reviewChanges(
    recent.getByRole("article", { name: noLandingName, exact: true }),
  ).click();
  await journey.phase("not captured: explanation, no files", (pages) => {
    pages.storyReview.expectStory(noLandingTitle);
    pages.storyReview.expectFeedback(notCaptured);
    pages.storyReview.expectNoChangedFiles(/changed file/);
  });
  await journey.phase("close not-captured", (pages) => {
    pages.storyReview.close();
  });

  answers.answerSnapshot(unavailableAnswer(unreadableRepo));
  await reviewChanges(
    recent.getByRole("article", { name: unreadableName, exact: true }),
  ).click();
  await journey.phase("unreadable: explanation, no files", (pages) => {
    pages.storyReview.expectStory(unreadableTitle);
    pages.storyReview.expectFeedback(unreadableRepo);
    pages.storyReview.expectNoChangedFiles(/changed file/);
  });
  await journey.phase("close unreadable", (pages) => {
    pages.storyReview.close();
  });

  answers.answerSnapshot(landedAnswer([]));
  await reviewChanges(
    recent.getByRole("article", { name: emptyName, exact: true }),
  ).click();
  await journey.phase("empty: session empty comparison, no files", (pages) => {
    pages.storyReview.expectStory(emptyTitle);
    pages.storyReview.expectBodyText(emptyComparison);
    pages.storyReview.expectNoChangedFiles(/changed file/);
  });
});
