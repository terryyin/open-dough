import { locators, page, type Locator } from "vitest/browser";

declare module "vitest/browser" {
  interface LocatorSelectors {
    getByCSS(selector: string): Locator;
  }
}

locators.extend({
  getByCSS: (selector) => `css=${selector}`,
});

function markWords(marks: Locator) {
  return marks.elements().map((mark) => mark.textContent);
}

function diffMarks(scope: Locator) {
  const insertions = scope.getByRole("insertion");
  const deletions = scope.getByRole("deletion");
  return {
    insertedWords: () => markWords(insertions),
    deletedWords: () => markWords(deletions),
    insertionDecoration: () =>
      getComputedStyle(insertions.element()).textDecorationLine,
    deletionDecoration: () =>
      getComputedStyle(deletions.element()).textDecorationLine,
  };
}

function diffLine(line: Locator) {
  return { line, ...diffMarks(line) };
}

export function mountedReviewDiff() {
  const reading = page.getByCSS(".story-review-code");
  const revealedBefore = reading.getByRole("list", {
    name: "Omitted lines before the next change",
  });
  return {
    ...diffMarks(reading),
    newLine: (number: number) =>
      diffLine(
        reading.getByCSS(`li.story-review-line[data-new="${String(number)}"]`),
      ),
    removedLine: (number: number) =>
      diffLine(
        reading.getByCSS(
          `li.story-review-removed[data-old="${String(number)}"]`,
        ),
      ),
    hunkMarks: (header: string) =>
      diffMarks(reading.getByRole("list", { name: header, exact: true })),
    firstToken: () => reading.getByCSS(".source-token").first(),
    showPrecedingLines: () =>
      revealedBefore
        .getByRole("button", { name: /^Show \d+ preceding lines?$/ })
        .click(),
    firstRevealedLine: () =>
      diffLine(revealedBefore.getByCSS("li.story-review-line").first()),
    selectedText(first: Locator, last: Locator) {
      const range = document.createRange();
      range.setStartBefore(first.element());
      range.setEndAfter(last.element());
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      return selection?.toString() ?? "";
    },
  };
}
