// The auto-refresh journey's published records, its paused page clock, and
// what it observes of the `gh` calls behind the page: see
// ./auto-refresh.spec.ts.

import { expect, type Page, type Request } from "@playwright/test";
import { githubFor } from "./dashboardTest";
import { expectMembership } from "./dashboardPage";
import { commitEtag } from "./originAnswers";
import { publishMovingOrigin, type MovingOrigin } from "./publishedOrigin";
import {
  backlogA,
  dashboardStory,
  revisionA,
  titlesOfA,
} from "./refreshJourney";
import type { GhCall } from "./support/fakeGitHub";

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
    ".planning/quick/059-installer-update-report/PLAN.md": `# Repair the installer's update report\n\nWhole-document correction home, as published at ${label}.\n`,
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
  await page.clock.install({ time: opened });
  await page.clock.pauseAt(opened);
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA, recordsAt("A"));
  await page.goto("/");
  await expectMembership(page, titlesOfA);
  await expect(page.getByText("Reading preparation…")).toHaveCount(0);
  return origin;
}

// The argv of one check of a repository's `main` (Open Dough's unless
// another is named): conditional on the entity tag of the answer naming
// `known`, once there is one.
export function refCheckArgv(
  known?: string,
  repository = "terryyin/open-dough",
): readonly string[] {
  return [
    "api",
    "--include",
    ...(known === undefined
      ? []
      : ["-H", `If-None-Match: ${commitEtag(known)}`]),
    `repos/${repository}/commits/main`,
    "--jq",
    ".sha",
  ];
}

// Whether a browser request to the local boundary is a revision check.
function isCheck(url: string): boolean {
  return new URL(url).searchParams.has("since");
}

// Page time passes in steps this small, so a check's timing is observed to
// within one step.
const pageTimeStepMs = 250;

// Runs `passing` while noting the revision checks the page asks for; it can
// ask how many have been asked so far.
async function whileNotingChecks<T>(
  page: Page,
  passing: (asked: () => number) => Promise<T>,
): Promise<T> {
  let asked = 0;
  const noteCheck = (sent: Request) => {
    if (isCheck(sent.url())) {
      asked += 1;
    }
  };
  page.on("request", noteCheck);
  try {
    return await passing(() => asked);
  } finally {
    page.off("request", noteCheck);
  }
}

// Lets page time pass in small steps until the page asks for the next
// revision check, without waiting for its answer. Says how much page time
// passed before the check was asked.
export async function passTimeUntilAsked(page: Page): Promise<number> {
  return whileNotingChecks(page, async (asked) => {
    let passed = 0;
    while (asked() === 0) {
      if (passed > 60_000) {
        throw new Error("No revision check was made within a minute.");
      }
      await page.clock.runFor(pageTimeStepMs);
      passed += pageTimeStepMs;
    }
    return passed;
  });
}

// Lets page time pass until the page asks for the next revision check, then
// waits -- with page time standing still, so nothing the check starts can
// time out -- until that check is answered. Says how much page time passed
// before the check was asked.
export async function passTimeUntilChecked(page: Page): Promise<number> {
  const answer = page.waitForResponse((response) => isCheck(response.url()));
  const passed = await passTimeUntilAsked(page);
  expect((await answer).status()).toBe(200);
  return passed;
}

// Lets `ms` of page time pass in the same small steps, then lets real time
// pass for any request those steps started to be sent, and says how many
// revision checks the page asked for meanwhile.
export async function checksAskedWhilePassing(
  page: Page,
  ms: number,
): Promise<number> {
  return whileNotingChecks(page, async (asked) => {
    for (let passed = 0; passed < ms; passed += pageTimeStepMs) {
      await page.clock.runFor(pageTimeStepMs);
    }
    await new Promise((settle) => setTimeout(settle, 500));
    return asked();
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

// The checks of `main` among these `gh` calls, as opposed to the reads that
// resolve it: a check asks with `--include` to see GitHub's status.
export function refChecks(calls: readonly GhCall[]): readonly GhCall[] {
  return calls.filter(
    ({ argv, request }) => request.kind === "ref" && argv.includes("--include"),
  );
}

// Hides the page from, or shows it to, the person, as switching browser tabs
// or minimizing the window does: the document says so and announces the
// change. Returns once the page has had its turns to act on it.
export async function setPageVisibility(
  page: Page,
  state: "hidden" | "visible",
): Promise<void> {
  await page.evaluate(async (next) => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => next,
    });
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => next === "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    // The page's own work runs on message turns, which the paused page clock
    // does not hold back; a few of them let it commit the change.
    for (let turn = 0; turn < 3; turn += 1) {
      await new Promise<void>((done) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = () => {
          done();
        };
        channel.port2.postMessage(undefined);
      });
    }
  }, state);
}
