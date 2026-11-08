// How the attention journey (./sessions/agent-launch-attention.spec.ts) sees
// a story card's local attention apart from what origin publishes: sessions
// already open on the cards of a paused page, kept in the machine's launch
// store and listed by the synthetic `claude` before the page first reads
// them, the words each card counts, and a card's published facts without its
// local session presentation.

import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  agentAcceptEndpoint,
  agentContinueEndpoint,
  agentReconciledEndpoint,
  agentVerifyEndpoint,
} from "../src/launchOutcome.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
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
  openQueuedStoryCards,
  queuedStories,
} from "./storyCardSessionListing.ts";
import type { ClaudeSessionChange } from "./support/fakeClaude.ts";
import { keepProjectLaunchRecords } from "./support/storyLaunchRecord.ts";

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

// A Claude session already open on a story's card when the page opens: the
// project that keeps it, the story it works on, its workflow, and the state
// Claude Code lists it in.
export type OpenSession = {
  readonly project: string;
  readonly identity: string;
  readonly title: string;
  readonly workflow: Workflow;
  readonly state: ClaudeSessionChange;
};

// The Start requests a page sends for a launch, from acceptance through
// reconciliation.
const startEndpoints = new Set([
  agentAcceptEndpoint,
  agentContinueEndpoint,
  agentVerifyEndpoint,
  agentReconciledEndpoint,
]);

// Keeps each session's launch record, every project's in one store write, and
// lists it in the synthetic `claude` under the same native ID, in the order
// given, before the page reads the machine.
async function keepOpenSessions(
  dashboard: DashboardServer,
  sessions: readonly OpenSession[],
) {
  const now = Date.now();
  const byProject: Record<string, LaunchRecord[]> = {};
  const sessionOf = new Map<string, string>();
  sessions.forEach(({ project, identity, title, workflow, state }, index) => {
    const startedAt = now - (sessions.length - index) * 1_000;
    const sessionId = dashboard.claudeListsSession({
      name: title,
      cwd: path.join(dashboard.home, "git", project),
      startedAt,
    });
    if (state !== "working") dashboard.claudeSessionBecomes(sessionId, state);
    const story = { identity, title, source: project };
    const launch =
      workflow === "Execution"
        ? makeMe.aLaunchRecord.executing(story)
        : makeMe.aLaunchRecord.refining(story);
    (byProject[project] ??= []).push(
      launch
        .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) })
        .launchedAt(new Date(startedAt).toISOString())
        .please(),
    );
    sessionOf.set(`${title} ${workflow}`, sessionId);
  });
  await keepProjectLaunchRecords(dashboard, byProject);
  return sessionOf;
}

// Opens a paused page on the queued revision (./storyCardSessionListing.ts)
// with `sessions` already open, each Open Dough one shown on its card under
// its own native ID; nothing is started.
export async function openWithOpenSessions(
  page: Page,
  dashboard: DashboardServer,
  columnsJourney: StoryColumnsJourney,
  sessions: readonly OpenSession[],
) {
  const sessionOf = await keepOpenSessions(dashboard, sessions);
  const startsAsked: string[] = [];
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      startEndpoints.has(new URL(request.url()).pathname)
    )
      startsAsked.push(request.url());
  });
  await pausePageClockAt(page, new Date());
  const { passOnePace } = await watchRecordReads(page);
  const { settled, show, card } = await openQueuedStoryCards(
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
  const sessionIdOf = (title: string, workflow: Workflow) =>
    sessionOf.get(`${title} ${workflow}`) ?? "?";
  // The shown card's entry names the session kept for it, working as
  // listed when it was listed working.
  const expectOpen = async ({ title, workflow, state }: OpenSession) => {
    if (state === "working") await shows(title, workflow, "Working", false);
    expect(await sessionNamedBy(entryOf(title, workflow))).toBe(
      sessionIdOf(title, workflow),
    );
  };
  for (const session of sessions) {
    if (session.project === "open-dough") await expectOpen(session);
  }
  // Claude Code lists the story's session in this workflow anew.
  const becomes = (
    title: string,
    workflow: Workflow,
    ...change: [ClaudeSessionChange, string?]
  ) => {
    dashboard.claudeSessionBecomes(sessionIdOf(title, workflow), ...change);
  };
  // No Start was asked and no session launched: every session the journey
  // sees was open before the page.
  const expectNothingStarted = () => {
    expect(startsAsked).toEqual([]);
    expect(dashboard.claudeLaunchCalls()).toEqual([]);
  };
  return {
    passOnePace,
    settled,
    show,
    board,
    taken,
    card,
    entryOf,
    expectCounted,
    expectOpen,
    expectNothingStarted,
    shows,
    becomes,
    queued: queuedStories,
  };
}
