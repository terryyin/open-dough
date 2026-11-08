// The published change every refresh journey starts from: origin is opened at
// revision A, and later pushes move `main` to B and then C. Only the backlog
// of each revision is published here; what the page shows is for each test to
// observe.

import type { Page } from "@playwright/test";
import { inspectedDetail } from "./storyCardControls.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { describedRevisions, publishedFile } from "./describedRevisions.ts";
import {
  backlogPath,
  publishMovingOrigin,
  type MovingOrigin,
} from "./publishedOrigin.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { test } from "./support/pageTest.ts";

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

const repairPlan = "slice-plans/059-installer-update-report/PLAN.md";
const repairEntry = makeMe.aBacklogEntry
  .with({ identity: repairPlan, title: repair, href: repairPlan })
  .please();
const dashboardEntry = makeMe.aBacklogEntry
  .with({
    identity: "SEED-021#see-published-work",
    title: dashboardStory,
    href: "seeds/SEED-021-progress.md#see-published-work",
  })
  .please();
const workspaceEntry = makeMe.aBacklogEntry
  .with({
    identity: "SEED-008#planning-workspace-procedure",
    title: workspaceStory,
    href: "seeds/SEED-008-sync.md#planning-workspace-procedure",
  })
  .please();
const queueEntry = makeMe.aBacklogEntry
  .with({
    identity: "SEED-008#same-machine-merge-queue",
    title: queue,
    href: "seeds/SEED-008-sync.md#same-machine-merge-queue",
  })
  .please();
const claimsEntry = makeMe.aBacklogEntry
  .with({
    identity: "SEED-040#publish-claims",
    title: claims,
    href: "seeds/SEED-040-claims.md#publish-claims",
  })
  .please();

const published = describedRevisions(
  makeMe.aRepository
    .withRevision("A", {
      backlog: {
        taken: [repairEntry],
        queued: [dashboardEntry, workspaceEntry, queueEntry],
      },
    })
    // The dashboard story is taken with a plan and recorded first in Taken,
    // new work is queued, and the workspace story is no longer recorded
    // anywhere.
    .withRevision("B", {
      backlog: {
        taken: [
          {
            ...dashboardEntry,
            plan: {
              label: "plan",
              target: "slice-plans/061-published-story-dashboard/PLAN.md",
            },
          },
          repairEntry,
        ],
        queued: [queueEntry, claimsEntry],
      },
    })
    .withRevision("C", { backlog: { queued: [claimsEntry] } })
    .please(),
  { A: revisionA, B: revisionB, C: revisionC },
);

export const backlogA = publishedFile(published.A, backlogPath);
export const backlogB = publishedFile(published.B, backlogPath);
export const backlogC = publishedFile(published.C, backlogPath);

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

// The dashboard story's detail, opened so a whole snapshot's source links can
// be read in it.
export async function inspectDashboardStory(page: Page): Promise<void> {
  await test.step("the dashboard story's detail is inspected", async () => {
    await inspectedDetail(
      parts(page).board.getByRole("article", { name: dashboardStory }),
    );
  });
}
