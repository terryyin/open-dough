// The Review changes panel (../../src/StoryReview.tsx) mounted in the page
// contexts it reads (./story-review-page-contexts.ts), with its reads answered
// by the case's review source, and the panel's toolbar, status and diffs as a
// reader meets them; its details are ./story-review-details-view.ts.
import { createElement } from "react";
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { StoryReviewRequest } from "../../src/pageStoryReviews.ts";
import type { ReviewedWorkSubject } from "../../src/reviewedWorkSubject.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { StoryReview } from "../../src/StoryReview.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  box,
  comparisonNameIn,
  reviewDetails,
} from "./story-review-details-view.ts";
import { onReviewPage } from "./story-review-page-contexts.ts";

export { adHocSession, doneStory } from "./story-review-page-contexts.ts";

const unanswered = () => new Promise<never>(() => undefined);

// A review source answering `reads`; any other read stays unanswered.
export const reviewSourceAnswering = (
  reads: Partial<ReviewSource>,
): ReviewSource => ({
  review: unanswered,
  range: unanswered,
  fileDiff: unanswered,
  fileText: unanswered,
  ...reads,
});

// Opens the panel on `subject`'s review, read from `source`.
export async function mountReviewChanges(
  source: ReviewSource,
  subject: ReviewedWorkSubject,
  { completed = false }: { completed?: boolean } = {},
) {
  const request: StoryReviewRequest = {
    subject,
    title: "Done story",
    control: document.body,
    completed,
  };
  await mountComponent(
    onReviewPage(
      source,
      createElement(StoryReview, {
        request,
        maximized: false,
        onMaximize: () => undefined,
        offerMaximize: false,
        onClose: () => undefined,
      }),
    ),
    { fillsViewport: true },
  );
  return reviewChanges();
}

function reviewChanges() {
  const region = page.getByRole("region", { name: /(?:Story|Session) review/ });
  const toolbar = region.getByRole("group", { name: "Review toolbar" });
  const details = reviewDetails(region, toolbar);
  const comparisonName = () => comparisonNameIn(toolbar);
  const feedback = () =>
    region.element().querySelector(".story-review-top [role=status]")
      ?.textContent ?? "";
  const refresh = region.getByRole("button", { name: "Refresh", exact: true });
  const filesToggle = (name: "Hide files" | "Show files") =>
    toolbar.getByRole("button", { name, exact: true });
  const eitherFilesToggle = toolbar.getByRole("button", {
    name: /^(Hide|Show) files$/,
  });
  const diff = (file: string) =>
    region.getByRole("region", { name: file, exact: true });

  // No comparison name and no eye: before an answer or after a failure.
  const expectNoComparisonNameOrDetails = async () => {
    await details.expectNoDetails();
    expect(comparisonName()).toBeNull();
  };

  const view = {
    ...details,

    async expectFeedback(text: string) {
      await expect.poll(() => feedback().trim()).toBe(text);
      return view;
    },

    async expectFeedbackSays(text: string) {
      await expect.poll(feedback).toContain(text);
      return view;
    },

    // The first read is on its way: progress, with no name or eye.
    async expectPending() {
      await view.expectFeedbackSays("Reading the story's changes…");
      await expectNoComparisonNameOrDetails();
      return view;
    },

    // A refused read keeps the problem and Refresh, with no name or eye.
    async expectRefused() {
      await view.expectFeedbackSays("The review could not be read:");
      await expectNoComparisonNameOrDetails();
      await expect.element(refresh).toBeVisible();
      await expect
        .element(region.getByRole("button", { name: "Close", exact: true }))
        .toBeVisible();
      return view;
    },

    // The review shows no read problem: a refusal's words are gone.
    async expectNoProblem(words: string) {
      const text = () => region.element().textContent;
      await expect.poll(text).not.toContain("The review could not be read:");
      expect(text()).not.toContain(words);
      return view;
    },

    async expectComparisonNamed(name: string) {
      await expect.poll(() => comparisonName()?.textContent).toBe(name);
      return view;
    },

    async expectDiffShows(file: string, text: string) {
      await expect.element(diff(file)).toBeVisible();
      await expect.poll(() => diff(file).element().textContent).toContain(text);
      return view;
    },

    async expectFilesToggleNamed(name: "Hide files" | "Show files") {
      await expect.element(filesToggle(name)).toBeVisible();
      return view;
    },

    // The files toggle, an icon whose tooltip says its name, leads the
    // toolbar before the comparison's name.
    async expectFilesToggleLeads(comparisonShown: string) {
      await view.expectComparisonNamed(comparisonShown);
      await expect.element(eitherFilesToggle).toHaveTextContent("");
      expect(eitherFilesToggle.element().querySelector("svg")).not.toBeNull();
      await userEvent.hover(eitherFilesToggle);
      const label =
        eitherFilesToggle.element().getAttribute("aria-label") ?? "";
      await expect
        .element(toolbar.getByText(label, { exact: true }))
        .toBeVisible();
      const [barAt, toggleAt, nameAt] = [
        box(toolbar.element()),
        box(eitherFilesToggle.element()),
        box(comparisonName()),
      ];
      expect(toggleAt.x - barAt.x).toBeLessThan(24);
      expect(nameAt.x).toBeGreaterThanOrEqual(toggleAt.x + toggleAt.width);
      return view;
    },

    async expectNoFilesToggle() {
      await expect.element(toolbar).toBeVisible();
      expect(eitherFilesToggle.query()).toBeNull();
      return view;
    },

    async refresh() {
      await refresh.click();
      return view;
    },

    async hideFiles() {
      await filesToggle("Hide files").click();
      return view;
    },

    async showFiles() {
      await filesToggle("Show files").click();
      return view;
    },
  };
  return view;
}
