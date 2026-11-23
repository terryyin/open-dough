// Shared catalog setup and selection observations for page-wide project
// keyboard navigation journeys.

import type { Page } from "@playwright/test";
import { expectMembership } from "./dashboardPage.ts";
import {
  catalogExpectations,
  type CatalogExpectation,
} from "./catalogProjectExpectations.ts";

export const {
  openDough: openDoughProject,
  doughnut: doughnutProject,
  pygardon: pygardonProject,
  terryTalks: terryTalksProject,
} = catalogExpectations;

// The Board shows this catalog project's one Taken and one Backlog story.
export async function expectCatalogStories(
  page: Page,
  expected: CatalogExpectation,
): Promise<void> {
  await expectMembership(page, {
    taken: [expected.taken],
    backlog: [expected.queued],
  });
}
