// The Recently done journeys' view of the column
// (./recently-done-stories.spec.ts, ./recently-done-story-sessions.spec.ts):
// the names of the sessions outside any done story, those sessions as the
// synthetic `claude` lists them, and the column's own entries in order.

import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { recentlyDoneSessionName } from "./dashboardPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { placed, queuedTitle } from "./recentlyDoneRecords.ts";
import { keptSessions } from "./recentlyDoneSessions.ts";

export const adHocEntry = recentlyDoneSessionName(
  "Ad hoc",
  "Open Dough session",
);
export const queuedEntry = recentlyDoneSessionName("Execution", queuedTitle);

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
// `claude`.
export const sessionsOutsideDoneStories = (
  dashboard: DashboardServer,
  now: number,
) =>
  keptSessions(now, {
    adHoc: listed(dashboard, now, "Open Dough session", placed.adHocLaunched),
    queued: listed(dashboard, now, queuedTitle, placed.queuedLaunched),
  });

// The column's own entries, newest first, by accessible name: done cards and
// sessions of no shown done story, not the sessions inside a card.
export async function expectEntries(recent: Locator, names: readonly string[]) {
  const entries = recent.locator(":scope > ol > li > article");
  await expect(entries).toHaveCount(names.length);
  for (const [index, name] of names.entries()) {
    await expect(entries.nth(index)).toHaveAccessibleName(name);
  }
}
