// Story A's review as Mark reviewed's tests (../story-review-mark.spec.ts)
// drive it: opening it from the card, choosing Mark reviewed, and the snapshot
// each read answers; and what the machine store and the project's repository
// keep of a story's review mark. Story A's twelve-file worktree is the one
// its since-the-review tests (../story-review-since.spec.ts) mark and change.

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
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";
import {
  addStoryWorktree,
  commitAll,
  git,
  lines,
} from "./storyReviewWorktree.ts";

export const reviewRegion = (page: Page) =>
  page.getByRole("region", { name: "Review changes" });

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

// Chooses Mark reviewed and waits until the review says it marked.
export async function markReviewed(review: Locator) {
  await review.getByRole("button", { name: "Mark reviewed" }).click();
  await expect(review.getByRole("status").first()).toHaveText(
    "Marked reviewed.",
  );
}

// The review marks the machine store keeps, by project id and work identity,
// or undefined when it keeps none at all.
export function keptReviewMarks(
  dashboard: DashboardServer,
): Record<string, Record<string, ReviewMark>> | undefined {
  const store = path.join(
    dashboard.home,
    ".open-dough/dashboard/review-marks.json",
  );
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
