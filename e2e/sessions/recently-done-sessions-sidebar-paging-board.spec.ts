// Scrolling Sessions-sidebar Recently done must not eagerly read older Board
// done-story details; Board keeps its own progressive range.
import { rem } from "../../dashboard/tests/boardPage.ts";
import { expectEntries } from "../../dashboard/tests/recentlyDoneColumn.ts";
import {
  names,
  openedWithHeldStory,
  storiesThrough,
} from "../../dashboard/tests/recentlyDoneProgressiveJourney.ts";
import { recordsAsked } from "../../dashboard/tests/recentlyDoneProgressivePage.ts";
import {
  fortyFiveDoneSessions,
  preferShortRecentlyDoneBody,
  revealRecentlyDoneThrough,
} from "../../dashboard/tests/recentlyDoneSessionsSidebarPaging.ts";
import {
  recentlyDoneHeightKey,
  showRecentlyDone,
} from "../../dashboard/tests/recentlyDoneSessionsSidebarPage.ts";
import { recentlyDoneSessionsInitialLimit } from "../../dashboard/src/agentLaunch.ts";
import { expect, test } from "../../dashboard/tests/support/cursorStart.ts";

test.use({
  projectFolders: ["open-dough", "doughnut", "pygardon"],
  cursorScreen: "working",
});

test("scrolling Recently done does not eagerly read older Board done-story details", async ({
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  await preferShortRecentlyDoneBody(page, recentlyDoneHeightKey);
  // Place the forty-five machine Dones older than Board's progressive entries
  // so the Board's first ten stay the published stories already read.
  const hour = 60 * 60_000;
  const view = await openedWithHeldStory(page, dashboard, {
    open: [],
    also: (now) =>
      fortyFiveDoneSessions(now - 40 * hour, ["open-dough"]).records,
  });
  try {
    const { github, recent } = view;
    await expectEntries(recent, names(10));
    expect(recordsAsked(github).toSorted()).toEqual(
      storiesThrough(10).toSorted(),
    );
    const shown = await showRecentlyDone(page);
    await expect(shown.entries).toHaveCount(recentlyDoneSessionsInitialLimit);
    const before = recordsAsked(github).length;
    await revealRecentlyDoneThrough(shown, 40);
    await expect(shown.entries).toHaveCount(40);
    expect(recordsAsked(github)).toHaveLength(before);
    expect(recordsAsked(github).toSorted()).toEqual(
      storiesThrough(10).toSorted(),
    );
  } finally {
    view.release();
  }
});
