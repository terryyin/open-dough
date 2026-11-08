// Shared catalog setup and selection observations for page-wide project
// keyboard navigation journeys.

import type { Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { expectRoute } from "./agentRosterRecords.ts";
import {
  shortRevision,
  expectMembership,
  expectProjectChoice,
  openDirection,
  parts,
} from "./dashboardPage.ts";
import {
  catalogExpectations,
  type CatalogExpectation,
} from "./catalogProjectExpectations.ts";
import { catalogPublications } from "./catalogProjectRecords.ts";
import { publishFiles } from "./publishedOrigin.ts";

export const {
  openDough: openDoughProject,
  doughnut: doughnutProject,
  pygardon: pygardonProject,
  terryTalks: terryTalksProject,
} = catalogExpectations;

export async function publishCatalogProjects(page: Page): Promise<void> {
  for (const published of Object.values(catalogPublications)) {
    await publishFiles(page, published);
  }
}

export async function expectSelectedProject(
  page: Page,
  expected: CatalogExpectation,
  {
    view = null,
    checkDirection = true,
  }: {
    readonly view?: string | null;
    readonly checkDirection?: boolean;
  } = {},
): Promise<void> {
  const { project, direction, readRevision } = parts(page);
  await expect(
    project.getByRole("radio", { name: expected.label, exact: true }),
  ).toBeChecked();
  await expectMembership(page, {
    taken: [expected.taken],
    backlog: [expected.queued],
  });
  if (checkDirection) {
    await openDirection(page);
    await expect(direction).toContainText(expected.direction);
  }
  await expectProjectChoice(page, expected.label);
  await expect(readRevision).toContainText(shortRevision(expected.revision));
  for (const other of Object.values(catalogExpectations).filter(
    (entry) => entry !== expected,
  )) {
    await expect(page.locator("body")).not.toContainText(other.taken);
    await expect(page.locator("body")).not.toContainText(other.queued);
    await expect(readRevision).not.toContainText(shortRevision(other.revision));
  }
  const projectId = expected.id === "open-dough" ? null : expected.id;
  if (projectId === null) {
    expect(new URL(page.url()).searchParams.get("project")).toBeNull();
    expectRoute(page, { view });
  } else {
    expectRoute(page, { project: projectId, view });
  }
}

export async function expectFocusedRadio(
  page: Page,
  label: string,
): Promise<void> {
  const radio = parts(page).project.getByRole("radio", {
    name: label,
    exact: true,
  });
  await expect(radio).toBeChecked();
  await expect(radio).toBeFocused();
}
