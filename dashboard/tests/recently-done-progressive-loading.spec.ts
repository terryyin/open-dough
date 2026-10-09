// Recently done shows its first ten entries -- done stories by completion and
// saved Done sessions by launch, newest first, a story's nested sessions
// inside its card -- and reads only those stories' done records. One action
// after the shown entries names how many older entries remain and shows the
// next ten, or the rest, reading only their records, while the keyboard stays
// on it and the shown entries stay where they are; scrolling, resizing, and
// paging the columns read nothing. A failed older read keeps the shown list,
// says so, and its retry asks again only for what was not read. Fewer than
// ten entries, and none at all, read as before. Records wait for the saved
// sessions: ./recently-done-progressive-after-sessions.spec.ts.
// The fake GitHub publishes done records spelled by the shared renderer and
// the catalog the real backlog CLI's `catalog-done` builds from them
// (./recentlyDoneProgressive.ts); the synthetic `claude` lists the kept
// sessions. The local read boundary and the page decide everything shown,
// and the `gh` calls reaching the fake GitHub show which records were read.

import { expect, githubFor, test } from "./dashboardTest.ts";
import { edgeControl, rem, showColumn } from "./dashboardColumnsPage.ts";
import { expectEntries } from "./recentlyDoneColumn.ts";
import { noConnection } from "./originAnswers.ts";
import { answeringFirst, holdingAnswer } from "./support/heldGitHubAnswer.ts";
import { entryName, progressiveEntries } from "./recentlyDoneProgressive.ts";
import {
  isRecord,
  opened,
  recordsAsked,
  revealAction,
  settle,
  standing,
} from "./recentlyDoneProgressivePage.ts";

// 35 entries: seven ad hoc sessions marked done among 28 done stories; the
// story fourth in the list holds three sessions marked done.
const sessionsAt = [2, 7, 11, 16, 23, 29, 34];
const nestedIn = 4;
const entries = progressiveEntries(35, sessionsAt);
const stories = (from: number, to: number) =>
  entries
    .slice(from - 1, to)
    .flatMap((entry) => (entry.kind === "story" ? [entry.path] : []));
const names = (to: number) => entries.slice(0, to).map(entryName);
// Entries `from` to `to` before their stories' records are read: each story
// under its identity.
const placedAt = (from: number, to: number) =>
  entries
    .slice(from - 1, to)
    .map((entry) =>
      entry.kind === "story" ? entry.identity : entryName(entry),
    );
const storyAt = (place: number) => {
  const entry = entries[place - 1];
  if (entry?.kind !== "story") throw new Error(`No story at ${place}`);
  return entry;
};

test("35 entries show ten, and the reveal action shows ten more at a time, reading only their records, until all 35 show", async ({
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  // The thirteenth entry's record answers only once released.
  const heldPath = storyAt(13).path;
  let release: () => void = () => undefined;
  const { github, recent } = await opened(page, dashboard, entries, {
    nestedIn,
    answering: (published) => {
      const held = holdingAnswer(published, isRecord(heldPath));
      release = held.release;
      return held.answer;
    },
  });
  const action = revealAction(recent);

  await test.step("the first ten entries show newest first, a story's three sessions inside its card, and only their stories' records are read", async () => {
    await expectEntries(recent, names(10));
    await expect(
      recent
        .getByRole("article", { name: storyAt(nestedIn).title })
        .getByRole("list", { name: "Sessions" })
        .getByRole("article"),
    ).toHaveCount(3);
    await expect(recent.locator(".stage-count")).toHaveText("35 entries");
    await expect(recent).toContainText("Showing 10 of 35 entries.");
    await expect(action).toHaveText("Show 10 of 25 older entries");
    expect(recordsAsked(github).toSorted()).toEqual(stories(1, 10).toSorted());
  });

  await test.step("scrolling to the end of the shown entries, with all three columns shown, reads nothing and shows nothing more", async () => {
    await action.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 4000);
    await settle(page);
    await expectEntries(recent, names(10));
    expect(recordsAsked(github).toSorted()).toEqual(stories(1, 10).toSorted());
  });

  await test.step("resizing until Recently done is hidden, scrolling there, and paging the columns to it read nothing", async () => {
    await page.setViewportSize({ width: 40 * rem, height: 700 });
    // One column shows: Backlog, with Taken and Recently done beyond it.
    await expect(edgeControl(page, "Taken")).toBeVisible();
    await expect(recent).not.toBeInViewport();
    await page.mouse.wheel(0, 4000);
    await settle(page);
    await showColumn(page, "Recently done");
    await page.mouse.wheel(0, 4000);
    await settle(page);
    await page.setViewportSize({ width: 80 * rem, height: 900 });
    await settle(page);
    await expectEntries(recent, names(10));
    expect(recordsAsked(github).toSorted()).toEqual(stories(1, 10).toSorted());
    expect(
      github.calls.some(({ request }) => isRecord(heldPath)(request)),
    ).toBe(false);
  });

  await test.step("the action, from the keyboard, shows entries 11 to 20 in place, reads only their stories' records, and keeps the keyboard while the held one reads", async () => {
    await action.focus();
    const before = await standing(page, recent, 10);
    await page.keyboard.press("Enter");
    // The batch's stories hold their places under their identities while
    // their read, the held record among them, is under way.
    await expectEntries(recent, [...names(10), ...placedAt(11, 20)]);
    await expect(
      recent.getByRole("article", { name: storyAt(13).identity }),
    ).toContainText("Reading done story…");
    await expect(action).toHaveText("Reading done stories…");
    await expect(action).toBeFocused();
    expect(await standing(page, recent, 10)).toEqual(before);
    release();
    await expectEntries(recent, names(20));
    await expect(action).toHaveText("Show 10 of 15 older entries");
    await expect(action).toBeFocused();
    await expect(recent).toContainText("Showing 20 of 35 entries.");
    expect(recordsAsked(github).toSorted()).toEqual(stories(1, 20).toSorted());
  });

  await test.step("the next press shows 21 to 30, and the last the five oldest, after which every entry is said to show, each read once", async () => {
    await page.keyboard.press("Enter");
    await expectEntries(recent, names(30));
    await expect(action).toHaveText("Show the 5 older entries");
    await expect(action).toBeFocused();
    expect(recordsAsked(github).toSorted()).toEqual(stories(1, 30).toSorted());
    const before = await standing(page, recent, 30);
    await page.keyboard.press("Enter");
    await expectEntries(recent, names(35));
    const all = recent.getByText("All 35 entries are shown.");
    await expect(all).toBeFocused();
    await expect(revealAction(recent)).toHaveCount(0);
    expect(await standing(page, recent, 30)).toEqual(before);
    await expect(recent.locator(".stage-count")).toHaveText("35 entries");
    expect(recordsAsked(github).toSorted()).toEqual(stories(1, 35).toSorted());
  });
});

