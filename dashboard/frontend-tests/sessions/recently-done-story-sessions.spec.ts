// Only saved Done sessions are nested in done-story cards. Open former-story
// sessions stay local Taken; completion time orders cards, and local retention
// preserves a closed standalone session after its published card expires.
import {
  sessionAction,
  sessionActionsControl,
  sessionDetailsControl,
} from "../../test-support/support/sessionEntryDisclosure.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  expectMembership,
  parts,
  standaloneSessionName,
  sessionStateOf,
  storyCardSessions,
} from "../../test-support/dashboardPage.ts";
import { expectSessionEntrySetOff } from "../../test-support/pageColours.ts";
import {
  adHocEntry,
  expectEntries,
} from "../../test-support/recentlyDoneColumn.ts";
import {
  executed,
  expired,
  lastWeek,
  queuedTitle,
  removedQueued,
} from "../../test-support/recentlyDoneRecords.ts";
import { openFrontendStoryCardSessions } from "../../test-support/support/frontendRecentlyDoneStoryCards.ts";
import { openTerminalControl } from "../../test-support/terminalScreenPage.ts";

test("a done story's card holds this machine's sessions for it, marked done, newest first, and a session of a record past the window is its own entry", async ({
  page,
  frontendServices,
}) => {
  await openFrontendStoryCardSessions(page, frontendServices);
  await expectMembership(page, { taken: [], backlog: [queuedTitle] });
  const { recentlyDone: recent } = parts(page);
  const card = (title: string) =>
    recent.getByRole("article", { name: title, exact: true });
  const sessionsIn = (title: string) => storyCardSessions(card(title));
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
    // Live Claude Working for this standalone entry is
    // ../../../../e2e/sessions/recently-done-story-sessions-expired.spec.ts.
    await expect(
      recent.getByRole("article", { name: expiredSession }),
    ).toHaveCount(1);
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
    await expect(openTerminalControl(local)).toBeVisible();
    await expect(sessionDetailsControl(local)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(await sessionAction(local, "Mark as done")).toBeVisible();
    const closedFirst = inside.first();
    await expect(sessionDetailsControl(closedFirst)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(openTerminalControl(closedFirst)).toHaveCount(0);
    await expect(sessionActionsControl(closedFirst)).toHaveCount(0);
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
