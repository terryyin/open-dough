// The Done catalog places the stories before the local session answer. A
// held session read defers Done body reads until it answers or fails.

import { agentLaunchEndpoint } from "../../dashboard/src/launchRequest.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { expectEntries } from "../../dashboard/test-support/recentlyDoneColumn.ts";
import { holdSessionReads } from "../../dashboard/test-support/sessionStatePace.ts";
import { entryName } from "../../dashboard/test-support/recentlyDoneProgressive.ts";
import {
  opened,
  recordsAsked,
  untilPageRests,
} from "../../dashboard/test-support/recentlyDoneProgressivePage.ts";
import { untilPageReadsAnswered } from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  entries,
  firstTen,
  firstTenPaths,
  nestedIn,
  tenth,
} from "../../dashboard/test-support/recentlyDoneSessionPlaced.ts";

test("while the saved sessions are still being read after the done catalog answered, no done record is read, and once they answer only the ten shown entries' stories are", async ({
  page,
  dashboard,
}) => {
  const bodiesAsked: string[] = [];
  page.on("request", (request) => {
    const query = new URL(request.url()).searchParams;
    if (query.get("done") === "bodies") {
      bodiesAsked.push(...query.getAll("file"));
    }
  });
  const sessions = await holdSessionReads(page);
  try {
    const { github, recent } = await opened(page, dashboard, entries, {
      nestedIn,
    });
    await expect(recent).toContainText("Reading sessions…");
    await expect(
      recent.getByRole("article", { name: tenth.identity }),
    ).toBeVisible();
    await untilPageReadsAnswered(page);
    expect(bodiesAsked).toEqual([]);

    sessions.answer();
    await expectEntries(recent, firstTen.map(entryName));
    expect(recordsAsked(github).toSorted()).toEqual(firstTenPaths);
    await untilPageRests(page);
    expect(recordsAsked(github).toSorted()).toEqual(firstTenPaths);
  } finally {
    // A read still held would hold the page's teardown.
    sessions.answer();
  }
});

test("when the saved sessions cannot be read, the ten done stories shown without them are read", async ({
  page,
  dashboard,
}) => {
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      await (route.request().method() === "GET"
        ? route.abort("connectionrefused")
        : route.continue());
    },
  );
  const { github, recent } = await opened(page, dashboard, entries, {
    nestedIn,
  });
  await expectEntries(recent, firstTen.map(entryName));
  await expect(recent).toContainText("Reading sessions…");
  expect(recordsAsked(github).toSorted()).toEqual(firstTenPaths);
});
