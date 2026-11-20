// Done disclosure on an unfinished story card: collapsed count, expand and
// collapse for keyboard, and no control when the story holds no Done sessions.
import { createElement } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { newestFirst } from "../../src/recentlyDoneListing.ts";
import { SessionsOnPage, type PageSessions } from "../../src/pageSessions.ts";
import {
  StoryCardDoneSessions,
  storyDoneSessionsOf,
} from "../../src/StoryCardDoneSessions.tsx";
import { storyCardDoneClass } from "../../src/storyCardDone.ts";
import type { MachineSessions } from "../../src/agentLaunches.ts";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import { sessionKey } from "../../src/sessionReference.ts";
import type { CataloguedDoneRecord } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";

const sourceId = "open-dough";
const project = "Open Dough";
const identity = "SEED-414#review-done-sessions";
const title = "Review done sessions";
const otherIdentity = "SEED-900#other-story";

const pageSessions: PageSessions = {
  hostOperations: {
    claude: {
      attach: true,
      stop: false,
      doneStop: false,
      localDone: true,
      launchedSessions: true,
    },
  },
  presentTerminal: () => undefined,
  openSession: () => undefined,
  shownSession: undefined,
  markDone: () => Promise.resolve("marked" as const),
  markRead: () => Promise.resolve(true),
  deleteRecord: () => Promise.resolve({ kind: "deleted" as const }),
  recoverSession: () => Promise.resolve(undefined),
  stopSession: () => Promise.resolve(undefined),
};

function doneLaunch(
  sessionId: string,
  launchedAgoMs: number,
  story: { identity: string; title: string } = { identity, title },
  source = sourceId,
): LaunchWithState {
  const now = Date.now();
  const launchedAt = new Date(now - launchedAgoMs).toISOString();
  return {
    request: {
      source,
      host: "claude",
      workflow: "execution",
      identity: story.identity,
      title: story.title,
    },
    session: { host: "claude", sessionId },
    launchedAt,
    doneAt: new Date(now - launchedAgoMs / 2).toISOString(),
    sessionState: {
      kind: "available",
      availability: "retained",
      activity: "working",
    },
  } as LaunchWithState;
}

function openLaunch(sessionId: string): LaunchWithState {
  return {
    request: {
      source: sourceId,
      host: "claude",
      workflow: "execution",
      identity,
      title,
    },
    session: { host: "claude", sessionId },
    launchedAt: new Date().toISOString(),
    sessionState: {
      kind: "available",
      availability: "loaded",
      activity: "working",
    },
  } as LaunchWithState;
}

function catalogued(
  storyIdentity: string,
  completedAt: string,
): CataloguedDoneRecord {
  return {
    identity: storyIdentity,
    completedAt,
    fileName: `${storyIdentity}.md`,
    blob: "blob",
  };
}

function launchesOf(records: readonly LaunchWithState[]): MachineSessions {
  return { launched: records } as MachineSessions;
}

function disclosure() {
  return document.querySelector<HTMLDetailsElement>(
    `details.${storyCardDoneClass}`,
  );
}

function doneRows() {
  return [
    ...document.querySelectorAll<HTMLElement>(
      'ol[aria-label="Done history"] [data-shows-session]',
    ),
  ];
}

async function mountDisclosure(records: readonly LaunchWithState[]) {
  await mountComponent(
    createElement(
      SessionsOnPage,
      { value: pageSessions },
      createElement(StoryCardDoneSessions, {
        sourceId,
        project,
        identity,
        launches: launchesOf(records),
        storyCardAssignments: [],
      }),
    ),
  );
}

test("two Done sessions collapse to a count of two, expand into accessible rows, and collapse again under the disclosure", async () => {
  const older = doneLaunch("done-older", 120_000);
  const newer = doneLaunch("done-newer", 60_000);
  const open = openLaunch("still-open");
  const records = [older, newer, open];
  expect(storyDoneSessionsOf(records, sourceId, identity)).toHaveLength(2);
  await mountDisclosure(records);
  await expect.element(page.getByText("Done", { exact: true })).toBeVisible();
  await expect.poll(() => disclosure()).not.toBeNull();
  const control = disclosure();
  if (control === null) throw new Error("Done disclosure missing");
  expect(control.open).toBe(false);
  expect(control.textContent).toContain("2");
  expect(doneRows()).toHaveLength(2);
  const summary = control.querySelector("summary");
  if (summary === null) throw new Error("Done disclosure summary missing");
  await userEvent.click(summary);
  expect(disclosure()?.open).toBe(true);
  expect(
    doneRows().map((row) => row.getAttribute("data-shows-session")),
  ).toEqual([sessionKey(newer.session), sessionKey(older.session)]);
  const opened = disclosure();
  if (opened === null) throw new Error("Done disclosure missing after expand");
  const close = opened.querySelector("summary");
  if (close === null) throw new Error("Done disclosure summary missing");
  await userEvent.click(close);
  expect(disclosure()?.open).toBe(false);
  expect(document.activeElement).toBe(disclosure()?.querySelector("summary"));
});

test("a story with no Done sessions renders no disclosure", async () => {
  await mountDisclosure([openLaunch("only-open")]);
  await expect
    .element(page.getByText("Done", { exact: true }))
    .not.toBeInTheDocument();
  expect(disclosure()).toBeNull();
});

test("Board listing leaves unfinished-card Done sessions off published and standalone homes, and ignores another project's same story identity", () => {
  const onUnfinished = doneLaunch("unfinished-home", 90_000);
  const onDoneCard = doneLaunch("done-card-home", 80_000, {
    identity: otherIdentity,
    title: "Other story",
  });
  const standalone = doneLaunch("standalone-home", 70_000, {
    identity: "SEED-no-card#gone",
    title: "No card",
  });
  const otherProjectSameStory = doneLaunch(
    "foreign-home",
    60_000,
    { identity, title },
    "other-project",
  );
  const now = Date.now();
  const listed = newestFirst(
    [
      catalogued(identity, new Date(now - 50_000).toISOString()),
      catalogued(otherIdentity, new Date(now - 40_000).toISOString()),
    ],
    [onUnfinished, onDoneCard, standalone, otherProjectSameStory],
    sourceId,
    [identity],
  );
  const nestedKeys = listed.flatMap((each) =>
    "record" in each
      ? each.sessions.map((session) => sessionKey(session.session))
      : [],
  );
  const standaloneKeys = listed.flatMap((each) =>
    "record" in each ? [] : [sessionKey(each.session.session)],
  );
  expect(nestedKeys).toEqual([sessionKey(onDoneCard.session)]);
  expect(standaloneKeys).toEqual([
    sessionKey(otherProjectSameStory.session),
    sessionKey(standalone.session),
  ]);
  expect(standaloneKeys).not.toContain(sessionKey(onUnfinished.session));
  expect(nestedKeys).not.toContain(sessionKey(onUnfinished.session));
});
