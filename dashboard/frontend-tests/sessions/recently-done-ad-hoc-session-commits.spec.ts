// A Default main session's kept commits open as its review, named as session
// commits; a session that made none says so.
import { expect, test } from "../../tests/support/frontendApp.ts";
import { columnCountOf } from "../../tests/dashboardParts.ts";
import { sessionReviewChanges } from "../../tests/recentlyDoneColumn.ts";
import { sidePanelPages } from "../../tests/sidePanelPages.ts";
import {
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
} from "../../src/storyReviewContract.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  frontendFileDiff,
  frontendReviewIds,
  frontendSessionCommitsReview,
  installFrontendStoryReview,
} from "../../tests/support/frontendStoryReview.ts";
import { openFrontendBoardReview } from "../../tests/support/frontendRecentlyDoneBoardReview.ts";

const launchedAt = "2026-01-02T12:00:00.000Z";
const { baseline: base, tree: revision } = frontendReviewIds;
const committedPath = "committed.txt";

const doneSession = (title: string) =>
  makeMe.aLaunchRecord
    .adHoc({ title })
    .launchedAt(launchedAt)
    .markedDoneAt(new Date(Date.now() - 5 * 60_000).toISOString());

for (const { checkout, shared } of [
  { checkout: "a checkout of its own", shared: false },
  { checkout: "a shared checkout", shared: true },
]) {
  test(`a Default main session's commits from ${checkout} open from Review changes`, async ({
    page,
    frontendServices,
  }) => {
    const title = "Default main session";
    const session = doneSession(title)
      .keptSessionCommits({
        repository: "/tmp/default-main/.git",
        runs: [{ base, revision }],
        ...(shared && { shared }),
      })
      .please();
    const answers = await installFrontendStoryReview(
      page,
      frontendSessionCommitsReview(session, [
        {
          kind: "modified",
          path: committedPath,
          lines: { added: 1, removed: 1 },
        },
      ]),
    );
    answers.answerFile(
      frontendFileDiff(committedPath, ["+after"]),
      committedPath,
    );
    const { recent } = await openFrontendBoardReview(page, frontendServices, {
      doneSessions: [session],
    });
    const count = columnCountOf(recent);
    const countWords = await count.textContent();
    const action = sessionReviewChanges(recent, title);
    const journey = sidePanelPages(page);

    await action.click();
    await journey.phase("the panel shows the session's commits", (pages) => {
      pages.reviewToolbar.expectName("Session commits");
      pages.reviewToolbar.expectFilesToggle(true);
      pages.reviewToolbar.expectDetailsCollapsed();
      pages.storyReview.expectStory(title);
      pages.storyReview.expectSession(session.session.sessionId);
      pages.storyReview.expectSessionCommitsContext({
        launchedAt,
        doneAt: session.doneAt ?? "",
        base,
        revision,
      });
      pages.storyReview.expectSharedCheckoutNote(shared);
      pages.storyReview.expectChangedFiles("1 changed file");
      pages.storyReview.expectFileChosen(
        "1 changed file",
        `Modified ${committedPath}`,
      );
      pages.storyReview.expectFileDiff(`Modified ${committedPath}`, "after");
      pages.storyReview.expectNoComparisonSwitch();
      pages.storyReview.expectNoLineFollowUp();
      pages.storyReview.expectNoNoteActions();
    });
    // The file reads name the session and the run's pair, and no reference.
    for (const endpoint of [
      storyReviewFileEndpoint,
      storyReviewFileTextEndpoint,
    ])
      await expect
        .poll(() => answers.queriesAsked(endpoint)[0])
        .toEqual({
          source: expect.any(String),
          host: session.session.host,
          session: session.session.sessionId,
          baseline: base,
          tree: revision,
          path: committedPath,
        });

    await journey.phase("Close returns to Review changes", (pages) => {
      pages.storyReview.close();
    });
    await expect(action).toBeFocused();
    await expect(count).toHaveText(countWords ?? "");
  });
}

test("a session that made no commits says so as its review's explanation", async ({
  page,
  frontendServices,
}) => {
  const title = "Blank session";
  const explanation =
    "This session made no commits in the Default main checkout.";
  const session = doneSession(title)
    .keptSessionCommits({ repository: "/tmp/default-main/.git", runs: [] })
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
    "the panel says the session made no commits",
    (pages) => {
      pages.storyReview.expectStory(title);
      pages.storyReview.expectFeedback(explanation);
      pages.storyReview.expectNoChangedFiles(/changed file/);
    },
  );
});
