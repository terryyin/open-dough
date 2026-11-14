// The Recently done journeys' view of the column
// (../../e2e/stories/recently-done-stories.spec.ts, ./sessions/recently-done-story-sessions.spec.ts):
// the names of the sessions outside any done story, those sessions as the
// synthetic `claude` lists them, the column's own entries in order, and its
// two range actions. Its count is `columnCountOf` (./dashboardParts.ts).

import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { standaloneSessionName } from "./dashboardPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { at, placed, queuedTitle } from "./recentlyDoneRecords.ts";
import { keptSessions } from "./recentlyDoneSessions.ts";

export const adHocEntry = standaloneSessionName("Ad hoc", "Open Dough session");
export const queuedEntry = standaloneSessionName("Execution", queuedTitle);

// A session the synthetic `claude` lists, started `before` `now`.
export const listed = (
  dashboard: DashboardServer,
  now: number,
  name: string,
  before: number,
) =>
  dashboard.claudeListsSession({
    name,
    cwd: dashboard.home,
    startedAt: now - before,
  });

// This machine's ad hoc and queued story's sessions, listed by the synthetic
// `claude`; callers explicitly supply saved Done when testing retained closed entries.
export const sessionsOutsideDoneStories = (
  dashboard: DashboardServer,
  now: number,
  closed: { readonly adHoc?: boolean; readonly queued?: boolean } = {},
) =>
  keptSessions(
    now,
    {
      adHoc: listed(dashboard, now, "Open Dough session", placed.adHocLaunched),
      queued: listed(dashboard, now, queuedTitle, placed.queuedLaunched),
    },
    {
      ...(closed.adHoc && { adHoc: at(now, 30 * 60_000) }),
      ...(closed.queued && { queued: at(now, 30 * 60_000) }),
    },
  );

// The column's own entries, newest first: done cards and sessions of no
// shown done story, not the sessions inside a card.
export const shownEntries = (recent: Locator) =>
  recent.locator(":scope > ol > li > article");

// The column's own entries by accessible name.
export async function expectEntries(recent: Locator, names: readonly string[]) {
  const entries = shownEntries(recent);
  await expect(entries).toHaveCount(names.length);
  for (const [index, name] of names.entries()) {
    await expect(entries.nth(index)).toHaveAccessibleName(name);
  }
}

// The action after the shown entries that shows the next ten older ones, or
// says they are being read.
export const revealAction = (recent: Locator) =>
  recent.getByRole("button", { name: /older entr(y|ies)$|^Reading done/ });

// The action beside the heading, offered while more than ten entries show,
// that shows only the latest ten again.
export const showLatestAction = (recent: Locator) =>
  recent.getByRole("button", { name: "Show latest 10" });
