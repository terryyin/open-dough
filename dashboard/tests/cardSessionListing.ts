// Observations of sessions launched from active story cards. The launch
// crosses the real page/boundary; expectations remember the returned native
// identity and check one column entry through published membership changes.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import {
  cardSessionName,
  cardSessions,
  parts,
  sessionNamedBy,
} from "./dashboardPage.ts";
import type { Workflow } from "./storyStagesPage.ts";

export function cardSessionListing(
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
  const expectUnique = async (key: string) => {
    await expect(
      page.locator(`.dashboard-columns [data-shows-session="${key}"]`),
    ).toHaveCount(1);
    await expect(recent.locator(`[data-shows-session="${key}"]`)).toHaveCount(
      0,
    );
  };
  const launchListed = async (title: string, workflow: Workflow) => {
    const entries = cardSessions(card(title));
    const before = await entries.count();
    await launch(title, workflow);
    await expect(entries).toHaveCount(before + 1);
    const newest = entries.first();
    await expect(newest).toHaveAccessibleName(cardSessionName(workflow));
    const key = (await newest.getAttribute("data-shows-session")) ?? "?";
    await expectUnique(key);
    listed.get(title)?.unshift({
      workflow,
      session: await sessionNamedBy(newest),
      key,
    });
  };
  const expectListed = async (shownTitles: readonly string[] = titles) => {
    for (const title of shownTitles) {
      const entries = cardSessions(card(title));
      const own = listed.get(title) ?? [];
      await expect(entries).toHaveCount(own.length);
      for (const [index, { workflow, session, key }] of own.entries()) {
        const entry = entries.nth(index);
        await expect(entry).toHaveAccessibleName(cardSessionName(workflow));
        await expect(entry).toContainText(`Session ${session}`);
        await expect(entry).toContainText(`${workflow} started in Claude Code`);
        await expect(
          entry.getByRole("button", { name: "Open terminal" }),
        ).toBeVisible();
        await expect(
          entry.getByRole("button", { name: "Mark as done" }),
        ).toBeVisible();
        await expectUnique(key);
      }
    }
  };
  return { listed, launchListed, expectListed };
}
