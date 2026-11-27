// A narrow Review's Files drawer: decided by the review's own room, it starts
// closed over a diff that keeps its whole room and closes on a file choice.
// The shared drawer's dismissal: ../intent/intent-sessions-drawer.spec.ts.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  adHocSession,
  mountReviewChanges,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";

const phone = { viewport: { width: 390, height: 844 } };
const [first, third] = ["Added first.txt", "Added third.txt"];

const threeFiles = reviewSourceAnswering({
  review: () =>
    Promise.resolve(
      makeMe.aStoryReview
        .publishedSession()
        .adding("first.txt")
        .adding("second.txt")
        .adding("third.txt")
        .please(),
    ),
  fileDiff: ({ path = "" }) =>
    Promise.resolve(
      makeMe.aReviewedFileDiff
        .adding(path, path === "third.txt" ? "gamma" : "alpha")
        .please(),
    ),
});

const region = page.getByRole("region", { name: "Session review" });
const filesList = region.getByRole("list", { name: "3 changed files" });
const diffRegion = (name: string) => region.getByRole("region", { name });

test("a narrow review opens on the whole diff with Files reachable as a drawer that a file choice closes", async () => {
  const review = await mountReviewChanges(threeFiles, adHocSession, phone);
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
