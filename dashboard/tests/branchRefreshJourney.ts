// Opening the branch slice progress journeys' records
// (./branchProgressRecords.ts) with heads that move, for the automatic
// check's branch journeys (./observation/auto-refresh-branches.spec.ts,
// ./observation/auto-refresh-unusable-branch.spec.ts), which observe what the page then
// asks GitHub through ./originObservation.ts's `readsBesideChecks`.

import type { Page } from "@playwright/test";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { renderSlicePlan } from "../../tests/support/published-plan.mjs";
import { expect, pausePageClockAt } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  branches,
  fromTrunk,
  onBranch,
  opened,
  planPath,
  repository,
  stories,
  trunk,
} from "./branchProgressRecords.ts";
import {
  publishMovingFiles,
  type PublishedRevision,
} from "./publishedFiles.ts";

// Where trunk moves to.
export const trunkMoved = "d5".repeat(20);

export const sevenDoneOnBranch = makeMe.aSlicePlan
  .withStatuses([
    "done",
    "done",
    "done",
    "done",
    "done",
    "done",
    "done",
    "planned",
  ])
  .please();

// A branch revision with a new version of the recorded plan.
export function branchPlanPublication(
  revision: string,
  committedAt: Date,
  plan: Parameters<typeof renderSlicePlan>[0],
): PublishedRevision {
  const path = planPath("on-branch");
  return {
    ...fromTrunk(revision, {
      files: { [path]: renderSlicePlan(plan, { heading: "Slices" }) },
    }),
    committed: { [path]: committedAt },
  };
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
  await pausePageClockAt(page, opened);
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
  return { origin, progress: card.locator(".story-card-progress") };
}
