// Observations of sessions launched from active story cards. The launch
// crosses the real page/boundary; expectations remember the returned native
// identity and check one column entry through published membership changes.
// Shared queued-card arrangement and blocked-Start observation live here so
// each published Preparing, Taken and no-list journey keeps its own facts.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import {
  expectMembership,
  storyCardSessionName,
  storyCardSessions,
  parts,
  sessionEntryShowing,
  sessionNamedBy,
} from "./dashboardPage.ts";
import { sessionAction } from "./support/sessionEntryDisclosure.ts";
import {
  notRefinedStory,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { openStoryColumnsJourney, type Workflow } from "./storyColumnsPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { openTerminalControl } from "./terminalScreenPage.ts";

export function storyCardSessionListing(
  page: Page,
  card: (title: string) => Locator,
  launch: (title: string, workflow: Workflow) => Promise<void>,
  titles: readonly string[],
) {
  const { board, recentlyDone: recent } = parts(page);
  const listed = new Map<
    string,
    { workflow: Workflow; session: string; key: string }[]
  >(titles.map((title) => [title, []]));
  const expectUnique = (key: string) =>
    Promise.all([
      expect(sessionEntryShowing(board, key)).toHaveCount(1),
      expect(sessionEntryShowing(recent, key)).toHaveCount(0),
    ]);
  const launchListed = async (title: string, workflow: Workflow) => {
    const entries = storyCardSessions(card(title));
    const before = await entries.count();
    await launch(title, workflow);
    await expect(entries).toHaveCount(before + 1);
    const newest = entries.first();
    await expect(newest).toHaveAccessibleName(storyCardSessionName(workflow));
    const key = (await newest.getAttribute("data-shows-session")) ?? "?";
    await expectUnique(key);
    listed.get(title)?.unshift({
      workflow,
      session: await sessionNamedBy(newest),
      key,
    });
  };
  // Every shown card lists exactly its own open sessions, newest first, each
  // once on the board and not in Recently done. Reading the settled page
  // changes nothing, so those checks run together; each entry's actions are
  // then opened and checked one entry at a time, as a person would.
  const expectListed = async (shownTitles: readonly string[] = titles) => {
    const shown = shownTitles.map((title) => ({
      entries: storyCardSessions(card(title)),
      own: listed.get(title) ?? [],
    }));
    await Promise.all(
      shown.map(({ entries, own }) => expect(entries).toHaveCount(own.length)),
    );
    const each = shown.flatMap(({ entries, own }) =>
      own.map((session, index) => ({ entry: entries.nth(index), ...session })),
    );
    await Promise.all(
      each.flatMap(({ entry, workflow, session, key }) => [
        expect(entry).toHaveAccessibleName(storyCardSessionName(workflow)),
        expect(entry).toContainText(`Session ${session}`),
        expect(entry).toContainText(`${workflow} started in Claude Code`),
        expect(openTerminalControl(entry)).toBeVisible(),
        expectUnique(key),
      ]),
    );
    for (const { entry } of each) {
      await expect(await sessionAction(entry, "Mark as done")).toBeVisible();
    }
  };
  return { listed, launchListed, expectListed };
}

export const queuedStories = [takenStory, readyStory, notRefinedStory];

// Opens origin's queued revision, every story in Backlog, with each launch
// answered as launched; `card` finds a story's card in whichever column
// shows it.
export async function openQueuedStoryCards(
  page: Page,
  dashboard: DashboardServer,
  columnsJourney: StoryColumnsJourney,
) {
  dashboard.claudeScenario("launched");
  const opened = await openStoryColumnsJourney(page, columnsJourney);
  const card = (title: string) =>
    parts(page).board.getByRole("article", { name: title, exact: true });
  await expectMembership(page, { taken: [], backlog: queuedStories });
  await opened.settled();
  return { ...opened, card };
}

// Launches, from the Backlog cards, an Execution on the ready and the
// not-refined story and a Refinement on takenStory, in that order; each
// launch is the caller's, which observes it.
async function launchEachQueuedStory(
  launch: (title: string, workflow: Workflow) => Promise<void>,
) {
  await launch(readyStory, "Execution");
  await launch(notRefinedStory, "Execution");
  await launch(takenStory, "Refinement");
}

// Opens the queued cards and launches on each (`launchEachQueuedStory`), each
// session listed on its own card as it is launched.
export async function launchOnEachQueuedCard(
  page: Page,
  dashboard: DashboardServer,
  columnsJourney: StoryColumnsJourney,
) {
  const opened = await openQueuedStoryCards(page, dashboard, columnsJourney);
  const listing = storyCardSessionListing(
    page,
    opened.card,
    opened.launch,
    queuedStories,
  );
  await launchEachQueuedStory(listing.launchListed);
  return { ...opened, ...listing };
}

// Matches an accessible description that contains this note word for word.
export const describedBy = (note: string) =>
  new RegExp(note.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

// Every Start on these cards is disabled and its description contains the
// caller's open-session note. Read together: checking a Start action changes
// nothing on the page.
export function expectStartsBlocked(
  action: (title: string, workflow: Workflow) => Locator,
  titles: readonly string[],
  note: string,
) {
  return Promise.all(
    titles.flatMap((title) =>
      (["Execution", "Refinement"] as const).flatMap((workflow) => [
        expect(action(title, workflow)).toBeDisabled(),
        expect(action(title, workflow)).toHaveAccessibleDescription(
          describedBy(note),
        ),
      ]),
    ),
  );
}
