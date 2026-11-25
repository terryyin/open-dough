import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectMembership,
  parts,
  standaloneSessionName,
} from "../../dashboard/test-support/dashboardPage.ts";
import { publishCommittedFiles } from "../../dashboard/test-support/committedFiles.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { doneStorySessions } from "../../dashboard/test-support/recentlyDoneSessions.ts";
import { doneStories } from "../../dashboard/test-support/recentlyDoneRecords.ts";
import {
  expectEntries,
  listed,
  sessionsOutsideDoneStories,
} from "../../dashboard/test-support/recentlyDoneColumn.ts";

test("a session of a Done story outside the window creates no Recently done entry", async ({
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
          doneStories.executed.title,
          doneStories.executed.openSessionBefore,
        ),
        lastWeek: listedAs(
          doneStories.lastWeek.title,
          doneStories.lastWeek.sessionBefore,
        ),
        expired: listedAs(
          doneStories.expired.title,
          doneStories.expired.sessionBefore,
        ),
      }),
    ].sort(
      (one, other) => Date.parse(one.launchedAt) - Date.parse(other.launchedAt),
    ),
  );
  publishCommittedFiles(page, doneStories.publishedWithLastWeek(now));
  await page.goto("/");
  await expectMembership(page, {
    taken: [],
    backlog: [doneStories.queued.title],
  });
  const { recentlyDone: recent } = parts(page);
  const expiredSession = standaloneSessionName(
    "Execution",
    doneStories.expired.title,
  );
  await expectEntries(recent, [
    doneStories.executed.title,
    doneStories.removed.title,
    doneStories.lastWeek.title,
  ]);
  await expect(
    recent.getByRole("article", {
      name: doneStories.expired.title,
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    recent.getByRole("article", { name: expiredSession }),
  ).toHaveCount(0);
});
