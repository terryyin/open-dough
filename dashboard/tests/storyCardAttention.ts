// How the attention journey (./sessions/agent-launch-attention.spec.ts) sees
// a story card's local attention apart from what origin publishes: sessions
// launched on each queued card of a paused page, the words each card counts,
// and a card's published facts without its local session presentation.

import type { Locator, Page } from "@playwright/test";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { expect, pausePageClockAt } from "./dashboardTest.ts";
import {
  parts,
  sessionNamedBy,
  storyCardAttentionOf,
  storyCardSessionOf,
} from "./dashboardPage.ts";
import type { StoryColumnsJourney } from "./launchJourney.ts";
import { expectSessionShown, watchRecordReads } from "./sessionStatePace.ts";
import type { Workflow } from "./storyColumnsPage.ts";
import {
  launchEachQueuedStory,
  openQueuedStoryCards,
  queuedStories,
} from "./storyCardSessionListing.ts";
import type { ClaudeSessionChange } from "./support/fakeClaude.ts";

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

// Launches on each queued card (./storyCardSessionListing.ts) on a paused
// page; none needs attention yet.
export async function launchOnEachQueuedCard(
  page: Page,
  dashboard: DashboardServer,
  columnsJourney: StoryColumnsJourney,
) {
  await pausePageClockAt(page, new Date());
  const { passOnePace } = await watchRecordReads(page);
  const { settled, show, launch, card } = await openQueuedStoryCards(
    page,
    dashboard,
    columnsJourney,
  );
  const { board, taken } = parts(page);
  const entryOf = (title: string, workflow: Workflow) =>
    storyCardSessionOf(card(title), workflow);
  // The words each card with affected sessions shows; every other card
  // shows none.
  const expectCounted = async (counts: Record<string, string>) => {
    for (const [title, words] of Object.entries(counts)) {
      await expect(storyCardAttentionOf(card(title))).toHaveText(words);
    }
    await expect(storyCardAttentionOf(board)).toHaveCount(
      Object.keys(counts).length,
    );
  };
  const shows = (
    title: string,
    workflow: Workflow,
    words: string,
    needsAttention: boolean,
  ) => expectSessionShown(entryOf(title, workflow), words, needsAttention);
  const sessionOf = new Map<string, string>();
  await launchEachQueuedStory(async (title, workflow) => {
    await launch(title, workflow);
    await shows(title, workflow, "Working", false);
    sessionOf.set(
      `${title} ${workflow}`,
      await sessionNamedBy(entryOf(title, workflow)),
    );
  });
  // Claude Code lists the story's session in this workflow anew.
  const becomes = (
    title: string,
    workflow: Workflow,
    ...change: [ClaudeSessionChange, string?]
  ) => {
    const session = sessionOf.get(`${title} ${workflow}`) ?? "?";
    dashboard.claudeSessionBecomes(session, ...change);
  };
  await expectCounted({});
  return {
    passOnePace,
    settled,
    show,
    launch,
    board,
    taken,
    card,
    entryOf,
    expectCounted,
    shows,
    becomes,
    queued: queuedStories,
  };
}
