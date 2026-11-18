// A marked-done session whose published done card is past the 30-day window
// stays a standalone Recently done entry. With the synthetic Claude host still
// listing it, that entry reads Working — a live-boundary reading Frontend
// substitutes cannot supply. Nesting of other done-story sessions lives in
// ../../dashboard/frontend-tests/sessions/recently-done-story-sessions.spec.ts.

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectMembership,
  parts,
  standaloneSessionName,
} from "../../dashboard/test-support/dashboardPage.ts";
import { publishFiles } from "../../dashboard/test-support/publishedOrigin.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { doneStorySessions } from "../../dashboard/test-support/recentlyDoneSessions.ts";
import {
  executed,
  expired,
  lastWeek,
  placed,
  publishedFiles,
  queuedTitle,
  removedQueued,
  repository,
  revision,
  withLastWeekRecord,
} from "../../dashboard/test-support/recentlyDoneRecords.ts";
import {
  adHocEntry,
  expectEntries,
  listed,
  sessionsOutsideDoneStories,
} from "../../dashboard/test-support/recentlyDoneColumn.ts";

test("a session of a done record past the window is its own Recently done entry and still reads Working while Claude lists it", async ({
  page,
  dashboard,
}) => {
  const now = Date.now();
  const listedAs = (title: string, before: number) =>
    listed(dashboard, now, title, before);
  keepLaunchRecords(
    dashboard,
    [
      ...sessionsOutsideDoneStories(dashboard, now, { adHoc: true }),
      ...doneStorySessions(now, {
        executedDone: "0e5c2d7a-done-session-of-card-shows-avatar",
        executedOpen: listedAs(
          executed.title,
          placed.executedOpenSessionLaunched,
        ),
        lastWeek: listedAs(lastWeek.title, placed.lastWeekSessionLaunched),
        expired: listedAs(expired.title, placed.expiredSessionLaunched),
      }),
    ].sort(
      (one, other) => Date.parse(one.launchedAt) - Date.parse(other.launchedAt),
    ),
  );
  await publishFiles(page, {
    repository,
    revision,
    files: publishedFiles(withLastWeekRecord(now)),
  });
  await page.goto("/");
  await expectMembership(page, { taken: [], backlog: [queuedTitle] });
  const { recentlyDone: recent } = parts(page);
  const expiredSession = standaloneSessionName("Execution", expired.title);
  await expectEntries(recent, [
    adHocEntry,
    executed.title,
    removedQueued.title,
    lastWeek.title,
    expiredSession,
  ]);
  await expect(
    recent.getByRole("article", { name: expired.title, exact: true }),
  ).toHaveCount(0);
  await expect(
    recent.getByRole("article", { name: expiredSession }),
  ).toHaveText(/Working/);
});
