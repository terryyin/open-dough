// Queued cards and their session entries through published membership changes.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import {
  expectMembership,
  storyCardSessionName,
  storyCardSessions,
  parts,
  sessionEntryShowing,
} from "./dashboardPage.ts";
import { sessionAction } from "./support/sessionEntryDisclosure.ts";
import {
  notRefinedStory,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { openStoryColumnsJourney, type Workflow } from "./storyColumnsPage.ts";
import { openTerminalControl } from "./terminalScreenPage.ts";

export function storyCardSessionListing(
  page: Page,
  card: (title: string) => Locator,
  listed: ReadonlyMap<
    string,
    readonly { workflow: Workflow; session: string; key: string }[]
  >,
) {
  const { board, recentlyDone: recent } = parts(page);
  const expectUnique = (key: string) =>
    Promise.all([
      expect(sessionEntryShowing(board, key)).toHaveCount(1),
      expect(sessionEntryShowing(recent, key)).toHaveCount(0),
    ]);
  // Every shown card lists exactly its own open sessions, newest first, each
  // once on the board and not in Recently done. Reading the settled page
  // changes nothing, so those checks run together; each entry's actions are
  // then opened and checked one entry at a time, as a person would.
  return async (shownTitles: readonly string[] = [...listed.keys()]) => {
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
}

export const queuedStories = [takenStory, readyStory, notRefinedStory];

// Opens origin's queued revision, every story in Backlog; `card` finds its
// story in whichever column shows it.
export async function openQueuedStoryCards(
  page: Page,
  columnsJourney: StoryColumnsJourney,
) {
  const opened = await openStoryColumnsJourney(page, columnsJourney);
  const card = (title: string) =>
    parts(page).board.getByRole("article", { name: title, exact: true });
  await expectMembership(page, { taken: [], backlog: queuedStories });
  await opened.settled();
  return { ...opened, card };
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
