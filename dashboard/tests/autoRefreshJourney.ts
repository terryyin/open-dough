// The auto-refresh journey's published records, its paused page clock, and
// what it observes of the `gh` calls behind the page: see
// ../../e2e/observation/auto-refresh.spec.ts.

import { expect, type Page } from "@playwright/test";
import { renderStorySection } from "../../tests/support/published-seed.mjs";
import { githubFor, pausePageClockAt } from "./dashboardTest.ts";
import { expectOwnersNotRecorded, expectSettledPage } from "./dashboardPage.ts";
import { headsEtag } from "./originAnswers.ts";
import { isHeadsCheck } from "./originObservation.ts";
import { publishMovingOrigin, type MovingOrigin } from "./publishedOrigin.ts";
import {
  backlogA,
  claimsEntry,
  dashboardEntry,
  queueEntry,
  queueStory,
  revisionA,
  titlesOfA,
  workspaceEntry,
} from "./refreshJourney.ts";
import {
  givePageItsTurns,
  isCheck,
  untilPageReadsAnswered,
  untilPageRequestsAnswered,
  whileNotingChecks,
} from "./pageRequestNotes.ts";
import type { GhCall } from "./support/fakeGitHub.ts";

export { queueStory };
const opened = new Date("2026-09-23T09:00:00.000Z");

// The records the refresh journey's backlogs name, with a Goal that says at
// which commit it was published, so a detail can only come from one.
export function recordsAt(label: string): Record<string, string> {
  const section = (entry: { identity: string; title: string; href: string }) =>
    renderStorySection(entry, {
      goal: `${entry.title}, as published at ${label}.`,
    });
  return {
    ".planning/seeds/SEED-021-progress.md": `# Progress\n\n${section(dashboardEntry)}`,
    ".planning/seeds/SEED-008-sync.md": `# Sync\n\n${section(workspaceEntry)}\n${section(queueEntry)}`,
    ".planning/seeds/SEED-040-claims.md": `# Claims\n\n${section(claimsEntry)}`,
    ".planning/slice-plans/059-installer-update-report/PLAN.md": `# Repair the installer's update report\n\nWhole-document correction home, as published at ${label}.\n`,
  };
}

// The `gh` calls behind this page after the first `from` of them.
export function callsSince(page: Page, from: number): readonly GhCall[] {
  return githubFor(page).calls.slice(from);
}

export function contentReads(calls: readonly GhCall[]): string[] {
  return calls.flatMap(({ request }) =>
    request.kind === "content"
      ? [`${request.path}?ref=${request.revision}`]
      : [],
  );
}

// Pauses the page clock before the page opens, so page time passes only when
// a step lets it, as passTimeUntilAsked and passTimeUntilChecked do.
export async function pausePageClock(page: Page): Promise<void> {
  await pausePageClockAt(page, opened);
}

// Opens the page at A with its clock paused, and waits until the whole
// snapshot, detail included, has been read.
export async function openSettledAtA(page: Page): Promise<MovingOrigin> {
  await pausePageClock(page);
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA, recordsAt("A"));
  await page.goto("/");
  await expectSettledPage(page, titlesOfA);
  // Preparation no longer implies that the independent profiles are read.
  // This fixture publishes no assignments; its read owners establish the
  // settled starting point for schedule and request-count observations.
  await expectOwnersNotRecorded(page);
  return origin;
}

// The argv of one check of a repository's `main` (Open Dough's unless
// another is named), which lists every published branch head: conditional on
// the entity tag of the listing that named `known` as `main`'s head and
// `branches` beside it, once there is one.
export function headsCheckArgv(
  known?: string,
  repository = "terryyin/open-dough",
  branches: Readonly<Record<string, string>> = {},
): readonly string[] {
  return [
    "api",
    "--include",
    ...(known === undefined
      ? []
      : ["-H", `If-None-Match: ${headsEtag({ ...branches, main: known })}`]),
    `repos/${repository}/git/matching-refs/heads/`,
  ];
}

// Page time passes in steps this small; a check is seen once the step in
// which the page asked for it has passed. One extra step after a silence
// bound lets an armed deadline callback run under the paused clock.
export const pageTimeStepMs = 250;

async function passPageMsInSteps(
  page: Page,
  ms: number,
  afterEachStep: () => Promise<void>,
): Promise<void> {
  for (let passed = 0; passed < ms; passed += pageTimeStepMs) {
    await page.clock.runFor(Math.min(pageTimeStepMs, ms - passed));
    await afterEachStep();
  }
}

