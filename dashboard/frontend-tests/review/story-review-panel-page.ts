// The Review changes panel (../../src/StoryReview.tsx) mounted in the page
// contexts it reads (./story-review-page-contexts.ts), with its reads answered
// by the case's review source, and the panel's toolbar, status and diffs as a
// reader meets them.
import { createElement } from "react";
import { expect } from "vitest";
import { page } from "vitest/browser";
import type { StoryReviewRequest } from "../../src/pageStoryReviews.ts";
import type { ReviewedWorkSubject } from "../../src/reviewedWorkSubject.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { StoryReview } from "../../src/StoryReview.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { onReviewPage } from "./story-review-page-contexts.ts";

export { adHocSession, doneStory } from "./story-review-page-contexts.ts";

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
  const comparisonName = () =>
    toolbar.element().querySelector(".story-review-toolbar-name");
  const eye = toolbar.getByRole("button", {
    name: /^(Show|Hide) review details$/,
  });
  const feedback = () =>
    region.element().querySelector(".story-review-top [role=status]")
      ?.textContent ?? "";
  const refresh = region.getByRole("button", { name: "Refresh", exact: true });
  const filesToggle = (name: "Hide files" | "Show files") =>
    toolbar.getByRole("button", { name, exact: true });
  const diff = (file: string) =>
    region.getByRole("region", { name: file, exact: true });
  const box = (element: Element | null | undefined) => {
    if (!element) throw new Error("Not laid out.");
    return element.getBoundingClientRect();
  };

  // No comparison name and no eye: before an answer or after a failure.
  const expectNoComparisonNameOrDetails = async () => {
    await expect.element(toolbar).toBeVisible();
    expect(comparisonName()).toBeNull();
    expect(eye.query()).toBeNull();
    expect(
      region.getByRole("group", { name: "Review details" }).query(),
    ).toBeNull();
  };

  const view = {
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

    // The eye, an icon right after the comparison's name, offers the details.
    async expectEyeBesideComparison() {
      await expect.element(eye).toHaveAccessibleName("Show review details");
      await expect.element(eye).toHaveTextContent("");
      expect(eye.element().querySelector("svg")).not.toBeNull();
      const nameAt = box(comparisonName());
      const gap = box(eye.element()).x - (nameAt.x + nameAt.width);
      expect(gap).toBeGreaterThanOrEqual(0);
      expect(gap).toBeLessThan(24);
      return view;
    },

    // The details wait behind the eye, which says so.
    async expectDetailsCollapsed() {
      await expect.element(eye).toHaveAccessibleName("Show review details");
      await expect.element(eye).toHaveAttribute("aria-expanded", "false");
      const controlled = eye.element().getAttribute("aria-controls");
      const section =
        controlled === null ? null : document.getElementById(controlled);
      expect(section).not.toBeNull();
      expect(section?.checkVisibility()).toBe(false);
      expect(region.getByRole("radio").query()).toBeNull();
      expect(region.getByRole("listbox").query()).toBeNull();
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
