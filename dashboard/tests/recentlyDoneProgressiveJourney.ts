// The journeys onto a done entry beyond Recently done's first ten
// (./recently-done-progressive-navigation.spec.ts): 35 entries, newest first,
// whose 27th is an ad hoc session this machine keeps open, so Taken lists it
// until the developer marks it done, and a story among the entries before it
// whose record answers only once released. The publication and sessions are
// ./recentlyDoneProgressive.ts's; nothing here moves the session, chooses
// which entries show, or puts the keyboard anywhere.

import type { Locator, Page } from "@playwright/test";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { expectEntries, shownEntries } from "./recentlyDoneColumn.ts";
import {
  entryName,
  progressiveEntries,
  type ProgressiveEntry,
} from "./recentlyDoneProgressive.ts";
import {
  isRecord,
  opened,
  recordsAsked,
} from "./recentlyDoneProgressivePage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { holdingAnswer } from "./support/heldGitHubAnswer.ts";
import { idleBetweenSteps, markDoneAnyway } from "./support/markDone.ts";

export const destination = 27;
// The story before the destination whose record is held.
export const heldPlace = 25;
// The ad hoc sessions' places, the destination among them.
const sessionsAt = [2, 7, 11, 16, 23, destination, 29, 34];
export const entries = progressiveEntries(35, sessionsAt);

const at = (place: number): ProgressiveEntry => {
  const entry = entries[place - 1];
  if (entry === undefined) throw new Error(`No entry at ${String(place)}`);
  return entry;
};

export const storiesThrough = (to: number) =>
  entries
    .slice(0, to)
    .flatMap((entry) => (entry.kind === "story" ? [entry.path] : []));

export const names = (to: number) => entries.slice(0, to).map(entryName);

// Opens the page with the session at each of `open` kept open, the held
// story's record answering only once `release` is called, and `also` kept;
// `elsewhere` leaves the destination's place to a session `also` keeps.
export async function openedWithHeldStory(
  page: Page,
  dashboard: DashboardServer,
  {
    open = [destination],
    also,
    elsewhere = false,
  }: {
    readonly open?: readonly number[];
    readonly also?: (now: number) => readonly LaunchRecord[];
    readonly elsewhere?: boolean;
  } = {},
) {
  const held = at(heldPlace);
  if (held.kind !== "story") throw new Error("The held entry is no story.");
  let release: () => void = () => undefined;
  const list = elsewhere
    ? entries.filter(({ place }) => place !== destination)
    : entries;
  const view = await opened(page, dashboard, list, {
    open,
    ...(also === undefined ? {} : { also }),
    answering: (published) => {
      const holding = holdingAnswer(published, isRecord(held.path));
      release = holding.release;
      return holding.answer;
    },
  });
  const name = (place: number) => entryName(at(place));
  const taken = (place: number) =>
    parts(page).taken.getByRole("article", { name: name(place) });
  const idle = (place: number) => {
    const session = dashboard
      .claudeListing()
      .find((each) => String(each["name"]).endsWith(at(place).title));
    idleBetweenSteps(dashboard, String(session?.["sessionId"]));
  };
  return {
    ...view,
    release: () => {
      release();
    },
    heldCard: view.recent.getByRole("article", { name: held.identity }),
    // The session at `place` as Taken lists it while open, and as Recently
    // done does once done.
    taken,
    done: (place: number) =>
      view.recent.getByRole("article", { name: name(place) }),
    // Lets the synthetic `claude` take the session's done mark at once.
    idle,
    // Marks the open session at `place` done from `scope`, its Taken entry
    // unless given, once its mark is answered: Taken no longer lists it.
    markedDone: async (place: number, scope?: Locator) => {
      idle(place);
      await markDoneAnyway(scope ?? taken(place));
      await expect(taken(place)).toHaveCount(0, { timeout: 30_000 });
    },
  };
}

// While the held story's record is read: Recently done already lists every
// entry through the destination, in place, the held story under its
// identity, and has asked for exactly their records, the held one among
// them; the destination does not have the keyboard yet.
export async function expectThroughDestinationPending(
  github: Parameters<typeof recordsAsked>[0],
  recent: Locator,
  heldCard: Locator,
  arrived: Locator,
) {
  await expect(heldCard).toContainText("Reading done story…");
  await expect(shownEntries(recent)).toHaveCount(destination);
  await expect(arrived).toBeVisible();
  await expect(arrived).not.toBeFocused();
  await expect
    .poll(() => recordsAsked(github).toSorted())
    .toEqual(storiesThrough(destination).toSorted());
}

// Once released: every entry through the destination, named `arrived` when
// another session holds its place, is read, nothing older was asked for, and
// the list offers the eight older entries.
export async function expectThroughDestination(
  github: Parameters<typeof recordsAsked>[0],
  recent: Locator,
  arrived?: string,
) {
  const through = names(destination);
  await expectEntries(recent, [
    ...through.slice(0, -1),
    arrived ?? through.at(-1) ?? "",
  ]);
  await expect(recent).toContainText("Showing 27 of 35 entries.");
  await expect(recent.locator(".stage-count")).toHaveText("35 entries");
  expect(recordsAsked(github).toSorted()).toEqual(
    storiesThrough(destination).toSorted(),
  );
}
