// The saved sessions decide which done stories Recently done's first ten
// entries hold, so no done record is read while the page's first read of the
// sessions is under way; once they answer, only the ten shown entries'
// stories are read, and when they cannot be read, the stories shown without
// them are. The fake GitHub publishes done records spelled by the shared
// renderer and the catalog the real backlog CLI's `catalog-done` builds from
// them (./recentlyDoneProgressive.ts); the synthetic `claude` lists the kept
// sessions. The `gh` calls reaching the fake GitHub show which records were
// read.

import { agentLaunchEndpoint } from "../src/launchRequest.ts";
import { expect, test } from "./dashboardTest.ts";
import { expectEntries } from "./recentlyDoneColumn.ts";
import { holdSessionReads } from "./sessionStatePace.ts";
import { entryName, progressiveEntries } from "./recentlyDoneProgressive.ts";
import { opened, recordsAsked, settle } from "./recentlyDoneProgressivePage.ts";

// 14 entries, ad hoc sessions at 2, 7 and 11: with them, the first ten hold
// eight stories; without them, the ten stories through the thirteenth entry.
const entries = progressiveEntries(14, [2, 7, 11]);
const storiesOf = (shown: typeof entries) =>
  shown.flatMap((entry) => (entry.kind === "story" ? [entry.path] : []));
const storiesOnly = entries.filter((entry) => entry.kind === "story");
const thirteenth = storiesOnly.find((entry) => entry.place === 13);
if (thirteenth === undefined) throw new Error("No story at 13");

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
    const { github, recent } = await opened(page, dashboard, entries);
    // The catalog answered: without the sessions, the thirteenth entry is
    // placed among the first ten.
    await expect(recent).toContainText("Reading sessions…");
    await expect(
      recent.getByRole("article", { name: thirteenth.identity }),
    ).toBeVisible();
    await settle(page);
    expect(bodiesAsked).toEqual([]);

    sessions.answer();
    const firstTen = entries.slice(0, 10);
    await expectEntries(recent, firstTen.map(entryName));
    expect(recordsAsked(github).toSorted()).toEqual(
      storiesOf(firstTen).toSorted(),
    );
    await settle(page);
    expect(recordsAsked(github).toSorted()).toEqual(
      storiesOf(firstTen).toSorted(),
    );
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
  const { github, recent } = await opened(page, dashboard, entries);
  const shown = storiesOnly.slice(0, 10);
  await expectEntries(recent, shown.map(entryName));
  await expect(recent).toContainText("Reading sessions…");
  expect(recordsAsked(github).toSorted()).toEqual(storiesOf(shown).toSorted());
});
