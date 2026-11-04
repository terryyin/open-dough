// Helpers for Board revision-stream journeys (./revision-stream*.spec.ts):
// pages that opt out of the fixture's pre-held slots, with the server pace
// lowered, so they hold EventSource delivery instead of recurring `since`
// checks. Stream ticks run on wall time; the page clock stays paused for
// check-delivery pages in the same context.

import type { Page, Request } from "@playwright/test";
import { githubFor, pausePageClockAt } from "./dashboardTest.ts";
import { expectOwnersNotRecorded, expectSettledPage } from "./dashboardPage.ts";
import {
  pausePageClock,
  recordsAt,
  setPageVisibility,
} from "./autoRefreshJourney.ts";
import { revisionStreamAtParameter } from "../src/authenticatedReadRules.ts";
import { backlogA, revisionA, titlesOfA } from "./refreshJourney.ts";
import { publishMovingOrigin, type MovingOrigin } from "./publishedOrigin.ts";
import type { GhCall } from "./support/fakeGitHub.ts";

// Server pace for stream journeys; wall-clock ticks, not page time.
export const streamPaceMs = 80;

export const streamServerEnv = {
  DOUGH_REVISION_STREAM_MS: String(streamPaceMs),
} as const;

export function isRevisionStream(url: string): boolean {
  return new URL(url).searchParams.has(revisionStreamAtParameter);
}

// Waits until this page has opened a revision stream for `at`.
export async function untilStreamingAt(
  page: Page,
  at: string,
): Promise<Request> {
  return page.waitForRequest(
    (request) => {
      if (!isRevisionStream(request.url())) {
        return false;
      }
      return (
        new URL(request.url()).searchParams.get(revisionStreamAtParameter) ===
        at
      );
    },
    { timeout: 15_000 },
  );
}

// Wall time until the fake GitHub has seen at least `count` further
// matching-refs after `from`, or until `timeoutMs`.
export async function untilMatchingRefsSince(
  page: Page,
  from: number,
  count: number,
  timeoutMs = 10_000,
): Promise<number> {
  const started = Date.now();
  for (;;) {
    const seen = githubFor(page)
      .calls.slice(from)
      .filter(({ request }) => request.kind === "matching-refs").length;
    if (seen >= count) {
      return seen;
    }
    if (Date.now() - started > timeoutMs) {
      throw new Error(
        `Expected at least ${String(count)} matching-refs after call ${String(from)}; saw ${String(seen)}.`,
      );
    }
    await page.waitForTimeout(streamPaceMs);
  }
}

export function matchingRefsSince(page: Page, from: number): number {
  return githubFor(page)
    .calls.slice(from)
    .filter(({ request }) => request.kind === "matching-refs").length;
}

export function callsSince(page: Page, from: number): readonly GhCall[] {
  return githubFor(page).calls.slice(from);
}

// Opens a settled Board at A with free stream slots and a lowered server pace.
// The stream opens as the snapshot settles, so wait for it from before
// navigation rather than after.
export async function openStreamingAtA(page: Page): Promise<MovingOrigin> {
  await pausePageClock(page);
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA, recordsAt("A"));
  const streaming = untilStreamingAt(page, revisionA);
  await page.goto("/");
  await expectSettledPage(page, titlesOfA);
  await expectOwnersNotRecorded(page);
  await streaming;
  return origin;
}

// A second tab of the same browser on the same Board, already streaming at A.
export async function openSecondStreamingAtA(page: Page): Promise<Page> {
  const other = await page.context().newPage();
  await pausePageClockAt(other, new Date("2026-09-23T09:00:00.000Z"));
  const streaming = untilStreamingAt(other, revisionA);
  await other.goto("/");
  await expectSettledPage(other, titlesOfA);
  await expectOwnersNotRecorded(other);
  await streaming;
  return other;
}

export {
  publishMovingOrigin,
  recordsAt,
  setPageVisibility,
  backlogA,
  revisionA,
  titlesOfA,
};
