// A Default main session's kept runs of commits are the review's Comparison
// switch, oldest first; a run whose commits leave no difference says so.
import { expect, test } from "../../tests/support/frontendApp.ts";
import { sessionReviewChanges } from "../../tests/recentlyDoneColumn.ts";
import {
  sidePanelPages,
  type SidePanelPages,
} from "../../tests/sidePanelPages.ts";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { browserLocaleString } from "../../tests/browserLocale.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  frontendFileDiff,
  frontendReviewIds,
  frontendSessionCommitsReview,
  installFrontendStoryReview,
} from "../../tests/support/frontendStoryReview.ts";
import { openFrontendBoardReview } from "../../tests/support/frontendRecentlyDoneBoardReview.ts";

const launchedAt = "2026-01-02T12:00:00.000Z";
const ids = frontendReviewIds;
const first = { base: ids.baseline, revision: ids.tree };
const second = { base: ids.head, revision: ids.commit };
const modified = (path: string) => ({
  kind: "modified" as const,
  path,
  lines: { added: 1, removed: 1 },
});

const doneSession = (title: string, runs: (typeof first)[]) =>
  makeMe.aLaunchRecord
    .adHoc({ title })
    .launchedAt(launchedAt)
    .markedDoneAt(new Date(Date.now() - 5 * 60_000).toISOString())
    .keptSessionCommits({ repository: "/tmp/default-main/.git", runs })
    .please();

test("a session's two runs are switched between, oldest first", async ({
  page,
  frontendServices,
}) => {
  const title = "Interrupted session";
  const session = doneSession(title, [first, second]);
  // Both runs end in a commit of one subject, at different times.
  const facts = [
    { commits: 1, subject: "Tidy", committedAt: "2026-01-02T12:10:00.000Z" },
    { commits: 2, subject: "Tidy", committedAt: "2026-01-02T12:40:00.000Z" },
  ];
  const [firstAt, secondAt] = await Promise.all(
    facts.map(({ committedAt }) => browserLocaleString(page, committedAt)),
  );
  const labels = [
    `1 commit — Tidy — ${firstAt}`,
    `2 commits — Tidy — ${secondAt}`,
  ];
  const [firstLabel = "", secondLabel = ""] = labels;
  const firstRun = frontendSessionCommitsReview(
    session,
    [modified("first.txt")],
    0,
    facts,
  );
  const answers = await installFrontendStoryReview(page, firstRun);
  answers.answerRunSnapshot(
    1,
    frontendSessionCommitsReview(
      session,
      [modified("second.txt"), modified("third.txt")],
      1,
      facts,
    ),
  );
  answers.answerFile(frontendFileDiff("first.txt", ["+one"]), "first.txt");
  answers.answerFile(frontendFileDiff("second.txt", ["+two"]), "second.txt");
  const { recent } = await openFrontendBoardReview(page, frontendServices, {
    doneSessions: [session],
  });
  const journey = sidePanelPages(page);
  const context = { launchedAt, doneAt: session.doneAt ?? "" };

  await sessionReviewChanges(recent, title).click();
  await journey.phase("the review opens on the oldest run", (pages) => {
    pages.sessionRuns.expectRuns(labels);
    pages.sessionRuns.expectShown(firstLabel);
    pages.storyReview.expectDescription(
      "Read-only: this session's fixed commits made in the Default main checkout while the session was open, from the revision before them to their last commit.",
    );
    pages.storyReview.expectSessionCommitsContext({ ...context, ...first });
    pages.storyReview.expectFileDiff("Modified first.txt", "one");
  });

  // Refresh on the first run asks for it again; that reply is held.
  const firstReply = answers.holdNextSnapshot();
  await journey.phase("Refresh reads the first run", (pages) => {
    pages.storyReview.refresh();
  });
  await firstReply.received;
  expect(answers.queriesAsked(storyReviewEndpoint).at(-1)).not.toHaveProperty(
    "run",
  );

  const secondShown = (pages: SidePanelPages) => {
    pages.sessionRuns.expectShown(secondLabel);
    pages.storyReview.expectSessionCommitsContext({ ...context, ...second });
    pages.storyReview.expectFileDiff("Modified second.txt", "two");
  };
  await journey.phase("the second run shows its own comparison", (pages) => {
    pages.sessionRuns.choose(secondLabel);
    secondShown(pages);
  });
  expect(answers.queriesAsked(storyReviewEndpoint).at(-1)).toMatchObject({
    session: session.session.sessionId,
    run: "1",
  });

  firstReply.release();
  await firstReply.delivered;
  await journey.phase("the first run's late reply changes nothing", (pages) => {
    pages.storyReview.expectFeedback(
      "Review refreshed: 2 changed files in the kept session commits.",
    );
    secondShown(pages);
    pages.storyReview.expectChangedFiles("2 changed files");
  });

  const asks = answers.queriesAsked(storyReviewEndpoint).length;
  await journey.phase("Refresh keeps the second run", (pages) => {
    pages.storyReview.refresh();
    secondShown(pages);
  });
  await expect
    .poll(() => answers.queriesAsked(storyReviewEndpoint).slice(asks))
    .toContainEqual(expect.objectContaining({ run: "1" }));
});

test("a run whose commits leave no difference says so", async ({
  page,
  frontendServices,
}) => {
  const title = "Reverting session";
  const session = doneSession(title, [first]);
  await installFrontendStoryReview(
    page,
    frontendSessionCommitsReview(session, []),
  );
  const { recent } = await openFrontendBoardReview(page, frontendServices, {
    doneSessions: [session],
  });

  await sessionReviewChanges(recent, title).click();

  await sidePanelPages(page).phase("the body names the commits", (pages) => {
    pages.reviewToolbar.expectName("Session commits");
    pages.reviewToolbar.expectFilesToggle(false);
    pages.storyReview.expectStory(title);
    pages.storyReview.expectBodyText(
      "No changes: these session commits leave no difference.",
    );
    pages.storyReview.expectNoComparisonSwitch();
  });
});
