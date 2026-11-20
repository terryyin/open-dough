import { locators, page, type Locator } from "vitest/browser";
import {
  composeBackgrounds,
  contrastRatio,
} from "../../test-support/composedColours.ts";

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
  const tokens = line.getByCSS(".source-token");
  return {
    line,
    ...diffMarks(line),
    token: (text: RegExp) => tokens.filter({ hasText: text }).first(),
    firstToken: () => tokens.first(),
    tokensInInsertion: () =>
      line.getByRole("insertion").getByCSS(".source-token"),
    background: () => getComputedStyle(line.element()).backgroundColor,
    scrollIntoView: () => {
      line.element().scrollIntoView({ block: "center" });
    },
    place: () => line.element().getBoundingClientRect().y,
  };
}

export function tokenAppearance(token: Locator) {
  const style = getComputedStyle(token.element());
  return {
    color: style.color,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecorationLine: style.textDecorationLine,
  };
}

export function tokenContrast(token: Locator) {
  const node = token.element();
  const backgrounds: string[] = [];
  for (let at: Element | null = node; at; at = at.parentElement)
    backgrounds.push(getComputedStyle(at).backgroundColor);
  return contrastRatio(
    getComputedStyle(node).color,
    composeBackgrounds(backgrounds),
  );
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
    scrollTop: () => reading.element().scrollTop,
    openLineMenu: (label: string) =>
      reading.getByRole("button", { name: label, exact: true }).click(),
    lineMenu(label: string) {
      const menu = reading.getByRole("menu", { name: label, exact: true });
      return {
        menu,
        itemLabels: () =>
          menu
            .getByRole("menuitem")
            .elements()
            .map((item) => item.textContent.trim()),
      };
    },
    showPrecedingLines: () =>
      revealedBefore
        .getByRole("button", { name: /^Show \d+ preceding lines?$/ })
        .click(),
    firstRevealedLine: () =>
      diffLine(revealedBefore.getByCSS("li.story-review-line").first()),
    revealedLines: () =>
      revealedBefore.getByCSS("li.story-review-line").all().map(diffLine),
    lineFacts: () =>
      reading
        .getByCSS("li.story-review-line")
        .elements()
        .map((line) => ({
          text: line.textContent,
          old: line.getAttribute("data-old"),
          new: line.getAttribute("data-new"),
          kind: line.getAttribute("class"),
          background: getComputedStyle(line).backgroundColor,
        })),
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
