// What the attention journey (./sessions/agent-launch-attention.spec.ts)
// observes on the cards while the sessions already open on them
// (./storyCardOpenSessions.ts) change: each card's attention count, and its
// published facts apart from its local session presentation.

import type { Locator } from "@playwright/test";
import { storyCardAttentionOf } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";

// Expects the words each card with affected sessions shows, by title, and
// that every other card on the board shows none.
export const attentionCountsOn =
  (board: Locator, card: (title: string) => Locator) =>
  async (counts: Record<string, string>) => {
    for (const [title, words] of Object.entries(counts)) {
      await expect(storyCardAttentionOf(card(title))).toHaveText(words);
    }
    await expect(storyCardAttentionOf(board)).toHaveCount(
      Object.keys(counts).length,
    );
  };

// Published story facts exclude local session UI and the conditional Ready scan;
// compact-session-entry.spec.ts observes its canonical assessment and visibility.
export const publishedFactsOf = async (card: Locator) => {
  let facts: string | null = null;
  await expect
    .poll(async () => {
      facts = await card.evaluate((element) => {
        // Readiness (badges, each credited human) and capture share one
        // turn: a new snapshot may begin reading after an assertion passed.
        if (
          !element.querySelector(".story-card-preparation .badge-row") ||
          /Reading [^…]*…/.test(element.textContent) ||
          element.querySelector(".owner-line:not(:has([class*=owner-human-]))")
        )
          return null;
        const copy = element.cloneNode(true) as HTMLElement;
        const localPresentation = copy.querySelectorAll(
          ".story-card-sessions, .story-card-attention, .story-card-session-open-reason, .story-card-preparation .badge-ready",
        );
        for (const part of localPresentation) part.remove();
        return copy.textContent;
      });
      return facts;
    })
    .not.toBeNull();
  return facts;
};
