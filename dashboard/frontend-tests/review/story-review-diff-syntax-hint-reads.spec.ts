// A story's Review changes reads its path-silent file's Intent `syntax` hint
// through the page's Intent reads (../../src/reviewDiffSyntaxHint.ts): a live
// review at its published head, a Done review at its completion, and the
// hinted diff is styled.
import { createElement, type ReactElement } from "react";
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { storyReviewIds } from "../../../Distribution/tests/support/storyReviewCompletedTestData.mjs";
import type { PageReads } from "../../src/pageReads.tsx";
import { reviewIntentSettingsRevision } from "../../src/reviewDiffSyntaxHint.ts";
import type { ReviewedStorySubject } from "../../src/reviewedWorkSubject.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { SnapshotView } from "../../src/StoryReviewSnapshotView.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { reviewDiffPage } from "./reviewDiffPage.ts";
import {
  adHocSession,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";
import { onReviewPage } from "./story-review-page-contexts.ts";

const shellCode = "if true; then echo x; fi";
const hintedPath = "scripts/setup.test";
const story: ReviewedStorySubject = {
  source: adHocSession.source,
  identity: "SEED-1#hinted",
};

// The story's review on the page, its Intent locations read by `readLocations`.
function hintedReview(
  readLocations: PageReads["intent"]["readLocations"],
  view: ReactElement,
) {
  return mountComponent(
    onReviewPage(
      reviewSourceAnswering({
        fileDiff: () =>
          Promise.resolve(
            makeMe.aReviewedFileDiff.adding(hintedPath, shellCode).please(),
          ),
        fileText: () =>
          Promise.resolve({
            kind: "text",
            baseline: null,
            tree: `${shellCode}\n`,
          }),
      }),
      view,
      { intent: { ...pageReadsSupplying({}).intent, readLocations } },
    ),
  );
}

const shellLocations = () =>
  vi.fn<PageReads["intent"]["readLocations"]>(() =>
    Promise.resolve({
      status: "configured" as const,
      locations: [
        makeMe.anIntentLocation
          .at("scripts")
          .withSources({ include: ["**/*.test"], syntax: "shell" })
          .selecting(hintedPath)
          .please(),
      ],
    }),
  );

// The review's comparison at its tree, with the Intent settings revision the
// review pins (`reviewIntentSettingsRevision`).
const reviewOf = (review: StoryReview) =>
  createElement(SnapshotView, {
    reviewed: { subject: story },
    comparison: {
      from: storyReviewIds.baseline,
      files: [
        { kind: "added", path: hintedPath, lines: { added: 1, removed: 0 } },
      ],
    },
    tree: storyReviewIds.head,
    headingId: "hinted",
    browser: { id: "hinted-files", shown: true },
    settingsRevision: reviewIntentSettingsRevision(review) ?? "",
  });

test("a live story review reads the diff's Intent hint at its published head and styles it", async () => {
  const readLocations = shellLocations();
  await hintedReview(
    readLocations,
    reviewOf(makeMe.aStoryReview.adding(hintedPath).please()),
  );

  await expect.element(reviewDiffPage().newLine(1).token(/^if$/)).toBeVisible();
  expect(readLocations).toHaveBeenCalledWith(
    expect.objectContaining({ id: adHocSession.source }),
    storyReviewIds.head,
    expect.anything(),
  );
});

test("a Done story review reads the diff's Intent hint at its completion and styles it", async () => {
  const readLocations = shellLocations();
  await hintedReview(
    readLocations,
    reviewOf(
      makeMe.aStoryReview
        .adding(hintedPath)
        .published(storyReviewIds.completion)
        .please(),
    ),
  );

  await expect.element(reviewDiffPage().newLine(1).token(/^if$/)).toBeVisible();
  expect(readLocations).toHaveBeenCalledWith(
    expect.objectContaining({ id: adHocSession.source }),
    storyReviewIds.completion,
    expect.anything(),
  );
  expect(readLocations).not.toHaveBeenCalledWith(
    expect.objectContaining({ id: adHocSession.source }),
    storyReviewIds.head,
    expect.anything(),
  );
});