// Advances the page clock in small steps so timers armed for `ms` of page
// time can fire (silence, reopen, rate-limit waits) without waiting wall time.
export async function passPageMs(page: Page, ms: number): Promise<void> {
  await passPageMsInSteps(page, ms, async () => {});
}

// Lets `ms` of page time pass in the same small steps, each followed, with
// page time standing still, by the answers to whatever the page asked
// meanwhile, so the page schedules its next ask from a settled one as it
// would in real time.
export async function passPageMsAnswered(
  page: Page,
  ms: number,
): Promise<void> {
  await passPageMsInSteps(page, ms, () => untilPageRequestsAnswered(page));
}

// Lets page time pass in small steps until the page asks for the next
// revision check, without waiting for its answer. Says how much page time
// passed before the check was asked.
export async function passTimeUntilAsked(page: Page): Promise<number> {
  return whileNotingChecks(page, async (askedAfter) => {
    for (let passed = 0; passed <= 60_000; passed += pageTimeStepMs) {
      await page.clock.runFor(pageTimeStepMs);
      const [first] = await askedAfter();
      if (first !== undefined) {
        return first;
      }
    }
    throw new Error("No revision check was made within a minute.");
  });
}

// Settles outstanding detail reads before passing page time: advancing time
// inside a detail's wait bound arms recovery that suspends revision checks.
// Says how much page time passed before the next check was asked.
export async function passTimeUntilChecked(
  page: Page,
  answeredWith: 200 | 502 = 200,
): Promise<number> {
  await untilPageReadsAnswered(page);
  return passTimeUntilCheckedWhileReadsOutstanding(page, answeredWith);
}

// Lets page time pass while reads stay outstanding until the page asks for
// its next revision check. Then, with page time standing still so nothing
// the check starts can time out, waits for the check's whole body to answer,
// successfully unless the boundary is expected to report a failed check (502).
export async function passTimeUntilCheckedWhileReadsOutstanding(
  page: Page,
  answeredWith: 200 | 502 = 200,
): Promise<number> {
  const answer = page.waitForResponse((response) => isCheck(response.url()));
  const passed = await passTimeUntilAsked(page);
  const response = await answer;
  expect(response.status()).toBe(answeredWith);
  await response.body();
  return passed;
}

// Lets `ms` of page time pass in the same small steps, then waits, with page
// time standing still, until every request the page sent meanwhile is
// answered, and says how many revision checks it asked for.
export async function checksAskedWhilePassing(
  page: Page,
  ms: number,
): Promise<number> {
  return whileNotingChecks(page, async (askedAfter) => {
    for (let passed = 0; passed < ms; passed += pageTimeStepMs) {
      await page.clock.runFor(pageTimeStepMs);
    }
    await untilPageRequestsAnswered(page);
    return (await askedAfter()).length;
  });
}

// A check asked after this much page time is on the steady 15-second pace,
// within one step of it.
export function expectSteadyPace(passed: number): void {
  expect(passed).toBeGreaterThanOrEqual(15_000);
  expect(passed).toBeLessThanOrEqual(15_000 + pageTimeStepMs);
}

// Lets a single millisecond of page time pass -- enough for anything the page
// asked to do at once, never for a scheduled interval -- and waits, with page
// time standing still, until the revision check that starts is answered.
export async function checkedAtOnce(page: Page): Promise<void> {
  const answer = page.waitForResponse((response) => isCheck(response.url()), {
    timeout: 5_000,
  });
  await page.clock.runFor(1);
  expect((await answer).status()).toBe(200);
}

// The branch-head listings of revision checks among these `gh` calls, as
// opposed to the reads that resolve `main` (see ./originObservation.ts). Origins leave checks out of what
// they observe, so specs follow them here, among every `gh` call.
export function headsChecks(calls: readonly GhCall[]): readonly GhCall[] {
  return calls.filter(isHeadsCheck);
}

// Hides the page from, or shows it to, the person, as switching browser tabs
// or minimizing the window does: the document says so and announces the
// change. Returns once the page has had its turns to act on it.
export async function setPageVisibility(
  page: Page,
  state: "hidden" | "visible",
): Promise<void> {
  await page.evaluate((next) => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => next,
    });
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => next === "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }, state);
  await givePageItsTurns(page);
}
