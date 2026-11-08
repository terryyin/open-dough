// The Terminal, a session's Side panel content, and the Sessions sidebar
// that opens it, as fluent page objects for the Side panel journeys
// (./sidePanelPages.ts). Each method writes one named cue on the phase's cue
// sheet (./support/cueSheet.ts) and returns the page object the reader is
// then at; the phase runs the cues. The Sessions sidebar's parts are found
// where every journey finds them (./sessionsSidebarPage.ts).

import { PageObject } from "./sidePanelContentPages.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { expect } from "./support/preparationPage.ts";

export class Terminal extends PageObject {
  get #terminal() {
    return this.page.getByRole("region", { name: "Terminal", exact: true });
  }

  // What the session's screen shows.
  get #rows() {
    return this.#terminal.locator(".xterm-rows");
  }

  expectShown() {
    return this.cueHere("Terminal: shown", () =>
      expect(this.#terminal).toBeVisible(),
    );
  }

  // The session's screen shows this text.
  expectText(text: string) {
    return this.cueHere(`Terminal: shows "${text}"`, () =>
      expect(this.#rows).toContainText(text),
    );
  }

  // Types a line on the keyboard the Terminal holds, then Enter.
  typeLine(line: string) {
    return this.cueHere(`Terminal: type "${line}" and Enter`, async () => {
      await this.page.keyboard.type(line);
      await this.page.keyboard.press("Enter");
    });
  }
}

export class SessionsSidebar extends PageObject {
  get #parts() {
    return sessionsSidebarParts(this.page);
  }

  // The banner's Sessions button, which opens and closes the sidebar.
  toggle() {
    return this.cueHere("Sessions sidebar: press Sessions", () =>
      this.#parts.button.click(),
    );
  }

  expectToggleFocused() {
    return this.cueHere("Sessions sidebar: Sessions has the keyboard", () =>
      expect(this.#parts.button).toBeFocused(),
    );
  }

  expectShown() {
    return this.cueHere("Sessions sidebar: shown", () =>
      expect(this.#parts.sidebar).toBeVisible(),
    );
  }

  expectHidden() {
    return this.cueHere("Sessions sidebar: hidden", () =>
      expect(this.#parts.sidebar).toBeHidden(),
    );
  }

  // The entry for the story with this title is listed.
  expectEntry(title: string) {
    return this.cueHere(`Sessions sidebar: lists ${title}`, () =>
      expect(this.#parts.entry(title)).toBeVisible(),
    );
  }

  // The entry's session is the one the Side panel shows.
  expectEntryCurrent(title: string) {
    return this.cueHere(`Sessions sidebar: ${title} is current`, () =>
      expect(this.#parts.entry(title)).toHaveAttribute("aria-current", "true"),
    );
  }

  // Opens the entry's session in the Terminal.
  openEntry(title: string) {
    return this.cue(
      `Sessions sidebar: open ${title}`,
      () => this.#parts.entry(title).click(),
      new Terminal(this.page, this.cues),
    );
  }
}
