// The Perspective choice, the Intent perspective's content and the Panel
// divider, as fluent page objects for the Side panel journeys
// (./navigation/side-panel-content-replacement.spec.ts,
// ./navigation/side-panel-content-switching.spec.ts), beside the Board and
// its Story cards (./storyCardPages.ts), the Side panel and its content
// (./sidePanelContentPages.ts), and the Terminal and Sessions sidebar
// (./terminalPages.ts); and the phases those journeys run them in. Each method
// writes one named cue on the phase's cue sheet (./support/cueSheet.ts) and
// returns the page object the reader is then at; the phase runs the cues. The
// objects own their parts' scoped locators, how the page is operated, and what
// each observation waits for; the spec keeps the inputs and expected values.

import type { Page } from "@playwright/test";
import { parts } from "./dashboardParts.ts";
import { box } from "./pageLayout.ts";
import { PageObject, SidePanel } from "./sidePanelContentPages.ts";
import {
  dragDivider,
  expectDividerSays,
  expectWidth,
  panelDivider,
} from "./sidePanelWidthPage.ts";
import { type CueSheet, phase } from "./support/cueSheet.ts";
import { expect } from "./support/preparationPage.ts";
import { sidePanelContents } from "./support/sidePanelContents.ts";
import { Board } from "./storyCardPages.ts";
import { SessionsSidebar, Terminal } from "./terminalPages.ts";

type Perspective = "Development" | "Intent";

// The page objects a phase writes its cues on.
export interface SidePanelPages {
  readonly board: Board;
  readonly perspective: PerspectiveChoice;
  readonly intent: Intent;
  readonly sidePanel: SidePanel;
  readonly terminal: Terminal;
  readonly sessionsSidebar: SessionsSidebar;
  readonly panelDivider: PanelDivider;
}

// The banner's choice between the Development and Intent perspectives.
export class PerspectiveChoice extends PageObject {
  #radio(name: Perspective) {
    const { development, intentChoice } = parts(this.page);
    return name === "Intent" ? intentChoice : development;
  }

  choose(name: Perspective) {
    return this.cueHere(`Perspective: choose ${name}`, () =>
      this.#radio(name).click(),
    );
  }

  expectChosen(name: Perspective) {
    return this.cueHere(`Perspective: ${name} is chosen`, () =>
      expect(this.#radio(name)).toBeChecked(),
    );
  }
}

// The Intent perspective's content, shown in place of the Board.
export class Intent extends PageObject {
  get #intent() {
    return parts(this.page).intent;
  }

  expectText(text: string) {
    return this.cueHere(`Intent: says "${text}"`, () =>
      expect(this.#intent).toContainText(text),
    );
  }

  // Intent reads this story as the Selected story.
  expectSelectedStory(identity: string) {
    return this.cueHere(`Intent: reads ${identity} as the Selected story`, () =>
      expect(this.#intent).toHaveAttribute("data-selected-story", identity),
    );
  }

  expectNotShown() {
    return this.cueHere("Intent: not shown", () =>
      expect(this.#intent).toHaveCount(0),
    );
  }
}

export class PanelDivider extends PageObject {
  // Drags the divider sideways by `by` CSS px with the mouse.
  drag(by: number) {
    return this.cueHere(`Panel divider: drag by ${String(by)} px`, async () => {
      await dragDivider(this.page, by);
    });
  }

  // Presses `key` with the keyboard on the divider.
  press(key: string) {
    return this.cueHere(`Panel divider: press ${key}`, async () => {
      await panelDivider(this.page).focus();
      await this.page.keyboard.press(key);
    });
  }

  // The Side panel's shown content is `width` CSS px wide, and the divider
  // says so.
  expectSidePanelWidth(width: number) {
    return this.cueHere(
      `Panel divider: Side panel is ${String(width)} px wide`,
      async () => {
        await expectWidth(sidePanelContents(this.page), width);
        await expectDividerSays(this.page, width);
      },
    );
  }
}

const pagesOf = (page: Page, cues: CueSheet): SidePanelPages => ({
  board: new Board(page, cues),
  perspective: new PerspectiveChoice(page, cues),
  intent: new Intent(page, cues),
  sidePanel: new SidePanel(page, cues),
  terminal: new Terminal(page, cues),
  sessionsSidebar: new SessionsSidebar(page, cues),
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
    // Where the Side panel's one shown content is, in CSS px, now.
    shownRoom: () => box(sidePanelContents(page)),
  };
}
