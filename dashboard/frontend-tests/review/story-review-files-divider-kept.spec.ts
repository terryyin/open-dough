// The Files divider's chosen width serves every review opened afterwards in
// this browser's real storage. An unusable kept value and refused storage
// each leave the sidebar at 16rem (shared parsing and refusal:
// ../navigation/side-panel-width-kept.spec.ts). Until a choice is kept the
// sidebar is 16rem and nothing is kept, and the divider's own resizing is
// ./story-review-files-divider.spec.ts.
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ReviewedPublishedSessionSubject } from "../../src/reviewedWorkSubject.ts";
import {
  forgetFilesWidth,
  keepFilesWidth,
  keptFilesWidth,
  rem,
} from "./story-review-files-divider-view.ts";
import {
  adHocSession,
  mountReviewChanges,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";

const oneFile = reviewSourceAnswering({
  review: () =>
    Promise.resolve(
      makeMe.aStoryReview.publishedSession().adding("first.txt").please(),
    ),
  fileDiff: () =>
    Promise.resolve(
      makeMe.aReviewedFileDiff.adding("first.txt", "alpha").please(),
    ),
});
const desktop = { viewport: { width: 1280, height: 720 } };
const otherSession: ReviewedPublishedSessionSubject = {
  ...adHocSession,
  published: "00000000-0000-4000-8000-000000000002",
};

// Each case starts and ends with nothing kept, and collects the page's
// uncaught errors.
function freshStorageWatchingErrors() {
  forgetFilesWidth();
  const errors: string[] = [];
  const heard = (event: ErrorEvent) => errors.push(event.message);
  window.addEventListener("error", heard);
  onTestFinished(() => {
    window.removeEventListener("error", heard);
    forgetFilesWidth();
  });
  return errors;
}

test("the chosen file sidebar width serves another session's review", async () => {
  freshStorageWatchingErrors();
  const review = await mountReviewChanges(oneFile, adHocSession, desktop);
  await review.pressOnFilesDivider("ArrowRight", 3);
  await review.expectSidebarWidth(19 * rem);
  expect(keptFilesWidth()).toBe(String(19 * rem));

  // Another story's review opens anew, reading the kept width.
  const other = review.openAnother(otherSession);
  await other.expectDiffShows("Added first.txt", "+alpha");
  await other.expectSidebarWidth(19 * rem);
});

test("an unusable kept file sidebar width gives 16rem", async () => {
  const errors = freshStorageWatchingErrors();
  keepFilesWidth("wide");
  const review = await mountReviewChanges(oneFile, adHocSession, desktop);
  await review.expectSidebarWidth(16 * rem);
  expect(errors).toEqual([]);
});

test("where the browser refuses storage, the sidebar is 16rem and resizes without error", async () => {
  const errors = freshStorageWatchingErrors();
  const methods = ["getItem", "setItem", "removeItem"] as const;
  const kept = methods.map((name) =>
    Object.getOwnPropertyDescriptor(Storage.prototype, name),
  );
  const refused = () => {
    throw new DOMException("Storage is refused.", "SecurityError");
  };
  for (const name of methods)
    Object.defineProperty(Storage.prototype, name, {
      configurable: true,
      value: refused,
    });
  onTestFinished(() => {
    methods.forEach((name, at) => {
      Object.defineProperty(Storage.prototype, name, kept[at] ?? {});
    });
  });
  const review = await mountReviewChanges(oneFile, adHocSession, desktop);
  await review.expectSidebarWidth(16 * rem);
  await review.dragFilesDivider(48);
  await review.expectSidebarWidth(16 * rem + 48);
  expect(errors).toEqual([]);
});
