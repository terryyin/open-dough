// A project added while the page is open is read as the first project is
// (./recently-done-progressive-after-sessions.spec.ts): the sessions the page
// already knows are the earlier projects', so no done record of the added
// project is read until the sessions read asked after its addition ends;
// once it answers, only the ten shown entries' stories are read, and when it
// cannot be read, the stories shown without sessions are. The machine's fake
// GitHub publishes each project's list (./recentlyDoneProgressive.ts) and the
// synthetic `claude` lists the added project's kept sessions under its
// checkout.

import type { Page } from "@playwright/test";
import { agentLaunchEndpoint } from "../src/launchRequest.ts";
import { parts } from "./dashboardPage.ts";
import { expectEntries } from "./recentlyDoneColumn.ts";
import {
  entryName,
  keepProgressiveSessions,
  progressiveEntries,
  publishedWithCatalog,
  repository,
  revision,
} from "./recentlyDoneProgressive.ts";
import { recordsAsked, settle } from "./recentlyDoneProgressivePage.ts";
import {
  entries,
  firstTen,
  shownWithoutSessions,
  storiesOf,
  thirteenth,
} from "./recentlyDoneSessionPlaced.ts";
import { holdSessionReads } from "./sessionStatePace.ts";
import { expect, test } from "./support/pageTest.ts";
import { publishes } from "./support/fakeGitHub.ts";
import {
  addedRepository,
  addedRevision,
  projectAddMachine,
} from "./support/projectAddMachine.ts";
import { addProjectThroughDialog } from "./support/projectAddPage.ts";

// The first project's list: three stories, no sessions.
const first = progressiveEntries(3, []);
// The added project's list is `entries` (./recentlyDoneSessionPlaced.ts).

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());

// Opens the page on the first project, its sessions read and its done
// stories shown, with the added project's list published and its sessions
// kept for the addition to find.
async function openedOnFirst(page: Page) {
  const server = await fixture.start("preview");
  const now = Date.now();
  server.github.serve(
    repository,
    publishes({ revision, files: publishedWithCatalog(now, first) }),
  );
  server.github.serve(
    addedRepository,
    publishes({
      revision: addedRevision,
      files: publishedWithCatalog(now, entries),
    }),
  );
  await keepProgressiveSessions(server, now, entries, undefined, {
    source: "sample-app",
    checkout: fixture.checkout,
  });
  await page.goto(server.baseURL);
  const recent = parts(page).recentlyDone;
  await expectEntries(recent, first.map(entryName));
  await expect(recent).not.toContainText("Reading sessions…");
  return {
    recent,
    asked: () => recordsAsked(server.github, addedRepository),
  };
}

test("while the sessions read asked after a project's addition is under way, no done record of the added project is read, and once it answers only the ten shown entries' stories are", async ({
  page,
}) => {
  const { recent, asked } = await openedOnFirst(page);
  const sessions = await holdSessionReads(page);
  try {
    await addProjectThroughDialog(page);
    // The added project's catalog answered: without its sessions, the
    // thirteenth entry is placed among the first ten.
    await expect(
      recent.getByRole("article", { name: thirteenth.identity }),
    ).toBeVisible();
    await expect(recent).toContainText("Reading sessions…");
    await settle(page);
    expect(asked()).toEqual([]);

    sessions.answer();
    await expectEntries(recent, firstTen.map(entryName));
    expect(asked().toSorted()).toEqual(storiesOf(firstTen).toSorted());
    await settle(page);
    expect(asked().toSorted()).toEqual(storiesOf(firstTen).toSorted());
  } finally {
    // A read still held would hold the page's teardown.
    sessions.answer();
  }
});

test("when the sessions read asked after a project's addition cannot be read, the ten done stories the added project shows without sessions are read, and none before it fails", async ({
  page,
}) => {
  const { recent, asked } = await openedOnFirst(page);
  let fail = () => {};
  const held = new Promise<void>((resolve) => {
    fail = resolve;
  });
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      if (route.request().method() !== "GET") return route.continue();
      await held;
      return route.abort("connectionrefused");
    },
  );
  try {
    await addProjectThroughDialog(page);
    await expect(
      recent.getByRole("article", { name: thirteenth.identity }),
    ).toBeVisible();
    await settle(page);
    expect(asked()).toEqual([]);

    fail();
    await expectEntries(recent, shownWithoutSessions.map(entryName));
    expect(asked().toSorted()).toEqual(
      storiesOf(shownWithoutSessions).toSorted(),
    );
  } finally {
    fail();
  }
});
