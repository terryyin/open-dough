// What the page keeps showing while a read is under way, to compare with what
// it showed before: each Story card's title, text and box, read together; every
// reading placeholder any card shows from a chosen moment, however briefly; and
// which placeholders still show anywhere. The scenario keeps the earlier
// reading, says which cards may change and how pinned revisions read, and names
// every expected placeholder.

import type { Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";

export type ShownCard = {
  readonly title: string;
  readonly text: string;
  readonly box: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
};

// Each card's title, text and box, measured in one browser turn so no answer
// lands between two cards' readings.
export function shownCards(page: Page): Promise<ShownCard[]> {
  return parts(page)
    .board.locator("[data-story-card]")
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const { x, y, width, height } = node.getBoundingClientRect();
        return {
          title: node.querySelector("fieldset > h3")?.textContent ?? "",
          text: (node as HTMLElement).innerText,
          box: { x, y, width, height },
        };
      }),
    );
}

// From now on, the page notes every reading placeholder ("Reading …") any card
// shows, as "<card title>: <placeholder>", however briefly it shows it. The
// returned read lists every one noted so far.
export async function notePlaceholders(
  page: Page,
): Promise<() => Promise<string[]>> {
  await page.evaluate(() => {
    const seen = new Set<string>();
    (window as unknown as { placeholders: Set<string> }).placeholders = seen;
    const scan = () => {
      for (const card of document.querySelectorAll("[data-story-card]")) {
        const title = card.querySelector("fieldset > h3")?.textContent ?? "";
        for (const found of (card as HTMLElement).innerText.matchAll(
          /Reading [^…]*…/g,
        )) {
          seen.add(`${title}: ${found[0]}`);
        }
      }
    };
    new MutationObserver(scan).observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  });
  return () =>
    page.evaluate(() => [
      ...(window as unknown as { placeholders: Set<string> }).placeholders,
    ]);
}

// No card, detail or roster on the page now shows any of `placeholders`, such
// as "Reading preparation…".
export async function expectNoPlaceholderShown(
  page: Page,
  placeholders: readonly string[],
) {
  for (const placeholder of placeholders) {
    await expect(page.getByText(placeholder), placeholder).toHaveCount(0);
  }
}
