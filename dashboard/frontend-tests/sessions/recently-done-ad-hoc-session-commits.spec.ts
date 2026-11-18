// A Default main session's review describes its kept commits, including when
// no comparison can be shown.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { columnCountOf } from "../../test-support/dashboardParts.ts";
import { sessionReviewChanges } from "../../test-support/recentlyDoneColumn.ts";
import { sidePanelPages } from "../../test-support/sidePanelPages.ts";
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
} from "../../test-support/support/frontendStoryReview.ts";
import { openFrontendBoardReview } from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";

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

test("an unavailable Default main review describes the session's kept commits", async ({
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
    comparison: "session-commits",
    explanation,
  });
  const { recent } = await openFrontendBoardReview(page, frontendServices, {
    doneSessions: [session],
  });

  await sessionReviewChanges(recent, title).click();

  await sidePanelPages(page).phase(
    "the panel describes the session's kept commits",
    (pages) => {
      pages.storyReview.expectDescription(
        "Read-only: this session's kept commits.",
      );
      pages.reviewToolbar.expectName("Session commits");
    },
  );
});
