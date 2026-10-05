// Story A's review as its marking tests (../story-review-mark.spec.ts,
// ../story-review-since.spec.ts, ../story-review-comparison*.spec.ts) drive
// it: opening and reopening it from the card, choosing Mark reviewed, and the
// snapshot each read answers; and what the machine store and the project's
// repository keep of a story's review mark. Story A's twelve-file worktree is
// the one the since-the-review tests mark and change.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewSchema,
  type ReviewMark,
  type TakenStoryReview,
} from "../../src/storyReview.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { expect } from "./preparationPage.ts";
import { openBacklog } from "./sessionDialog.ts";
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";
import { keepLaunchRecord } from "./storyLaunchRecord.ts";
import {
  addStoryWorktree,
  commitAll,
  git,
  lines,
} from "./storyReviewWorktree.ts";

export const reviewRegion = (page: Page) =>
  page.getByRole("region", { name: "Review changes" });

// A marked story's comparison switch.
export const comparison = (review: Locator) =>
  review.getByRole("radiogroup", { name: "Comparison" });

// The snapshot the page's next review read answers.
export async function nextSnapshot(page: Page): Promise<TakenStoryReview> {
  const response = await page.waitForResponse(
    (answered) => new URL(answered.url()).pathname === storyReviewEndpoint,
  );
  const review = storyReviewSchema.parse(await response.json());
  if (review.kind !== "snapshot") throw new Error("No snapshot was taken.");
  return review;
}

// Opens the card's review and answers the snapshot the review shows.
export async function openReview(page: Page, card: Locator) {
  const snapshot = nextSnapshot(page);
  await card.getByRole("button", { name: "Review changes" }).click();
  return snapshot;
}

// Closes the review and opens it again from the card, answering the fresh
// snapshot it shows.
export async function reopenReview(page: Page, card: Locator) {
  await reviewRegion(page)
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await expect(reviewRegion(page)).toHaveCount(0);
  return openReview(page, card);
}

// Chooses Mark reviewed and waits until the review says it marked.
export async function markReviewed(review: Locator) {
  await review.getByRole("button", { name: "Mark reviewed" }).click();
  await expect(review.getByRole("status").first()).toHaveText(
    "Marked reviewed.",
  );
}

// The review marks the machine store keeps, by project id and work identity,
// or undefined when it keeps none at all.
const markStore = (dashboard: DashboardServer) =>
  path.join(dashboard.home, ".open-dough/dashboard/review-marks.json");

export function keptReviewMarks(
  dashboard: DashboardServer,
): Record<string, Record<string, ReviewMark>> | undefined {
  const store = markStore(dashboard);
  return existsSync(store)
    ? (JSON.parse(readFileSync(store, "utf8")) as Record<
        string,
        Record<string, ReviewMark>
      >)
    : undefined;
}

// Story A's mark the machine store keeps.
export const keptStoryAMark = (dashboard: DashboardServer) =>
  keptReviewMarks(dashboard)?.["open-dough"]?.[queuedIdentity];

// Rewrites Story A's kept mark as the machine store holds it.
export function rewriteStoryAMark(
  dashboard: DashboardServer,
  changed: Partial<ReviewMark>,
) {
  const marks = keptReviewMarks(dashboard) ?? {};
  const mark = marks["open-dough"]?.[queuedIdentity];
  if (mark === undefined) throw new Error("Story A has no mark to rewrite.");
  writeFileSync(
    markStore(dashboard),
    JSON.stringify({
      ...marks,
      "open-dough": {
        ...marks["open-dough"],
        [queuedIdentity]: { ...mark, ...changed },
      },
    }),
  );
}

// The review is headed as the changes since the review, made when the mark
// says.
export async function expectSinceTheReview(
  review: Locator,
  mark: ReviewMark | undefined,
) {
  await expect(
    review.getByRole("heading", { name: "Changes since the review" }),
  ).toBeVisible();
  const heading = review.locator(".story-review-since");
  await expect(heading).toContainText("From the snapshot marked reviewed");
  await expect(heading.locator("time")).toHaveAttribute(
    "datetime",
    mark?.markedAt ?? "",
  );
}

// The refs keeping marked trees in the project's repository, each as
// `<ref> <object>`.
export const reviewedRefs = (project: string) =>
  git(
    project,
    "for-each-ref",
    "--format=%(refname) %(objectname)",
    "refs/open-dough/reviewed/",
  );

// A story file's name by its number.
export const storyFile = (number: number) =>
  `file-${String(number).padStart(2, "0")}.txt`;

// Story A's worktree adding twelve files: the first six committed, the rest
// untracked.
export function twelveFileWorktree(origin: StartOrigin) {
  const workspace = addStoryWorktree(origin.project);
  for (let number = 1; number <= 12; number += 1) {
    writeFileSync(
      path.join(workspace, storyFile(number)),
      lines(`f${String(number)}`),
    );
    if (number === 6) commitAll(workspace, "first six files");
  }
  return { workspace };
}

// The agent's later edit of a story file: its sixth line rewritten.
export function editLater(workspace: string, number: number) {
  const file = path.join(workspace, storyFile(number));
  writeFileSync(
    file,
    readFileSync(file, "utf8").replace(
      `f${String(number)} 5\n`,
      `f${String(number)} five\n`,
    ),
  );
}

// Story A marked at its twelve files, then two of them changed and one
// added, and its review reopened on the three changes since the review.
export async function markedThenChanged(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  const { workspace } = twelveFileWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openReview(page, card);
  const review = reviewRegion(page);
  await markReviewed(review);
  editLater(workspace, 2);
  editLater(workspace, 9);
  writeFileSync(path.join(workspace, storyFile(13)), "added later\n");
  await reopenReview(page, card);
  await expect(
    review.getByRole("list", { name: "3 changed files" }),
  ).toBeVisible();
  return { workspace, card, review };
}
