// A narrow Review's Files drawer: decided by the review's own room, it starts
// closed over a diff that keeps its whole room, closes on a file choice, and
// an outside tap closes it before anything under it acts.
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  enableSettingsTouch,
  touchAt,
} from "../configuration/system-settings-browser.ts";
import { center } from "../navigation/board-reading-page.ts";
import {
  adHocSession,
  mountReviewChanges,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";

const phone = { viewport: { width: 390, height: 844 } };
const [first, third] = ["Added first.txt", "Added third.txt"];

function threeFiles() {
  const review = vi.fn(() =>
    Promise.resolve(
      makeMe.aStoryReview
        .publishedSession()
        .adding("first.txt")
        .adding("second.txt")
        .adding("third.txt")
        .please(),
    ),
  );
  const source = reviewSourceAnswering({
    review,
    fileDiff: ({ path = "" }) =>
      Promise.resolve(
        makeMe.aReviewedFileDiff
          .adding(path, path === "third.txt" ? "gamma" : "alpha")
          .please(),
      ),
  });
  return { review, source };
}

const region = page.getByRole("region", { name: "Session review" });
const filesList = region.getByRole("list", { name: "3 changed files" });
const diffRegion = (name: string) => region.getByRole("region", { name });

test("a narrow review opens on the whole diff with Files reachable as a drawer that a file choice closes", async () => {
  const { source } = threeFiles();
  const review = await mountReviewChanges(source, adHocSession, phone);
  await review.expectFilesToggleNamed("Show files");
  await review.expectDiffShows(first, "+alpha");
  const diffBefore = diffRegion(first).element().getBoundingClientRect();

  await review.showFiles();
  await review.expectFilesToggleNamed("Hide files");
  const drawer = filesList
    .element()
    .closest("section")
    ?.getBoundingClientRect();
  if (drawer === undefined) throw new Error("Files has no sidebar");
  const diffUnder = diffRegion(first).element().getBoundingClientRect();
  expect(diffUnder.width).toBeCloseTo(diffBefore.width, 0);
  expect(drawer.left).toBeLessThanOrEqual(diffUnder.left);
  expect(drawer.right).toBeLessThan(diffUnder.right - 40);

  await review.chooseFile(third);
  await review.expectFilesToggleNamed("Show files");
  await review.expectDiffShows(third, "+gamma");
  await review.showFiles();
  await review.expectSelected(third);
});

test("in a narrow review, a native tap on Refresh over the open Files drawer only closes it, and the next tap refreshes", async () => {
  await enableSettingsTouch();
  const { source, review: reads } = threeFiles();
  const review = await mountReviewChanges(source, adHocSession, phone);
  await review.expectDiffShows(first, "+alpha");
  await review.showFiles();
  await review.expectFilesToggleNamed("Hide files");
  const readsBefore = reads.mock.calls.length;
  const refresh = center(
    region.getByRole("button", { name: "Refresh", exact: true }).element(),
  );

  await touchAt(refresh.x, refresh.y);
  await review.expectFilesToggleNamed("Show files");
  expect(reads.mock.calls.length).toBe(readsBefore);

  await touchAt(refresh.x, refresh.y);
  await expect.poll(() => reads.mock.calls.length).toBe(readsBefore + 1);
});
