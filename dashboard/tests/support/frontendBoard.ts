// The substitute project's settled Taken/Backlog Board as a fluent page
// object: opening it returns the Board, and each hand-off returns the object
// the reader reaches next, so a journey reaches the Terminal panel and comes
// back without importing each part. Scenarios supply every expected column,
// control, count and width.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./pageTest.ts";
import {
  parts,
  storyCardSessionOf,
  storyCardSessions,
} from "../dashboardPage.ts";
import { takenStory } from "../launchJourney.ts";
import { backlogLaunchers } from "../launchStoryCardPage.ts";
import { box } from "../pageLayout.ts";
import {
  columnPagingControl,
  expectStoryCardsKeepTheirShare,
  expectView,
  recordSlides,
  slidesOf,
  type ColumnName,
} from "../boardPage.ts";
import { scrollsOnItsOwn } from "../sidePanelWidthPage.ts";
import { closeSidePanel } from "../sidePanelFrame.ts";
import {
  openTerminalControl,
  terminalPanel,
  terminalScreenParts,
} from "../terminalScreenPage.ts";

// The substitute project's Taken story card.
export const takenStoryCard = (page: Page) =>
  parts(page).taken.getByRole("article", { name: takenStory, exact: true });

// What a Side panel beside the Board cuts by design: a screen that scrolls on
// its own and the panel title, which truncates with disclosure
// (../../src/SidePanelTitle.tsx).
const cutBesideSidePanel = [...scrollsOnItsOwn, ".side-panel-title-toggle"];

export class FrontendBoard {
  constructor(readonly page: Page) {}

  // Exactly the `shown` columns fill the Board and the column paging
  // controls read `controls`; see expectView.
  async shows(
    shown: readonly ColumnName[],
    controls: readonly string[],
  ): Promise<this> {
    await expectView(this.page, shown, controls, cutBesideSidePanel);
    return this;
  }

  async pageTo(column: ColumnName): Promise<this> {
    await columnPagingControl(this.page, column).click();
    return this;
  }

  // Counts every later slide of the columns' row; read with slides().
  async countSlides(): Promise<this> {
    await recordSlides(this.page);
    return this;
  }

  slides(): Promise<number> {
    return slidesOf(this.page);
  }

  async width(): Promise<number> {
    return (await box(this.page.locator(".page-column"))).width;
  }

  async keepsStoryCardShare(shown: number): Promise<this> {
    await expectStoryCardsKeepTheirShare(this.page, shown);
    return this;
  }

  // Opens the Taken story's Execution session terminal; see
  // openSessionTerminal.
  openTakenStoryTerminal(): Promise<FrontendTerminal> {
    return this.openSessionTerminal(
      storyCardSessionOf(takenStoryCard(this.page), "Execution"),
    );
  }

  // Opens the terminal of a story card's session `entry` and waits until it
  // shows its attachment.
  async openSessionTerminal(entry: Locator): Promise<FrontendTerminal> {
    await openTerminalControl(entry).click();
    const terminal = new FrontendTerminal(this);
    await expect(terminalScreenParts(terminal.panel).rows).toContainText(
      "attached",
    );
    return terminal;
  }

  async showsNoTerminal(): Promise<this> {
    await expect(terminalPanel(this.page)).toHaveCount(0);
    return this;
  }

  // Starts execution of the Backlog story titled `title` in Claude Code:
  // its card's Start execution, then the dialog's Start, until the dialog
  // closes.
  async startExecution(title: string): Promise<this> {
    const { start, dialog } = backlogLaunchers(this.page);
    await start(title).click();
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    await expect(dialog).toBeHidden();
    return this;
  }

  async showsBacklogCardSessions(title: string, count: number): Promise<this> {
    await expect(
      storyCardSessions(backlogLaunchers(this.page).card(title)),
    ).toHaveCount(count);
    return this;
  }
}

// The Terminal panel beside the Board it was opened from.
export class FrontendTerminal {
  readonly panel;

  constructor(readonly board: FrontendBoard) {
    this.panel = terminalPanel(board.page);
  }

  // Presses Close by `using`; the caller observes what the Board shows.
  async close(
    using: Parameters<typeof closeSidePanel>[1],
  ): Promise<FrontendBoard> {
    await closeSidePanel(this.panel, using);
    return this.board;
  }
}

export const frontendBoard = (page: Page) => new FrontendBoard(page);
