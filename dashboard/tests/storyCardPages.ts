import { readFinalReportControl } from "./finalReportPages.ts";
import { openTerminalControl } from "./terminalScreenPage.ts";
// The Board and its Story cards as fluent page objects for the Side panel
// journeys (./sidePanelPages.ts): what a reader does on a card, which Side
// panel content that opens, taken from the phase's page-object set, and how
// the card shows its selection, inspection and Terminal. Each method writes
// one named cue on the phase's cue sheet (./support/cueSheet.ts) and returns
// the page object the reader is then at (./fluentPageObject.ts); the phase
// runs the cues.

import { reviewChanges } from "./storyCardControls.ts";
import type { Locator } from "@playwright/test";
import { parts, storyCardSessions } from "./dashboardParts.ts";
import { PageObject } from "./fluentPageObject.ts";
import type { SidePanelPages } from "./sidePanelPages.ts";
import { expectInspected, expectSelected } from "./storyCardSelection.ts";
import { expect } from "./support/preparationPage.ts";

export class Board extends PageObject {
  // A Story card on the Board, by its story's title.
  storyCard(title: string) {
    return new StoryCard(this.pages, title);
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

  constructor(pages: SidePanelPages, title: string) {
    super(pages);
    this.#title = title;
    this.#card = parts(pages.page).board.getByRole("article", {
      name: title,
      exact: true,
    });
  }

  // The card's one Review changes action.
  get #reviewChanges() {
    return reviewChanges(this.#card);
  }

  get #shownInTerminal() {
    return storyCardSessions(this.#card).getByText("Shown in terminal");
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
      this.pages.storyReview,
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
      this.pages.storyReview,
    );
  }

  // Read final report on the card's session entry.
  readFinalReport() {
    return this.cue(
      `${this.#named}: Read final report`,
      () =>
        readFinalReportControl(storyCardSessions(this.#card), {
          exact: false,
        }).click(),
      this.pages.finalReport,
    );
  }

  // Open terminal on the card's session entry.
  openTerminal() {
    return this.cue(
      `${this.#named}: Open terminal`,
      () =>
        openTerminalControl(storyCardSessions(this.#card), {
          exact: false,
        }).click(),
      this.pages.terminal,
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

  // Its story is the Selected story, highlighted.
  expectSelected() {
    return this.#expect("selected", () => expectSelected(this.#card, true));
  }

  expectNotSelected() {
    return this.#expect("not selected", () =>
      expectSelected(this.#card, false),
    );
  }

  // Its inline detail is open.
  expectInspected() {
    return this.#expect("inspected", () => expectInspected(this.#card, true));
  }

  expectNotInspected() {
    return this.#expect("not inspected", () =>
      expectInspected(this.#card, false),
    );
  }

  // Its session entry says that the Terminal shows its session.
  expectShownInTerminal() {
    return this.#expect("Shown in terminal", () =>
      expect(this.#shownInTerminal).toBeVisible(),
    );
  }

  // No session entry says that the Terminal shows its session.
  expectNotShownInTerminal() {
    return this.#expect("not shown in terminal", () =>
      expect(this.#shownInTerminal).toHaveCount(0),
    );
  }
}
