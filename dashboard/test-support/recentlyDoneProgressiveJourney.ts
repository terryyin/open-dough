// Progressive Done reveals and native actions for sessions with published membership.

import type { Locator, Page } from "@playwright/test";
import path from "node:path";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { expect } from "./dashboardTest.ts";
import {
  parts,
  doneSessionEntriesOf,
  expandStoryCardDoneHistory,
  storyCardDoneDisclosure,
  storyCardSessions,
  sessionStateOf,
} from "./dashboardPage.ts";
import { queuedIdentity, queuedTitle } from "./recentlyDoneRecords.ts";
import { storyCard } from "./storyCardControls.ts";
import { showRecentlyDone } from "./recentlyDoneSessionsSidebarPage.ts";
import {
  entryName,
  placedAt,
  progressiveStories,
} from "./recentlyDoneProgressive.ts";
import { isRecord, opened } from "./recentlyDoneProgressivePage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import type { ProgressiveHistory } from "./recentlyDoneRefresh.ts";
import { holdingAnswer } from "./support/heldGitHubAnswer.ts";
import { idleBetweenSteps, markDoneAnyway } from "./support/markDone.ts";

export const destination = 27;
// The story before the destination whose record is held.
export const heldPlace = 25;
// A published Done card can be revealed by its own retained native session.
const publishedStories = progressiveStories(35);
export const publishedNames = (to: number) =>
  publishedStories.slice(0, to).map(entryName);
export const publishedPaths = (to: number) =>
  publishedStories.slice(0, to).map(({ path }) => path);

export async function openedWithHeldPublishedStory(
  page: Page,
  dashboard: DashboardServer,
  afterGitHubStops: ProgressiveHistory["afterGitHubStops"],
  sessionTitle: string,
  cursor?: LaunchRecord,
  later: ProgressiveHistory["later"] = {},
) {
  const story = publishedStories[destination - 1];
  const held = publishedStories[heldPlace - 1];
  if (story === undefined || held === undefined)
    throw new Error("The published destination or held story is missing.");
  const nativeCursor = cursor?.session;
  if (nativeCursor !== undefined && nativeCursor.host !== "cursor")
    throw new Error("The retained running session must be Cursor.");
  let release: () => void = () => undefined;
  const view = await opened(page, dashboard, publishedStories, {
    history: { afterGitHubStops, later },
    also: (now) => {
      const launchedAt = placedAt(now, destination);
      const request = makeMe.aLaunchRecord.executing({
        identity: story.identity,
        title: sessionTitle,
      });
      return [
        (nativeCursor === undefined
          ? request.inClaudeSession({
              sessionId: dashboard.claudeListsSession({
                name: sessionTitle,
                cwd: dashboard.home,
                startedAt: Date.parse(launchedAt),
              }),
            })
          : request.inCursorSession({
              sessionId: nativeCursor.sessionId,
              continuation: {
                workspace: nativeCursor.continuation.workspace,
                args: nativeCursor.continuation.args,
                ...(nativeCursor.continuation.configScope === undefined
                  ? {}
                  : { configScope: nativeCursor.continuation.configScope }),
              },
            })
        )
          .launchedAt(launchedAt)
          .markedDoneAt(new Date(now - 10 * 60_000).toISOString())
          .please(),
      ];
    },
    answering: (published) => {
      const holding = holdingAnswer(published, isRecord(held.path));
      release = holding.release;
      return holding.answer;
    },
  });
  const heldCard = view.recent.getByRole("article", { name: held.identity });
  const pendingDestination = view.recent.getByRole("article", {
    name: story.identity,
    exact: true,
  });
  const destinationCard = view.recent.getByRole("article", {
    name: story.title,
    exact: true,
  });
  return {
    ...view,
    release: () => {
      release();
    },
    heldCard,
    async showsPendingDestination() {
      await expect(heldCard).toContainText("Reading done story…");
      await expect(pendingDestination).toBeVisible();
    },
    destinationCard,
    destinationEntry: pendingDestination.or(destinationCard),
    chooseSession: async () => {
      const sidebar = await showRecentlyDone(page);
      const row = sidebar.select(sessionTitle);
      await row.click();
      return row;
    },
  };
}

// The real Git publication keeps this session's story Taken while native Done
// moves the session into the card's own history.
export async function openedWithTakenNativeSession(
  page: Page,
  dashboard: DashboardServer,
  afterGitHubStops: ProgressiveHistory["afterGitHubStops"],
  retiredWorkspace = false,
) {
  const held = publishedStories[heldPlace - 1];
  if (held === undefined) throw new Error("The held story is missing.");
  let sessionId = "";
  let release: () => void = () => undefined;
  const view = await opened(page, dashboard, publishedStories, {
    history: { afterGitHubStops, later: {} },
    workspaceTaken: true,
    also: (now) => {
      const launchedAt = placedAt(now, destination);
      sessionId = dashboard.claudeListsSession({
        name: queuedTitle,
        cwd: dashboard.home,
        startedAt: Date.parse(launchedAt),
      });
      const story = { identity: queuedIdentity, title: queuedTitle };
      const launch = makeMe.aLaunchRecord;
      const request = retiredWorkspace
        ? launch.refining(story).onStoryBranch({
            workspace: path.join(dashboard.home, "retired-workspace"),
            branch: "story/workspace-retired",
          })
        : launch.executing(story);
      const previous = makeMe.aLaunchRecord
        .executing(story)
        .inClaudeSession({ sessionId: "previous-done" })
        .launchedAt(placedAt(now, destination + 1))
        .markedDoneAt(launchedAt)
        .please();
      return [
        previous,
        request.inClaudeSession({ sessionId }).launchedAt(launchedAt).please(),
      ];
    },
    answering: (published) => {
      const holding = holdingAnswer(published, isRecord(held.path));
      release = holding.release;
      return holding.answer;
    },
  });
  const card = storyCard(parts(page).taken, queuedTitle);
  const activeSession = storyCardSessions(card);
  const doneSession = doneSessionEntriesOf(page, queuedTitle).first();
  return {
    ...view,
    card,
    activeSession,
    heldCard: view.recent.getByRole("article", { name: held.identity }),
    release: () => {
      release();
    },
    markDone: async (scope: Locator = activeSession) => {
      idleBetweenSteps(dashboard, sessionId);
      await markDoneAnyway(scope);
    },
    showDoneHistory: () => expandStoryCardDoneHistory(card),
    doneSession,
    async showsCollapsedDoneHistory() {
      await expect(storyCardDoneDisclosure(card)).not.toHaveAttribute("open");
      await expect(doneSession).toBeAttached();
      await expect(doneSession).toBeHidden();
    },
    async showsFocusedDoneSession() {
      await expect(activeSession).toHaveCount(0);
      await expect(doneSession).toBeFocused();
      await expect(sessionStateOf(doneSession)).toHaveText("Done");
    },
  };
}
