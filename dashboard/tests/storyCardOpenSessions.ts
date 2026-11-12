// Sessions already open on the story cards of a paused page, kept in the
// machine's launch store and listed by the synthetic `claude` before the page
// first reads them, so a journey starts with them without replaying Start:
// the attention journeys (./sessions/agent-launch-attention.spec.ts and
// ./sessions/agent-launch-attention-taken.spec.ts) and the card session-state
// journey
// (./sessions/agent-launch-story-card-session-states.spec.ts). The production
// records reader joins the two, so listing failure and recovery stay real.

import path from "node:path";
import type { Page } from "@playwright/test";
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  agentAcceptEndpoint,
  agentContinueEndpoint,
  agentReconciledEndpoint,
  agentVerifyEndpoint,
} from "../src/launchOutcome.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  identityA,
  identityB,
} from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { expect, pausePageClockAt } from "./dashboardTest.ts";
import { parts, sessionNamedBy, storyCardSessionOf } from "./dashboardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { expectSessionShown, watchRecordReads } from "./sessionStatePace.ts";
import type { Workflow } from "./storyColumnsPage.ts";
import {
  openQueuedStoryCards,
  queuedStories,
} from "./storyCardSessionListing.ts";
import type { ClaudeSessionChange } from "./support/fakeClaude.ts";
import { keepLaunchStore } from "./support/launchStore.ts";

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

// Open Dough's three sessions, each working when the page opens on the
// Backlog: an Execution on the ready and the not-refined story and a
// Refinement on Story A.
export const openDoughWorkingSessions: readonly OpenSession[] = [
  {
    project: "open-dough",
    identity: identityB,
    title: readyStory,
    workflow: "Execution",
    state: "working",
  },
  {
    project: "open-dough",
    identity: notRefinedIdentity,
    title: notRefinedStory,
    workflow: "Execution",
    state: "working",
  },
  {
    project: "open-dough",
    identity: identityA,
    title: takenStory,
    workflow: "Refinement",
    state: "working",
  },
];

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
function keepOpenSessions(
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
  keepLaunchStore(dashboard, byProject);
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
  const sessionOf = keepOpenSessions(dashboard, sessions);
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
  const { settled, show, card, action } = await openQueuedStoryCards(
    page,
    dashboard,
    columnsJourney,
  );
  const { board, taken } = parts(page);
  const entryOf = (title: string, workflow: Workflow) =>
    storyCardSessionOf(card(title), workflow);
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
    action,
    entryOf,
    expectOpen,
    expectNothingStarted,
    shows,
    becomes,
    queued: queuedStories,
  };
}
