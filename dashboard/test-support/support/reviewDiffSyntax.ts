// A story review's file diff as its lines are read. Scenarios use
// StoryReviewDiff; the functions below are its selectors. Token appearance
// and file reads stay measurements a scenario compares for itself.

import type { Locator, Page } from "@playwright/test";
import {
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
} from "../../src/storyReviewContract.ts";

// A diff line by its number in the new file, or, for a removed line, in the
// old file.
const newLine = (diff: Locator, number: number) =>
  diff.locator(`li.story-review-line[data-new="${String(number)}"]`);
const removedLine = (diff: Locator, number: number) =>
  diff.locator(`li.story-review-removed[data-old="${String(number)}"]`);

// The syntax tokens of a line's (or a whole diff's) code.
const codeTokens = (scope: Locator) =>
  scope.locator(".story-review-line-code span");

// The first token of the scope's code whose text matches `text`.
const codeToken = (scope: Locator, text: RegExp) =>
  codeTokens(scope).filter({ hasText: text }).first();

// The revealed context lines of the omitted range before the first change.
const revealedBefore = (diff: Locator) =>
  diff
    .getByRole("list", { name: "Omitted lines before the next change" })
    .locator("li.story-review-line");

const showPrecedingLines = (diff: Locator) =>
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

// Everything a diff says, with its file's path written as `<path>`, so two
// files' diffs compare word for word.
const diffWords = async (diff: Locator, path: string) =>
  (await diff.innerText()).replaceAll(path, "<path>");

// A file diff the scenario has open.
export const storyReviewDiff = (diff: Locator) => new StoryReviewDiff(diff);

export class StoryReviewDiff {
  readonly locator: Locator;

  constructor(diff: Locator) {
    this.locator = diff;
  }

  newLine(number: number) {
    return new StoryReviewDiffLine(newLine(this.locator, number));
  }

  removedLine(number: number) {
    return new StoryReviewDiffLine(removedLine(this.locator, number));
  }

  codeTokens() {
    return codeTokens(this.locator);
  }

  showPrecedingLines() {
    return showPrecedingLines(this.locator);
  }

  revealedBefore() {
    return revealedBefore(this.locator);
  }

  lineTexts() {
    return this.locator.locator("li.story-review-line").allTextContents();
  }

  words(path: string) {
    return diffWords(this.locator, path);
  }
}

// A rendered line and its syntax tokens.
class StoryReviewDiffLine {
  readonly line: Locator;

  constructor(line: Locator) {
    this.line = line;
  }

  token(text: RegExp) {
    return codeToken(this.line, text);
  }

  codeTokens() {
    return codeTokens(this.line);
  }
}
