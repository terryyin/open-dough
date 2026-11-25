// The story-columns Board and a session on one of its cards. The scenario
// names the session expected on that card before opening its terminal.

import type { Locator, Page } from "@playwright/test";
import { sessionKey } from "../src/sessionReference.ts";
import { setPageVisibility } from "./autoRefreshJourney.ts";
import { expect } from "./dashboardTest.ts";
import {
  expectMembership,
  parts,
  sessionNamedBy,
  sessionStateOf,
  sessionEntryShowing,
} from "./dashboardPage.ts";
import type { StoryColumnsJourney } from "./launchJourney.ts";
import { openTerminalControl } from "./sessionEntryAccess.ts";
import { openTerminalFromEntry } from "./terminalScreenPage.ts";
import { openStoryColumnsJourney, type Workflow } from "./storyColumnsPage.ts";
import { terminalScreen } from "./terminalScreen.ts";

type OpenedJourney = Awaited<ReturnType<typeof openStoryColumnsJourney>>;

export class LaunchDialog {
  readonly #dialog: Locator;

  constructor(dialog: Locator) {
    this.#dialog = dialog;
  }

  async expectShown() {
    await expect(this.#dialog).toBeVisible();
    return this;
  }

  async expectHidden() {
    await expect(this.#dialog).toBeHidden();
    return this;
  }

  isShown() {
    return this.#dialog.isVisible();
  }
}

// A session listed on a story card.
export class ListedSession {
  readonly page: Page;
  readonly #entry: Locator;

  constructor(
    page: Page,
    entry: Locator,
    readonly id: string,
  ) {
    this.page = page;
    this.#entry = entry;
  }

  // Opens the session's terminal and waits until that panel is showing.
  async openTerminal() {
    await openTerminalFromEntry(this.#entry);
    const terminal = terminalScreen(this.page);
    await terminal.expectShown();
    return terminal;
  }

  // Hides the page and shows it again, then the entry reads `reading`.
  async reads(reading: string) {
    await setPageVisibility(this.page, "hidden");
    await setPageVisibility(this.page, "visible");
    await expect(sessionStateOf(this.#entry)).toHaveText(reading);
    return this;
  }

  async focusOpener() {
    await openTerminalControl(this.#entry).focus();
    return this;
  }

  async expectOpenerFocused() {
    await expect(openTerminalControl(this.#entry)).toBeFocused();
    return this;
  }

  async expectFocused() {
    await expect(this.#entry).toBeFocused();
    return this;
  }

  async expectInViewport() {
    await expect(this.#entry).toBeInViewport();
    return this;
  }

  namedId() {
    return sessionNamedBy(this.#entry);
  }

  // The synthetic claude attaches for this session, by its short id.
  attaches<Attach extends { id: string }>(dashboard: {
    claudeAttaches(): Attach[];
  }) {
    return dashboard
      .claudeAttaches()
      .filter((attached) => attached.id === this.id.slice(0, 8));
  }
}

export class StoryColumnsBoard {
  readonly page: Page;
  readonly #opened: OpenedJourney;

  constructor(page: Page, opened: OpenedJourney) {
    this.page = page;
    this.#opened = opened;
  }

  static async open(page: Page, journey: StoryColumnsJourney) {
    return new StoryColumnsBoard(
      page,
      await openStoryColumnsJourney(page, journey),
    );
  }

  async showsStories(titles: {
    readonly taken: string[];
    readonly backlog: string[];
  }) {
    await expectMembership(this.page, titles);
    return this;
  }

  async settled() {
    await this.#opened.settled();
    return this;
  }

  async expectBannerShown() {
    await expect(parts(this.page).banner).toBeVisible();
    return this;
  }

  async expectBannerHidden() {
    await expect(parts(this.page).banner).toBeHidden();
    return this;
  }

  // Finds the recorded Claude session on its story card.
  listedSession(title: string, sessionId: string) {
    const key = sessionKey({ host: "claude", sessionId });
    const entry = sessionEntryShowing(this.#opened.card(title), key);
    return new ListedSession(this.page, entry, sessionId);
  }

  // Opens the start dialog and waits until it is showing.
  async openStartDialog(title: string, workflow: Workflow) {
    await this.#opened.action(title, workflow).click();
    const dialog = new LaunchDialog(
      this.page.getByRole("dialog", {
        name: `Start ${workflow} in Claude Code`,
      }),
    );
    await dialog.expectShown();
    return dialog;
  }
}

export function openStoryColumnsBoard(
  page: Page,
  journey: StoryColumnsJourney,
) {
  return StoryColumnsBoard.open(page, journey);
}
