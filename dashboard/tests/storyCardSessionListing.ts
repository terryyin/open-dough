import { sessionActions } from "./support/sessionEntryDisclosure.ts";
// Observations of sessions launched from active story cards. The launch
// crosses the real page/boundary; expectations remember the returned native
// identity and check one column entry through published membership changes.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import {
  storyCardSessionName,
  storyCardSessions,
  parts,
  sessionNamedBy,
} from "./dashboardPage.ts";
import type { Workflow } from "./storyColumnsPage.ts";

export function storyCardSessionListing(
  page: Page,
  card: (title: string) => Locator,
  launch: (title: string, workflow: Workflow) => Promise<void>,
  titles: readonly string[],
) {
  const recent = parts(page).recentlyDone;
  const listed = new Map<
    string,
    { workflow: Workflow; session: string; key: string }[]
  >(titles.map((title) => [title, []]));
  const expectUnique = (key: string) =>
    Promise.all([
      expect(page.locator(`.board [data-shows-session="${key}"]`)).toHaveCount(
        1,
      ),
      expect(recent.locator(`[data-shows-session="${key}"]`)).toHaveCount(0),
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
        expect(
          entry.getByRole("button", { name: "Open terminal" }),
        ).toBeVisible(),
        expectUnique(key),
      ]),
    );
    for (const { entry } of each) {
      await expect(
        (await sessionActions(entry)).getByRole("button", {
          name: "Mark as done",
        }),
      ).toBeVisible();
    }
  };
  return { listed, launchListed, expectListed };
}