test("a failed older read keeps the first ten, says so with retry, and the retry asks GitHub again only for the record that failed", async ({
  page,
  dashboard,
}) => {
  // The oldest story among entries 11 to 20, read after the others there,
  // fails once.
  const failingPath = storyAt(20).path;
  const { github, recent } = await opened(page, dashboard, entries, {
    nestedIn,
    answering: (published) =>
      answeringFirst(published, isRecord(failingPath), noConnection),
  });
  const action = revealAction(recent);
  await expect(action).toHaveText("Show 10 of 25 older entries");
  await action.click();

  await expect(recent).toContainText("Done stories could not be read.");
  await expect(recent).toContainText(failingPath);
  await expectEntries(recent, [...names(10), ...placedAt(11, 20)]);
  await expect(
    recent.getByRole("article", { name: storyAt(20).identity }),
  ).toContainText("This done story could not be read.");
  await expect(recent.locator(".stage-count")).toHaveText("35 entries");
  await expect(action).toHaveText("Show 10 of 15 older entries");
  const failedAsked = recordsAsked(github).filter(
    (path) => path === failingPath,
  ).length;
  expect(failedAsked).toBeGreaterThan(0);

  await recent.getByRole("button", { name: "Retry done stories" }).click();
  await expectEntries(recent, names(20));
  await expect(recent).not.toContainText("could not be read");
  const asked = recordsAsked(github);
  expect(asked.filter((path) => path === failingPath)).toHaveLength(
    failedAsked + 1,
  );
  expect(asked.filter((path) => path !== failingPath).toSorted()).toEqual(
    stories(1, 20)
      .filter((path) => path !== failingPath)
      .toSorted(),
  );
});

test("six entries all show with no reveal action, and a project with no done entry keeps its empty state", async ({
  page,
  dashboard,
}) => {
  await test.step("six entries: all show, every story read, nothing more offered", async () => {
    const six = progressiveEntries(6, [2, 5]);
    const { github, recent } = await opened(page, dashboard, six, {
      nestedIn,
    });
    await expectEntries(recent, six.map(entryName));
    await expect(recent.locator(".stage-count")).toHaveText("6 entries");
    await expect(revealAction(recent)).toHaveCount(0);
    await expect(recent).not.toContainText(/Showing|are shown/);
    expect(recordsAsked(github).toSorted()).toEqual(
      six
        .flatMap((entry) => (entry.kind === "story" ? [entry.path] : []))
        .toSorted(),
    );
  });

  await test.step("no done record and no kept session: the existing empty state", async () => {
    const before = recordsAsked(githubFor(page)).length;
    const { github, recent } = await opened(page, dashboard, [], {
      at: "f8".repeat(20),
    });
    await expect(recent).toContainText(
      "No sessions launched from this dashboard are kept.",
    );
    await expect(recent.locator(".stage-count")).toHaveText("0 entries");
    await expect(revealAction(recent)).toHaveCount(0);
    await expect(recent.locator(":scope > ol")).toHaveCount(0);
    expect(recordsAsked(github).slice(before)).toEqual([]);
  });
});
