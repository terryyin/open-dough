// The published change every refresh journey starts from: origin is opened at
// revision A, and later pushes move `main` to B and then C. Only raw backlog
// files are written here; what the page shows is for each test to observe.

import type { Page } from "@playwright/test";
import { expectMembership } from "./dashboardPage.ts";
import { publishMovingOrigin, type MovingOrigin } from "./publishedOrigin.ts";

export const revisionA = "a1".repeat(20);
export const revisionB = "b2".repeat(20);
export const revisionC = "c3".repeat(20);

const repair = "Repair the installer's update report";
export const dashboardStory =
  "See the project's published work in a story dashboard";
export const workspaceStory =
  "Prepare stories in a clear developer workspace workflow";
const queue = "Queue trunk integration for agents on the same machine";
const claims = "Publish shared backlog claims";

const repairEntry = `- [${repair}](quick/059-installer-update-report/PLAN.md)`;
const dashboardEntry = `- [${dashboardStory}](seeds/SEED-021-progress.md#see-published-work) — SEED-021#see-published-work`;
const workspaceEntry = `- [${workspaceStory}](seeds/SEED-008-sync.md#planning-workspace-procedure) — SEED-008#planning-workspace-procedure`;
const queueEntry = `- [${queue}](seeds/SEED-008-sync.md#same-machine-merge-queue) — SEED-008#same-machine-merge-queue`;
const claimsEntry = `- [${claims}](seeds/SEED-040-claims.md#publish-claims) — SEED-040#publish-claims`;

function backlogOf(taken: string[], queued: string[]): string {
  return `# Product backlog\n\n## Taken\n\n${taken.join("\n")}\n\n## Backlog list\n\n${queued.join("\n")}\n`;
}

export const backlogA = backlogOf(
  [repairEntry],
  [dashboardEntry, workspaceEntry, queueEntry],
);
// The dashboard story is taken with a plan and recorded first in Taken, new
// work is queued, and the workspace story is no longer recorded anywhere.
export const backlogB = backlogOf(
  [
    `${dashboardEntry} ([plan](quick/061-published-story-dashboard/PLAN.md))`,
    repairEntry,
  ],
  [queueEntry, claimsEntry],
);
export const backlogC = backlogOf([], [claimsEntry]);

export const titlesOfA = {
  taken: [repair],
  backlog: [dashboardStory, workspaceStory, queue],
};
export const titlesOfB = {
  taken: [dashboardStory, repair],
  backlog: [queue, claims],
};

export async function openAtA(page: Page): Promise<MovingOrigin> {
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA);
  await page.goto("/");
  await expectMembership(page, titlesOfA);
  return origin;
}
