// Scrolling Sessions-sidebar Recently done must not eagerly read older Board
// done-story details; Board keeps its own progressive range.
import { rem } from "../../dashboard/test-support/boardPage.ts";
import { expectEntries } from "../../dashboard/test-support/recentlyDoneColumn.ts";
import { entryName } from "../../dashboard/test-support/recentlyDoneProgressive.ts";
import {
  entries,
  firstTen,
  firstTenPaths,
} from "../../dashboard/test-support/recentlyDoneSessionPlaced.ts";
import {
  opened,
  recordsAsked,
} from "../../dashboard/test-support/recentlyDoneProgressivePage.ts";
import {
  preferShortRecentlyDoneBody,
  revealRecentlyDoneThrough,
} from "../../dashboard/test-support/recentlyDoneSessionsSidebarPaging.ts";
import { fortyFiveDoneSessions } from "../../dashboard/test-support/retainedDoneSessions.ts";
import {
  recentlyDoneHeightKey,
  showRecentlyDone,
} from "../../dashboard/test-support/recentlyDoneSessionsSidebarPage.ts";
import { recentlyDoneSessionsInitialLimit } from "../../dashboard/src/agentLaunch.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/cursorStart.ts";

test.use({
  projectFolders: ["open-dough", "doughnut", "pygardon"],
  cursorScreen: "working",
});

test("scrolling Recently done does not eagerly read older Board done-story details", async ({
  page,
  dashboard,
}) => {
  await test.step("Given a short Recently done sidebar", async () => {
    await page.setViewportSize({ width: 80 * rem, height: 900 });
    await preferShortRecentlyDoneBody(page, recentlyDoneHeightKey);
  });
  const { github, recent } =
    await test.step("And forty-five retained sessions on an older Done story", () => {
      const older = entries.at(-1);
      if (!older) throw new Error("Missing an older Done story.");
      return opened(page, dashboard, entries, {
        also: (now) =>
          fortyFiveDoneSessions(now, ["open-dough"], older.identity).records,
      });
    });
  await test.step("And the Board initially reads its latest ten stories", async () => {
    await expectEntries(recent, firstTen.map(entryName));
    expect(recordsAsked(github).toSorted()).toEqual(firstTenPaths);
  });
  const shown =
    await test.step("When the developer opens the sidebar's Recently done list", () =>
      showRecentlyDone(page));
  await test.step("Then the sidebar shows its initial page", () =>
    expect(shown.entries).toHaveCount(recentlyDoneSessionsInitialLimit));
  await test.step("When the developer scrolls to see more retained sessions", () =>
    revealRecentlyDoneThrough(shown, 40));
  await test.step("Then forty sessions are visible in the sidebar", () =>
    expect(shown.entries).toHaveCount(40));
  await test.step("And the Board still has read only its latest ten stories", () => {
    expect(recordsAsked(github).toSorted()).toEqual(firstTenPaths);
  });
});
