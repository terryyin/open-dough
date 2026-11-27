// The Side panel review the review width specs still open from a Recently
// done session; the frame's own specs show a terminal
// (`./side-panel-width-view.ts`).
import { expect, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { reviewFiles } from "../review/story-review-files-view.ts";
import { reviewSourceAnswering } from "../review/story-review-panel-page.ts";
import { mountBoard } from "./board-mount.ts";
import { boardReading } from "./board-reading-page.ts";
import { boardWork, story } from "./board-work.ts";
import { wide } from "./side-panel-width-view.ts";

const reviewStory = story("Inspect the chosen width", 60);
const taken = story("Work in progress", 59);
const review = page.getByRole("region", {
  name: "Session review",
  exact: true,
});

export const files = reviewFiles(review);

export async function openReview() {
  const entry = boardReading
    .column("Recently done")
    .getByRole("article", { name: reviewStory.title, exact: true })
    .getByRole("list", { name: "Published sessions" })
    .getByRole("article");
  const action = entry.getByRole("button", { name: "Review session changes" });
  await expect.element(action).toBeInTheDocument();
  const title = entry.element().getAttribute("aria-label") ?? "";
  const control = action.element();
  if (!(control instanceof HTMLElement))
    throw new Error("Review changes is not focusable.");
  control.focus();
  await userEvent.keyboard("{Enter}");
  await expect
    .element(
      review.getByRole("heading", { level: 2, name: title, exact: true }),
    )
    .toBeVisible();
}

export async function mountWidthReview(viewport = wide) {
  const comparison = makeMe.aStoryReview
    .publishedSession()
    .adding("story.txt")
    .modifying("unstaged.txt")
    .please();
  const record = publishedSessionRecordSchema.parse(
    makeMe.aSessionRecord.forStory(reviewStory.identity).please(),
  );
  const completed = makeMe.aDoneRecord
    .completed({ ...reviewStory, completedAt: record.closedAt })
    .please();
  const catalog = makeMe.aDoneCatalog.holding([completed]).please();
  const reviewed = vi
    .fn<ReviewSource["review"]>()
    .mockResolvedValue(comparison);
  const fileDiff = vi
    .fn<ReviewSource["fileDiff"]>()
    .mockImplementation((query) => {
      const path = query.path ?? "story.txt";
      return Promise.resolve(
        makeMe.aReviewedFileDiff.adding(path, "more wide").please(),
      );
    });
  const frame = await mountBoard(
    [
      boardWork([], {
        revision: catalog.done.revision,
        taken: [taken],
        done: catalog.done,
        publishedSessions: {
          status: "listed",
          revision: catalog.done.revision,
          sessions: [record],
        },
      }),
    ],
    viewport,
    {},
    {
      done: catalog.doneReads,
      reviews: reviewSourceAnswering({ review: reviewed, fileDiff }),
      sessionsSidebar: "kept",
    },
  );
  await expect
    .element(
      boardReading.column("Taken").getByRole("article", { name: taken.title }),
    )
    .toBeInTheDocument();
  await openReview();
  return { ...frame, review: reviewed, fileDiff };
}
