// A done card in Recently done holds every session this machine keeps for
// its story, open or marked done, newest first, each with the state and
// actions of its entry, and none of them is an entry of its own; a session
// launched after the story was done stays inside and does not move the card,
// a machine with no sessions for the story shows none, and once the record is
// older than the shared 30-day window its open session is its own entry
// again. The published records and kept sessions are ./recentlyDoneRecords.ts;
// that the column lists done cards by their facts is
// ./recently-done-stories.spec.ts. The fake GitHub only publishes files
// spelled by the shared done-record renderer; the synthetic `claude`
// (./fixtures/fake-claude) lists the kept sessions.

import { expect, test } from "./dashboardTest.ts";
import {
  expectMembership,
  parts,
  recentlyDoneSessionName,
  sessionStateOf,
} from "./dashboardPage.ts";
import { expectSessionEntrySetOff } from "./pageColours.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { keepLaunchRecords } from "./support/storyLaunchRecord.ts";
import {
  doneStorySessions,
  executed,
  expired,
  lastWeek,
  placed,
  publishedFiles,
  queuedTitle,
  removedQueued,
  repository,
  revision,
  withLastWeekRecordFiles,
} from "./recentlyDoneRecords.ts";
import {
  adHocEntry,
  expectEntries,
  listed,
  queuedEntry,
  sessionsOutsideDoneStories,
} from "./recentlyDoneColumn.ts";

test("a done story's card holds this machine's sessions for it, open or marked done, newest first, and a session of a record past the window is its own entry", async ({
  page,
  dashboard,
}) => {
  const now = Date.now();
  const listedAs = (title: string, before: number) =>
    listed(dashboard, now, title, before);
  // Kept oldest first, as the machine keeps them.
  await keepLaunchRecords(
    dashboard,
    [
      ...sessionsOutsideDoneStories(dashboard, now),
      ...doneStorySessions(now, {
        // Marked done and no longer listed by Claude Code.
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
    files: publishedFiles(withLastWeekRecordFiles(now)),
  });
  await page.goto("/");
  await expectMembership(page, { taken: [], backlog: [queuedTitle] });
  const { recentlyDone: recent } = parts(page);
  const card = (title: string) =>
    recent.getByRole("article", { name: title, exact: true });
  const sessionsIn = (title: string) =>
    card(title).getByRole("list", { name: "Sessions" }).getByRole("article");
  const executedOpen = recentlyDoneSessionName("Refinement", executed.title);
  const executedDone = recentlyDoneSessionName("Execution", executed.title);
  const lastWeekSession = recentlyDoneSessionName("Execution", lastWeek.title);
  const expiredSession = recentlyDoneSessionName("Execution", expired.title);

  await test.step("the done cards and the sessions of no shown done story make one newest-first list; a story done last week stays below today's entries though its session was launched yesterday, and the 31-day-old story's open session is its own entry", async () => {
    await expectEntries(recent, [
      adHocEntry,
      executed.title,
      queuedEntry,
      removedQueued.title,
      lastWeek.title,
      expiredSession,
    ]);
    await expect(card(expired.title)).toHaveCount(0);
    await expect(
      recent.getByRole("article", { name: expiredSession }),
    ).toHaveText(/Working/);
  });

  await test.step("Card shows avatar's open and done sessions are inside its card, newest first, with their states and actions, each set off on the panel in the card's text, and neither is an entry of its own", async () => {
    const inside = sessionsIn(executed.title);
    await expect(inside).toHaveCount(2);
    await expect(inside.nth(0)).toHaveAccessibleName(executedOpen);
    await expect(inside.nth(1)).toHaveAccessibleName(executedDone);
    await expect(sessionStateOf(inside.nth(0))).toHaveText("Working");
    await expect(sessionStateOf(inside.nth(1))).toHaveText("Done");
    await expect(inside.nth(0).getByRole("button")).toHaveText([
      "Open terminal",
    ]);
    await expect(inside.nth(1).getByRole("button")).toHaveCount(0);
    for (const entry of await inside.all())
      await expectSessionEntrySetOff(entry);
    for (const name of [executedOpen, executedDone]) {
      await expect(recent.getByRole("article", { name })).toHaveCount(1);
    }
  });

  await test.step("the session launched yesterday for the story done last week is inside that card", async () => {
    await expect(sessionsIn(lastWeek.title)).toHaveCount(1);
    await expect(sessionsIn(lastWeek.title)).toHaveAccessibleName(
      lastWeekSession,
    );
    await expect(
      recent.getByRole("article", { name: lastWeekSession }),
    ).toHaveCount(1);
  });

  await test.step("a done card of a story this machine keeps no sessions for shows none", async () => {
    await expect(sessionsIn(removedQueued.title)).toHaveCount(0);
  });
});
