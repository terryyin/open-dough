import { page, type Locator } from "vitest/browser";
import {
  composeBackgrounds,
  contrastRatio,
} from "../../test-support/composedColours.ts";
import { activateButton } from "../page-objects/activateButton.ts";
import "../page-objects/cssLocator.ts";

function markWords(marks: Locator) {
  return marks.elements().map((mark) => mark.textContent);
}

function diffMarks(scope: Locator) {
  const insertion = scope.getByRole("insertion");
  const deletion = scope.getByRole("deletion");
  return {
    insertion,
    deletion,
    observations: {
      insertedWords: () => markWords(insertion),
      deletedWords: () => markWords(deletion),
      insertionDecoration: () =>
        getComputedStyle(insertion.element()).textDecorationLine,
      deletionDecoration: () =>
        getComputedStyle(deletion.element()).textDecorationLine,
    },
  };
}

function diffLine(line: Locator) {
  const tokens = line.getByCSS(".source-token");
  const { insertion, deletion, observations } = diffMarks(line);
  return {
    line,
    text: () => line.element().textContent,
    ...observations,
    token: (text: RegExp) => tokens.filter({ hasText: text }).first(),
    firstToken: () => tokens.first(),
    tokensInInsertion: () => insertion.getByCSS(".source-token"),
    tokensInDeletion: () => deletion.getByCSS(".source-token"),
    insertionUnderline: () => underlineAppearance(insertion, line),
    deletionUnderline: () => underlineAppearance(deletion, line),
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

function composedBackground(node: Element) {
  const backgrounds: string[] = [];
  for (let at: Element | null = node; at; at = at.parentElement)
    backgrounds.push(getComputedStyle(at).backgroundColor);
  return composeBackgrounds(backgrounds);
}

export function tokenContrast(token: Locator) {
  const node = token.element();
  return contrastRatio(getComputedStyle(node).color, composedBackground(node));
}

function underlineAppearance(mark: Locator, line: Locator) {
  const color = getComputedStyle(mark.element()).textDecorationColor;
  return {
    color,
    contrast: contrastRatio(color, composedBackground(line.element())),
  };
}

// How a diff line is numbered and marked, as the reader sees it.
function lineNumbering(line: Element) {
  return {
    text: line.textContent,
    old: line.getAttribute("data-old"),
    new: line.getAttribute("data-new"),
    kind: line.getAttribute("class"),
  };
}

const gapNames = {
  before: "Omitted lines before the next change",
  between: "Omitted lines between changes",
  after: "Omitted lines after the previous change",
} as const;

// One omitted-context gap: the expansions it offers and the lines it reveals.
function contextGap(gap: Locator) {
  const lines = () => gap.getByCSS("li.story-review-line").elements();
  return {
    gap,
    expansions: () =>
      gap
        .getByRole("button")
        .elements()
        .map((button) => button.getAttribute("aria-label")),
    show: (label: string) =>
      activateButton(gap.getByRole("button", { name: label, exact: true })),
    texts: () => lines().map((line) => line.textContent),
    facts: () => lines().map(lineNumbering),
  };
}

export function reviewDiffPage() {
  const reading = page.getByCSS(".story-review-code");
  const gap = (side: keyof typeof gapNames) =>
    contextGap(reading.getByRole("list", { name: gapNames[side] }));
  const revealedBefore = gap("before").gap;
  return {
    contextGap: gap,
    ...diffMarks(reading).observations,
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
    firstToken: () => reading.getByCSS(".source-token").first(),
    scrollTop: () => reading.element().scrollTop,
    openLineMenu: (label: string) =>
      activateButton(reading.getByRole("button", { name: label, exact: true })),
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
      activateButton(
        revealedBefore.getByRole("button", {
          name: /^Show \d+ preceding lines?$/,
        }),
      ),
    firstRevealedLine: () =>
      diffLine(revealedBefore.getByCSS("li.story-review-line").first()),
    revealedLines: () =>
      revealedBefore.getByCSS("li.story-review-line").all().map(diffLine),
    lineFacts: () =>
      reading
        .getByCSS("li.story-review-line")
        .elements()
        .map((line) => ({
          ...lineNumbering(line),
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
