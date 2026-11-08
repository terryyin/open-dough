// The Board, its Story cards, the Perspective choice, the Intent
// perspective's content and the Panel divider, as fluent page objects
// for the Side panel content journeys
// (./navigation/side-panel-content-replacement.spec.ts), beside the Side
// panel and its content (./sidePanelContentPages.ts). Each method writes one
// named cue on the phase's cue sheet (./support/cueSheet.ts) and returns the
// page object the reader is then at; the phase runs the cues. The objects own
// their parts' scoped locators, how the page is operated, and what each
// observation waits for; the spec keeps the inputs and expected values.

import type { Locator, Page } from "@playwright/test";
import { parts, storyCardSessions } from "./dashboardParts.ts";
import { box } from "./pageLayout.ts";
import {
  FinalReport,
  PageObject,
  SidePanel,
  StoryReview,
} from "./sidePanelContentPages.ts";
import {
  dragDivider,
  expectDividerSays,
  expectWidth,
  panelDivider,
} from "./sidePanelWidthPage.ts";
import { type CueSheet, phase } from "./support/cueSheet.ts";
import { expect } from "./support/preparationPage.ts";
import { sidePanelContents } from "./support/sidePanelContents.ts";

type Perspective = "Development" | "Intent";

// The page objects a phase writes its cues on.
export interface SidePanelPages {
  readonly board: Board;
  readonly perspective: PerspectiveChoice;
  readonly intent: Intent;
  readonly sidePanel: SidePanel;
  readonly panelDivider: PanelDivider;
}

export class Board extends PageObject {
  // A Story card on the Board, by its story's title.
  storyCard(title: string) {
    return new StoryCard(this.page, this.cues, title);
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

  expectShown() {
    return this.cue(
      `${this.#named}: shown`,
      () => expect(this.#card).toBeVisible(),
      this,
    );
  }

  expectReviewChangesFocused() {
    return this.cue(
      `${this.#named}: Review changes has the keyboard`,
      () => expect(this.#reviewChanges).toBeFocused(),
      this,
    );
  }
}

// The banner's choice between the Development and Intent perspectives.
export class PerspectiveChoice extends PageObject {
  #radio(name: Perspective) {
    const { development, intentChoice } = parts(this.page);
    return name === "Intent" ? intentChoice : development;
  }

  choose(name: Perspective) {
    return this.cue(
      `Perspective: choose ${name}`,
      () => this.#radio(name).click(),
      this,
    );
  }

  expectChosen(name: Perspective) {
    return this.cue(
      `Perspective: ${name} is chosen`,
      () => expect(this.#radio(name)).toBeChecked(),
      this,
    );
  }
}

// The Intent perspective's content, shown in place of the Board.
export class Intent extends PageObject {
  get #intent() {
    return parts(this.page).intent;
  }

  expectText(text: string) {
    return this.cue(
      `Intent: says "${text}"`,
      () => expect(this.#intent).toContainText(text),
      this,
    );
  }

  expectNotShown() {
    return this.cue(
      "Intent: not shown",
      () => expect(this.#intent).toHaveCount(0),
      this,
    );
  }
}

export class PanelDivider extends PageObject {
  // Drags the divider sideways by `by` CSS px with the mouse.
  drag(by: number) {
    return this.cue(
      `Panel divider: drag by ${String(by)} px`,
      async () => {
        await dragDivider(this.page, by);
      },
      this,
    );
  }

  // Presses `key` with the keyboard on the divider.
  press(key: string) {
    return this.cue(
      `Panel divider: press ${key}`,
      async () => {
        await panelDivider(this.page).focus();
        await this.page.keyboard.press(key);
      },
      this,
    );
  }

  // The Side panel's shown content is `width` CSS px wide, and the divider
  // says so.
  expectSidePanelWidth(width: number) {
    return this.cue(
      `Panel divider: Side panel is ${String(width)} px wide`,
      async () => {
        await expectWidth(sidePanelContents(this.page), width);
        await expectDividerSays(this.page, width);
      },
      this,
    );
  }
}

const pagesOf = (page: Page, cues: CueSheet): SidePanelPages => ({
  board: new Board(page, cues),
  perspective: new PerspectiveChoice(page, cues),
  intent: new Intent(page, cues),
  sidePanel: new SidePanel(page, cues),
  panelDivider: new PanelDivider(page, cues),
});

// The journey's page: its phases, and what it measures between them.
export function sidePanelPages(page: Page) {
  return {
    // Runs one named phase whose cues `write` writes on the page objects.
    phase: (title: string, write: (pages: SidePanelPages) => unknown) =>
      phase(title, (cues) => pagesOf(page, cues), write),
    // The width of the Side panel's one shown content, in CSS px, now.
    shownWidth: async () =>
      Math.round((await box(sidePanelContents(page))).width),
  };
}
