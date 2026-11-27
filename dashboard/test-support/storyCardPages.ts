import { readFinalReportControl } from "./finalReportPages.ts";
import { openTerminalControl } from "./terminalScreenPage.ts";
// The Board and its Story cards as fluent page objects for the Side panel
// journeys (./sidePanelPages.ts): what a reader does on a card, which Side
// panel content that opens, taken from the phase's page-object set, and how
// the card shows its selection, inspection and Terminal. Each method writes
// one named cue on the phase's cue sheet (./support/cueSheet.ts) and returns
// the page object the reader is then at (./fluentPageObject.ts); the phase
// runs the cues.

import type { Locator } from "@playwright/test";
import { parts, storyCardSessions } from "./dashboardParts.ts";
import { PageObject } from "./fluentPageObject.ts";
import type { SidePanelPages } from "./sidePanelPages.ts";
import { hideDetail, reviewChanges, storyCard } from "./storyCardControls.ts";
import {
  emptyArea,
  expectInspected,
  expectSelected,
} from "./storyCardSelection.ts";
import { expect } from "./support/preparationPage.ts";
import { publishedSessionReviewChanges } from "./recentlyDoneColumn.ts";
import { showColumn } from "./boardPage.ts";

export class Board extends PageObject {
  #publishedReview(session: string) {
    return publishedSessionReviewChanges(
      parts(this.page).recentlyDone,
      session,
    );
  }

  reviewPublishedSession(
    session: string,
    using: "mouse" | "keyboard" = "mouse",
  ) {
    return this.cue(
      `Recently done: review the published session ${session} in Intent`,
      async () => {
        await showColumn(this.page, "Recently done");
        const action = this.#publishedReview(session);
        await (using === "keyboard" ? action.press("Enter") : action.click());
      },
      this.pages.intent,
    );
  }

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
    this.#card = storyCard(parts(pages.page).board, title);
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

  // Read final report on the card's session entry.
  readFinalReport() {
    return this.cue(
      `${this.#named}: Read final report`,
      () => readFinalReportControl(storyCardSessions(this.#card)).click(),
      this.pages.finalReport,
    );
  }

  openChanges(using: "mouse" | "keyboard") {
    return this.cue(
      `${this.#named}: Review changes`,
      () => {
        const action = reviewChanges(this.#card);
        return using === "keyboard" ? action.press("Enter") : action.click();
      },
      this.pages.intent,
    );
  }

  // Open terminal on the card's session entry.
  openTerminal() {
    return this.cue(
      `${this.#named}: Open terminal`,
      () => openTerminalControl(storyCardSessions(this.#card)).click(),
      this.pages.terminal,
    );
  }

  inspect() {
    return this.#press("Inspect story");
  }

  hideDetail() {
    return this.cueHere(`${this.#named}: Hide detail`, () =>
      hideDetail(this.#card),
    );
  }

  // A click on the card's heading, an empty area of the card, which
  // selects its story or clears that selection.
  clickEmptyArea() {
    return this.cueHere(`${this.#named}: click its empty area`, () =>
      emptyArea(this.#card).click(),
    );
  }

  expectShown() {
    return this.#expect("shown", () => expect(this.#card).toBeVisible());
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
