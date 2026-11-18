// A done story card's Story actions for its review state: Mark as reviewed,
// Reviewed, and the Unreview question. Published done records and the review
// state this machine keeps are ./recentlyDoneReviewState.ts. Callers that
// already opened the page use `doneStoryReview`; `open` shows Recently done
// and returns that same owner.

import type { Locator, Page } from "@playwright/test";
import {
  expectControlContrast,
  expectReadableContrast,
} from "./accessibleReading.ts";
import { showColumn } from "./boardPage.ts";
import { parts } from "./dashboardParts.ts";
import { expect } from "./dashboardTest.ts";

// Opens the page on Recently done.
export async function openRecentlyDone(page: Page) {
  await page.goto("/");
  await showColumn(page, "Recently done");
  return parts(page).recentlyDone;
}

// A done story's card, named by its title once its record is read, or by
// its identity until then.
export const doneCard = (page: Page, name: string) =>
  parts(page).recentlyDone.getByRole("article", { name, exact: true });

export const storyActions = (card: Locator) =>
  card.getByRole("group", { name: "Story actions" });

export const markAsReviewed = (card: Locator) =>
  storyActions(card).getByRole("button", {
    name: "Mark as reviewed",
    exact: true,
  });

export const reviewedButton = (card: Locator) =>
  storyActions(card).getByRole("button", { name: "Reviewed", exact: true });

export const unreviewQuestion = (card: Locator, question: string) =>
  storyActions(card).getByRole("group", { name: question, exact: true });

export const cancelUnreview = (question: Locator) =>
  question.getByRole("button", { name: "Cancel", exact: true });

export const confirmUnreview = (question: Locator) =>
  question.getByRole("button", { name: "Unreview", exact: true });

export async function unreviewStory(
  card: Locator,
  question: string,
  using: "mouse" | "keyboard",
) {
  const button = reviewedButton(card);
  const confirm = confirmUnreview(unreviewQuestion(card, question));
  if (using === "keyboard") {
    await button.press("Enter");
    await confirm.press("Enter");
  } else {
    await button.click();
    await confirm.click();
  }
}

export const reviewSaveFailure = (card: Locator, message: string) =>
  card.getByRole("status").filter({ hasText: message });

// A warning remains an action in words, with a filled red surface that is
// readable and distinguishable as a control in the caller's appearance.
export async function expectReviewWarning(
  card: Locator,
  colors: { readonly background: string; readonly foreground: string },
) {
  const action = markAsReviewed(card);
  await expect(action).toBeVisible();
  await expect(action).toHaveCSS("background-color", colors.background);
  await expect(action).toHaveCSS("color", colors.foreground);
  await expectReadableContrast(action);
  await expectControlContrast(action);
}

export async function expectQuietReviewed(
  card: Locator,
  quietColor: string,
  surfaceColor: string,
) {
  await expectReviewed(card, true);
  await expect(reviewedButton(card)).toHaveCSS("color", quietColor);
  await expect(reviewedButton(card)).toHaveCSS(
    "background-color",
    surfaceColor,
  );
  await expectReadableContrast(reviewedButton(card));
}

// A story's saved state occupies one action, with no separate status badge.
export async function expectReviewed(card: Locator, reviewed: boolean) {
  const actions = storyActions(card);
  if (reviewed) {
    await expect(reviewedButton(card)).toBeVisible();
    await expect(markAsReviewed(card)).toHaveCount(0);
  } else {
    await expect(markAsReviewed(card)).toBeVisible();
  }
  await expect(actions.getByText("Reviewed", { exact: true })).toHaveCount(
    reviewed ? 1 : 0,
  );
  await expect(
    actions.getByRole("button", { name: "Unreview", exact: true }),
  ).toHaveCount(0);
  await expect(card.getByText(/unreviewed/i)).toHaveCount(0);
}

function doneReviewCard(page: Page, name: string) {
  const article = doneCard(page, name);
  return {
    article,
    actions: storyActions(article),
    markAsReviewed: markAsReviewed(article),
    reviewedButton: reviewedButton(article),
    // The Unreview question, and its Cancel and Unreview choices.
    unreviewQuestion(question: string) {
      const group = unreviewQuestion(article, question);
      return {
        group,
        cancel: cancelUnreview(group),
        confirm: confirmUnreview(group),
      };
    },
    saveFailure: (message: string) => reviewSaveFailure(article, message),
    expectReviewed: (reviewed: boolean) => expectReviewed(article, reviewed),
    unreview: (question: string, using: "mouse" | "keyboard") =>
      unreviewStory(article, question, using),
  };
}

// The Recently done column's done-story review actions. Does not navigate.
export function doneStoryReview(page: Page) {
  const review = {
    column: parts(page).recentlyDone,
    card: (name: string) => doneReviewCard(page, name),
    open: async () => {
      await openRecentlyDone(page);
      return review;
    },
  };
  return review;
}
