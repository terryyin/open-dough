// A story review's file diff as its syntax styling is read: a line by its
// side and number, its code's tokens and their computed appearance, the
// facts that tell its change kind, and text selected across lines.

import type { Locator, Page } from "@playwright/test";
import {
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
} from "../../src/storyReviewContract.ts";

// A diff line by its number in the new file, or, for a removed line, in the
// old file.
export const newLine = (diff: Locator, number: number) =>
  diff.locator(`li.story-review-line[data-new="${String(number)}"]`);
export const removedLine = (diff: Locator, number: number) =>
  diff.locator(`li.story-review-removed[data-old="${String(number)}"]`);

// The syntax tokens of a line's (or a whole diff's) code.
export const codeTokens = (scope: Locator) =>
  scope.locator(".story-review-line-code span");

// The first token of the scope's code whose text matches `text`.
export const codeToken = (scope: Locator, text: RegExp) =>
  codeTokens(scope).filter({ hasText: text }).first();

// The revealed context lines of the omitted range before the first change.
export const revealedBefore = (diff: Locator) =>
  diff
    .getByRole("list", { name: "Omitted lines before the next change" })
    .locator("li.story-review-line");

export const showPrecedingLines = (diff: Locator) =>
  diff.getByRole("button", { name: "Show 20 preceding lines" });

// A token's computed colour and syntax styles.
export const tokenAppearance = (token: Locator) =>
  token.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      color: style.color,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      textDecorationLine: style.textDecorationLine,
    };
  });

// Each line's text, numbers, kind and background, as the diff shows them.
export const lineFacts = (diff: Locator) =>
  diff.locator("li.story-review-line").evaluateAll((lines) =>
    lines.map((line) => ({
      text: line.textContent,
      old: line.getAttribute("data-old"),
      new: line.getAttribute("data-new"),
      kind: line.getAttribute("class"),
      background: getComputedStyle(line).backgroundColor,
    })),
  );

// The text the page selects from the start of `first` to the end of `last`.
export async function selectedText(first: Locator, last: Locator) {
  const end = await last.elementHandle();
  return first.evaluate((start, until) => {
    const range = document.createRange();
    range.setStartBefore(start);
    range.setEndAfter(until);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    return selection?.toString() ?? "";
  }, end);
}

// The paths of every file diff and file text read the page asks for from now.
export function fileReads(page: Page) {
  const asked: string[] = [];
  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if (
      pathname === storyReviewFileEndpoint ||
      pathname === storyReviewFileTextEndpoint
    )
      asked.push(pathname);
  });
  return () => [...asked];
}

// Where a line sits in the window, as the reader sees it.
export const placeOf = async (line: Locator) =>
  (await line.boundingBox())?.y ?? Number.NaN;

// Everything a diff says, with its file's path written as `<path>`, so two
// files' diffs compare word for word.
export const diffWords = async (diff: Locator, path: string) =>
  (await diff.innerText()).replaceAll(path, "<path>");
