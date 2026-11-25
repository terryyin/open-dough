// Backlogs and records for the A/B/C history shared by refresh journeys.

import type { Page } from "@playwright/test";
import { inspectedDetail } from "./storyCardControls.ts";
import { parts } from "./dashboardPage.ts";
import { describedRevisions, publishedFile } from "./describedRevisions.ts";
import { backlogPath } from "./publishedOriginBasics.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { renderStorySection } from "../../Distribution/tests/support/published-seed.mjs";
import { test } from "./support/pageTest.ts";

export const revisionA = "a1".repeat(20);
export const revisionB = "b2".repeat(20);
export const revisionC = "c3".repeat(20);

const repair = "Repair the installer's update report";
export const dashboardStory =
  "See the project's published work in a story dashboard";
export const workspaceStory =
  "Prepare stories in a clear developer workspace workflow";
export const queueStory =
  "Queue trunk integration for agents on the same machine";
const claims = "Publish shared backlog claims";

const repairPlan = "slice-plans/059-installer-update-report/PLAN.md";
const repairEntry = makeMe.aBacklogEntry
  .with({ identity: repairPlan, title: repair, href: repairPlan })
  .please();
export const dashboardEntry = makeMe.aBacklogEntry
  .with({
    identity: "SEED-021#see-published-work",
    title: dashboardStory,
    href: "seeds/SEED-021-progress.md#see-published-work",
  })
  .please();
export const workspaceEntry = makeMe.aBacklogEntry
  .with({
    identity: "SEED-008#planning-workspace-procedure",
    title: workspaceStory,
    href: "seeds/SEED-008-sync.md#planning-workspace-procedure",
  })
  .please();
export const queueEntry = makeMe.aBacklogEntry
  .with({
    identity: "SEED-008#same-machine-merge-queue",
    title: queueStory,
    href: "seeds/SEED-008-sync.md#same-machine-merge-queue",
  })
  .please();
export const claimsEntry = makeMe.aBacklogEntry
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

// The scheduled journeys share A and C. A case can change B's membership
// or record bytes while keeping the same publication and request controls.
export function refreshHistory({
  backlog = backlogB,
  files = recordsAt("B"),
  filesAtA = recordsAt("A"),
  atC = { backlog: backlogC, files: recordsAt("C") },
}: {
  backlog?: string;
  files?: Record<string, string>;
  filesAtA?: Record<string, string>;
  atC?: { backlog: string; files: Record<string, string> };
} = {}) {
  return makeMe.aRepository
    .withRevision("A", {
      files: { ...filesAtA, [backlogPath]: backlogA },
    })
    .withRevision("B", { files: { ...files, [backlogPath]: backlog } })
    .withRevision("C", {
      files: { ...atC.files, [backlogPath]: atC.backlog },
    })
    .please();
}

export const titlesOfA = {
  taken: [repair],
  backlog: [dashboardStory, workspaceStory, queueStory],
};
export const titlesOfB = {
  taken: [dashboardStory, repair],
  backlog: [queueStory, claims],
};

// The dashboard story's detail, opened so a whole snapshot's source links can
// be read in it.
export async function inspectDashboardStory(page: Page): Promise<void> {
  await test.step("the dashboard story's detail is inspected", async () => {
    await inspectedDetail(
      parts(page).board.getByRole("article", { name: dashboardStory }),
    );
  });
}
