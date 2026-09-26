// The auto-refresh journey's published records, its paused page clock, and
// what it observes of the `gh` calls behind the page: see
// ./auto-refresh.spec.ts.

import { expect, type Page } from "@playwright/test";
import { githubFor, pausePageClockAt } from "./dashboardTest.ts";
import { expectMembership } from "./dashboardPage.ts";
import { headsEtag } from "./originAnswers.ts";
import { isHeadsCheck } from "./originObservation.ts";
import { publishMovingOrigin, type MovingOrigin } from "./publishedOrigin.ts";
import {
  backlogA,
  dashboardStory,
  revisionA,
  titlesOfA,
} from "./refreshJourney.ts";
import {
  givePageItsTurns,
  isCheck,
  untilPageRequestsAnswered,
  whileNotingChecks,
} from "./pageRequestNotes.ts";
import type { GhCall } from "./support/fakeGitHub.ts";

export const queueStory =
  "Queue trunk integration for agents on the same machine";
const opened = new Date("2026-09-23T09:00:00.000Z");

// The records the refresh journey's backlogs name, with a Goal that says at
// which commit it was published, so a detail can only come from one.
export function recordsAt(label: string): Record<string, string> {
  const story = (anchor: string, identity: string, title: string) =>
    `<a id="${anchor}"></a>\n\n### ${title}\n\n**Identity:** ${identity}\n\n**Goal:** ${title}, as published at ${label}.\n`;
  return {
    ".planning/seeds/SEED-021-progress.md": `# Progress\n\n${story("see-published-work", "SEED-021#see-published-work", dashboardStory)}`,
    ".planning/seeds/SEED-008-sync.md": `# Sync\n\n${story("planning-workspace-procedure", "SEED-008#planning-workspace-procedure", "Prepare stories in a clear developer workspace workflow")}\n${story("same-machine-merge-queue", "SEED-008#same-machine-merge-queue", queueStory)}`,
    ".planning/seeds/SEED-040-claims.md": `# Claims\n\n${story("publish-claims", "SEED-040#publish-claims", "Publish shared backlog claims")}`,
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

// Opens the page at A with its clock paused, and waits until the whole
// snapshot, detail included, has been read.
export async function openSettledAtA(page: Page): Promise<MovingOrigin> {
  await pausePageClockAt(page, opened);
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA, recordsAt("A"));
  await page.goto("/");
  await expectMembership(page, titlesOfA);
  await expect(page.getByText("Reading preparation…")).toHaveCount(0);
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
// which the page asked for it has passed.
const pageTimeStepMs = 250;

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

// Lets page time pass until the page asks for the next revision check, then
// waits -- with page time standing still, so nothing the check starts can
// time out -- until that check is answered, successfully unless the local
// boundary is expected to report a failed check (`502`). Says how much page
// time passed before the check was asked.
export async function passTimeUntilChecked(
  page: Page,
  answeredWith: 200 | 502 = 200,
): Promise<number> {
  const answer = page.waitForResponse((response) => isCheck(response.url()));
  const passed = await passTimeUntilAsked(page);
  expect((await answer).status()).toBe(answeredWith);
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
