// Done disclosure on an unfinished story card: collapsed count, expand and
// collapse for keyboard, and no control when the story holds no Done sessions.
import { createElement } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { SessionsOnPage, type PageSessions } from "../../src/pageSessions.ts";
import { StoryCardDoneSessions } from "../../src/StoryCardDoneSessions.tsx";
import { storyCardDoneClass } from "../../src/storyCardDone.ts";
import type { MachineSessions } from "../../src/agentLaunches.ts";
import { isOpen, type LaunchWithState } from "../../src/agentLaunch.ts";
import { sessionKey } from "../../src/sessionReference.ts";

const sourceId = "open-dough";
const project = "Open Dough";
const identity = "SEED-414#review-done-sessions";
const title = "Review done sessions";

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

function doneLaunch(sessionId: string, launchedAgoMs: number): LaunchWithState {
  const now = Date.now();
  const launchedAt = new Date(now - launchedAgoMs).toISOString();
  return {
    request: {
      source: sourceId,
      host: "claude",
      workflow: "execution",
      identity,
      title,
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
        sessions: records.filter((record) => !isOpen(record)),
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
