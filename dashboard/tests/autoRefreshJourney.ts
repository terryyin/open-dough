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

// The argv of one check of `main`: conditional on the entity tag of the
// answer naming `known`, once there is one.
export function refCheckArgv(known?: string): readonly string[] {
  return [
    "api",
    "--include",
    ...(known === undefined
      ? []
      : ["-H", `If-None-Match: ${commitEtag(known)}`]),
    "repos/terryyin/open-dough/commits/main",
    "--jq",
    ".sha",
  ];
}

// Lets page time pass in small steps until the page asks for the next
// revision check, then waits -- with page time standing still, so nothing the
// check starts can time out -- until that check is answered. Says how much
// page time passed before the check was asked.
export async function passTimeUntilChecked(page: Page): Promise<number> {
  const isCheck = (url: string) => new URL(url).searchParams.has("since");
  const asked: Request[] = [];
  const noteCheck = (sent: Request) => {
    if (isCheck(sent.url())) {
      asked.push(sent);
    }
  };
  const answer = page.waitForResponse((response) => isCheck(response.url()));
  page.on("request", noteCheck);
  let passed = 0;
  try {
    while (asked.length === 0) {
      if (passed > 60_000) {
        throw new Error("No revision check was made within a minute.");
      }
      await page.clock.runFor(250);
      passed += 250;
    }
  } finally {
    page.off("request", noteCheck);
  }
  expect((await answer).status()).toBe(200);
  return passed;
}
