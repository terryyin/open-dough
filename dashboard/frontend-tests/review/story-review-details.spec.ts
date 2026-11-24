// Details and their focus behavior in a retained Execution checkout session review.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ReviewedWorkSubject } from "../../src/reviewedWorkSubject.ts";
import {
  frontendReviewIds,
  frontendSessionCommitsReview,
} from "../../test-support/support/frontendStoryReview.ts";
import {
  adHocSession,
  mountReviewChanges,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";

const { baseline, tree, head, commit } = frontendReviewIds;
const doneAt = "2026-01-02T12:00:00.000Z";
const record = makeMe.aLaunchRecord
  .adHoc({ title: "Interrupted Main session" })
  .launchedAt("2026-01-02T10:00:00.000Z")
  .keptSessionCommits({
    repository: "/tmp/default-main/.git",
    runs: [
      { base: baseline, revision: tree },
      { base: head, revision: commit },
    ],
  })
  .markedDoneAt(doneAt)
  .please();
const opened = makeMe.aStoryReview
  .sessionCommits()
  .adding("first.txt")
  .adding("second.txt")
  .adding("third.txt")
  .please();
const picked = makeMe.aStoryReview
  .sessionCommits()
  .adding("fourth.txt")
  .please();
if (opened.kind !== "session-commits" || picked.kind !== "session-commits")
  throw new Error("The mounted fixture requires session commits.");
const facts = [
  { commits: 1, subject: "First run", committedAt: doneAt },
  { commits: 2, subject: "Second run", committedAt: doneAt },
];
const firstRun = frontendSessionCommitsReview(record, opened.files, 0, facts);
const secondRun = frontendSessionCommitsReview(record, picked.files, 1, facts);
const secondRunLabel = `2 commits — Second run — ${new Date(doneAt).toLocaleString()}`;
const linesOf: Record<string, string[]> = {
  "first.txt": ["alpha"],
  "second.txt": Array.from({ length: 300 }, (...[, at]) => `second ${at}`),
  "third.txt": ["gamma"],
  "fourth.txt": ["delta"],
};
const sessionSource = reviewSourceAnswering({
  review: (query) => Promise.resolve(query.run === "1" ? secondRun : firstRun),
  fileDiff: ({ path = "" }) =>
    Promise.resolve(
      makeMe.aReviewedFileDiff.adding(path, ...(linesOf[path] ?? [])).please(),
    ),
});
const otherSession: ReviewedWorkSubject = {
  ...adHocSession,
  session: "00000000-0000-4000-8000-000000000003",
};
const [first, second, third] = [
  "Added first.txt",
  "Added second.txt",
  "Added third.txt",
];

test("a session review opens on the diff and keeps its place while the eye reveals and hides its details", async () => {
  const review = await mountReviewChanges(sessionSource, adHocSession);
  // Compact opening: toggle, name, eye; files and the first diff readable.
  await review.expectListed("3 changed files");
  await review.expectDiffShows(first, "+alpha");
  await review.expectDetailsCollapsed();
  await review.expectFilesToggleLeads("Session commits");
  await review.expectEyeBesideComparison();

  // The second file, its diff scrolled.
  await review.chooseFile(second);
  await review.expectDiffShows(second, "+second 0");
  const readingAt = review.scrollCodeTo(second, 120);
  expect(readingAt).toBeGreaterThan(0);

  await review.revealDetails();
  await review.expectEyeBesideComparison("Hide review details");
  await review.expectDetailsSay("Commits made in the execution checkout");
  await review.expectDetailsSay(`From ${baseline} to ${tree}.`);
  await review.expectSelected(second);
  expect(review.codeScrollTop(second)).toBe(readingAt);

  await review.hideDetails();
  await review.expectComparisonNamed("Session commits");
  await review.expectSelected(second);
  expect(review.codeScrollTop(second)).toBe(readingAt);

  // The sidebar toggle works with the details revealed too.
  await review.revealDetails();
  await review.hideFiles();
  await review.expectFilesShown(false);
  await review.expectDetailsRevealed();
  await review.showFiles();
  await review.expectSelected(second);
});

test("the chosen session run survives Refresh and Escape returns focus to the eye", async () => {
  const review = await mountReviewChanges(sessionSource, adHocSession);
  await review.revealDetails();
  await review.chooseComparison(secondRunLabel);
  await review.expectComparisonChosen(secondRunLabel);
  await review.expectDetailsRevealed();
  await review.expectDetailsSay(`From ${head} to ${commit}.`);
  await review.expectDiffShows("Added fourth.txt", "+delta");

  await review.refresh();
  await review.expectFeedbackSays("Review refreshed");
  await review.expectDetailsRevealed();
  await review.expectComparisonChosen(secondRunLabel);

  await review.escapeFromComparison(secondRunLabel);
  await review.expectComparisonNamed("Session commits");
  await review.expectDiffShows("Added fourth.txt", "+delta");
});

test("another session's review opens collapsed with the files shown, whatever the last one left", async () => {
  const review = await mountReviewChanges(sessionSource, adHocSession);
  // Details collapsed, third file selected: the sidebar toggle works.
  await review.chooseFile(third);
  await review.expectSelected(third);
  await review.expectDetailsCollapsed();
  await review.hideFiles();
  await review.expectFilesShown(false);
  await review.expectDiffShows(third, "+gamma");
  await review.showFiles();
  await review.expectSelected(third);

  // Left with the details revealed and the files hidden.
  await review.revealDetails();
  await review.hideFiles();
  await review.expectFilesShown(false);

  const next = review.openAnother(otherSession);
  await next.expectListed("3 changed files");
  await next.expectDetailsCollapsed();
  await next.expectFilesShown(true);
  await next.expectFilesToggleNamed("Hide files");
  await next.expectDiffShows(first, "+alpha");
});
