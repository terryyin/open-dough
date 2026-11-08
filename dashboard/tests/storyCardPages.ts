// The Board and its Story cards as fluent page objects for the Side panel
// journeys (./sidePanelPages.ts): what a reader does on a card, which Side
// panel content that opens, and how the card shows its selection,
// inspection and Terminal. Each method writes one named cue on the phase's
// cue sheet (./support/cueSheet.ts) and returns the page object the reader
// is then at; the phase runs the cues.

import type { Locator, Page } from "@playwright/test";
import { parts, storyCardSessions } from "./dashboardParts.ts";
import {
  FinalReport,
  PageObject,
  StoryReview,
} from "./sidePanelContentPages.ts";
import { expectInspected, expectSelected } from "./storyCardSelection.ts";
import type { CueSheet } from "./support/cueSheet.ts";
import { expect } from "./support/preparationPage.ts";
import { Terminal } from "./terminalPages.ts";

export class Board extends PageObject {
  // A Story card on the Board, by its story's title.
  storyCard(title: string) {
    return new StoryCard(this.page, this.cues, title);
  }

  // No Story card shows its inline detail.
  expectNoStoryDetail() {
    return this.cueHere("Board: no Story card shows its detail", () =>
      expect(
        this.page.getByRole("region", { name: /^Detail for / }),
      ).toHaveCount(0),
    );
  }
}

export class StoryCard extends PageObject {
  readonly #title: string;
  readonly #card: Locator;

  constructor(page: Page, cues: CueSheet, title: string) {
    super(page, cues);
    this.#title = title;
    this.#card = parts(page).board.getByRole("article", {
      name: title,
      exact: true,
    });
  }

  // The card's one Review changes action.
  get #reviewChanges() {
    return this.#card.getByRole("button", { name: "Review changes" });
  }

  get #named() {
    return `Story card "${this.#title}"`;
  }

  #press(name: string) {
    return this.cueHere(`${this.#named}: ${name}`, () =>
      this.#card.getByRole("button", { name }).click(),
    );
  }

  #expect(state: string, expectation: () => Promise<void>) {
    return this.cueHere(`${this.#named}: ${state}`, expectation);
  }

  reviewChanges() {
    return this.cue(
      `${this.#named}: Review changes`,
      () => this.#reviewChanges.click(),
      new StoryReview(this.page, this.cues),
    );
  }

  // Review changes from the keyboard: focused, then Enter.
  reviewChangesByKeyboard() {
    return this.cue(
      `${this.#named}: Review changes by keyboard`,
      async () => {
        await this.#reviewChanges.focus();
        await this.#reviewChanges.press("Enter");
      },
      new StoryReview(this.page, this.cues),
    );
  }

  // Read final report on the card's session entry.
  readFinalReport() {
    return this.cue(
      `${this.#named}: Read final report`,
      () =>
        storyCardSessions(this.#card)
          .getByRole("button", { name: "Read final report" })
          .click(),
      new FinalReport(this.page, this.cues),
    );
  }

  // Open terminal on the card's session entry.
  openTerminal() {
    return this.cue(
      `${this.#named}: Open terminal`,
      () =>
        storyCardSessions(this.#card)
          .getByRole("button", { name: "Open terminal" })
          .click(),
      new Terminal(this.page, this.cues),
    );
  }

  inspect() {
    return this.#press("Inspect story");
  }

  hideDetail() {
    return this.#press("Hide detail");
  }

  // A click on the card's heading, an empty area of the card, which
  // selects its story or clears that selection.
  clickEmptyArea() {
    return this.cueHere(`${this.#named}: click its empty area`, () =>
      this.#card.getByRole("heading", { level: 3 }).click(),
    );
  }

  expectShown() {
    return this.#expect("shown", () => expect(this.#card).toBeVisible());
  }

  expectReviewChangesFocused() {
    return this.#expect("Review changes has the keyboard", () =>
      expect(this.#reviewChanges).toBeFocused(),
    );
  }

  // Its story is the Selected story, highlighted, or is not.
  expectSelected(selected = true) {
    return this.#expect(selected ? "selected" : "not selected", () =>
      expectSelected(this.#card, selected),
    );
  }

  // Its inline detail is open, or is not.
  expectInspected(inspected = true) {
    return this.#expect(inspected ? "inspected" : "not inspected", () =>
      expectInspected(this.#card, inspected),
    );
  }

  // Its session entry says that the Terminal shows its session, or no
  // entry says so.
  expectShownInTerminal(shown = true) {
    const mark = storyCardSessions(this.#card).getByText("Shown in terminal");
    return this.#expect(
      shown ? "Shown in terminal" : "not shown in terminal",
      () => (shown ? expect(mark).toBeVisible() : expect(mark).toHaveCount(0)),
    );
  }
}
