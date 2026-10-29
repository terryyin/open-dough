import { sessionActions } from "./support/sessionEntryDisclosure.ts";
// Only saved Done sessions are nested in done-story cards. Open former-story
// sessions stay local Taken; completion time orders cards, and local retention
// preserves a closed standalone session after its published card expires.

import { expect, test } from "./dashboardTest.ts";
import {
  expectMembership,
  parts,
  standaloneSessionName,
  sessionStateOf,
} from "./dashboardPage.ts";
import { expectSessionEntrySetOff } from "./pageColours.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { keepLaunchRecords } from "./support/storyLaunchRecord.ts";
import { doneStorySessions } from "./recentlyDoneSessions.ts";
import {
  executed,
  at,
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
  sessionsOutsideDoneStories,
} from "./recentlyDoneColumn.ts";

test("a done story's card holds this machine's sessions for it, marked done, newest first, and a session of a record past the window is its own entry", async ({
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
      ...sessionsOutsideDoneStories(dashboard, now, { adHoc: true }),
      {
        request: {
          source: "open-dough",
          workflow: "execution" as const,
          host: "claude" as const,
          ...executed,
        },
        session: {
          host: "claude" as const,
          sessionId: "newer-closed-card-session",
          shortId: "newer-cl",
          name: executed.title,
        },
        launchedAt: at(now, placed.adHocLaunched / 2),
        doneAt: at(now, placed.adHocLaunched / 4),
      },
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
  const executedOpen = standaloneSessionName("Refinement", executed.title);
  const executedDone = standaloneSessionName("Execution", executed.title);
  const lastWeekSession = standaloneSessionName("Execution", lastWeek.title);
  const expiredSession = standaloneSessionName("Execution", expired.title);

  await test.step("the done cards and the sessions of no shown done story make one newest-first list; a story done last week stays below today's entries though its session was launched yesterday, and the 31-day-old story's retained closed session is its own entry", async () => {
    await expectEntries(recent, [
      adHocEntry,
      executed.title,
      removedQueued.title,
      lastWeek.title,
      expiredSession,
    ]);
    await expect(card(expired.title)).toHaveCount(0);
    await expect(
      recent.getByRole("article", { name: expiredSession }),
    ).toHaveText(/Working/);
  });

  await test.step("Card shows avatar holds only its closed session; its open session remains local Taken, each preserving state and actions", async () => {
    const inside = sessionsIn(executed.title);
    await expect(inside).toHaveCount(2);
    await expect(inside.nth(0)).toHaveAttribute(
      "data-shows-session",
      "claude:newer-closed-card-session",
    );
    await expect(inside.nth(1)).toHaveAttribute(
      "data-shows-session",
      "claude:0e5c2d7a-done-session-of-card-shows-avatar",
    );
    for (const closed of await inside.all()) {
      await expect(closed).toHaveAccessibleName(executedDone);
      await expect(sessionStateOf(closed)).toHaveText("Done");
    }
    const local = parts(page).taken.getByRole("article", {
      name: executedOpen,
    });
    await expect(sessionStateOf(local)).toHaveText("Working");
    await expect(local.locator(".record-identity")).toHaveText(
      executed.identity,
    );
    await expect(
      local.getByRole("button", { name: "Open terminal", exact: true }),
    ).toBeVisible();
    await expect(
      local.getByRole("button", { name: "Session details", exact: true }),
    ).toHaveAttribute("aria-expanded", "false");
    await sessionActions(local);
    await expect(
      local.getByRole("button", { name: "Mark as done", exact: true }),
    ).toBeVisible();
    await expect(
      inside
        .first()
        .getByRole("button", { name: "Session details", exact: true }),
    ).toHaveAttribute("aria-expanded", "false");
    await expect(
      inside
        .first()
        .getByRole("button", { name: /Open terminal|More session actions/ }),
    ).toHaveCount(0);
    for (const entry of await inside.all())
      await expectSessionEntrySetOff(entry);
    await expect(
      recent.getByRole("article", { name: executedOpen }),
    ).toHaveCount(0);
    for (const name of [executedOpen, executedDone]) {
      await expect(
        page.locator(".board").getByRole("article", { name, exact: true }),
      ).toHaveCount(name === executedDone ? 2 : 1);
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
