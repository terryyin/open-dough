// Opening the branch slice progress journeys' records
// (./branchProgressRecords.ts) with heads that move, and observing what the
// page then asks GitHub, for the automatic check's branch journeys
// (./auto-refresh-branches.spec.ts, ./auto-refresh-unusable-branch.spec.ts).

import type { Page } from "@playwright/test";
import { expect } from "./dashboardTest";
import { expectMembership, parts } from "./dashboardPage";
import {
  branches,
  onBranch,
  opened,
  repository,
  stories,
  trunk,
} from "./branchProgressRecords";
import { isRefCheck } from "./originObservation";
import { publishMovingFiles, type PublishedRevision } from "./publishedFiles";
import type { GhCall } from "./support/fakeGitHub";

// Where trunk moves to.
export const trunkMoved = "d5".repeat(20);

// What GitHub was asked besides the checks, as `<kind> <path>@<revision>` or
// `branch <name>`.
export function readsBesideChecks(calls: readonly GhCall[]): string[] {
  return calls
    .filter((call) => !isRefCheck(call))
    .map(({ request }) => {
      switch (request.kind) {
        case "content":
        case "listing":
        case "commit-list":
          return `${request.kind} ${request.path}@${request.revision}`;
        case "branch":
          return `branch ${request.branch}`;
        case "ref":
          return `ref ${request.ref}`;
        default:
          return request.kind;
      }
    });
}

// Opens the page on `published` -- by default the records' trunk and
// branches -- with the clock paused at the opening time, once every read has
// settled; answers the moving origin and the branch story card's progress.
export async function openedSettled(
  page: Page,
  published: {
    readonly trunk: PublishedRevision;
    readonly branches: Readonly<Record<string, PublishedRevision>>;
  } = { trunk, branches },
) {
  await page.clock.install({ time: opened });
  await page.clock.pauseAt(opened);
  const origin = publishMovingFiles(page, {
    repository,
    ...published.trunk,
    branches: published.branches,
  });
  await page.goto("/");
  await expectMembership(page, {
    taken: stories.map(({ title }) => title),
    backlog: [],
  });
  await expect(page.getByText("Reading plan slices…")).toHaveCount(0);
  await expect(page.getByText("Reading current slice time…")).toHaveCount(0);
  const card = parts(page).taken.getByRole("article", { name: onBranch });
  return { origin, progress: card.locator(".card-progress") };
}
