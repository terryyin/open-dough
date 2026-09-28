// Shared catalog setup and selection observations for page-wide project
// keyboard navigation journeys.

import type { Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { expectRoute } from "./agentRosterRecords.ts";
import { expectMembership, openDirection, parts } from "./dashboardPage.ts";
import { filesOf, projects, type Project } from "./catalogProjectRecords.ts";
import { publishFiles } from "./publishedOrigin.ts";

function catalogProject(label: string): Project {
  const published = projects.find((entry) => entry.label === label);
  if (published === undefined) {
    throw new Error(`Catalog project ${label} is missing from test records.`);
  }
  return published;
}

export const openDoughProject = catalogProject("Open Dough");
export const doughnutProject = catalogProject("Doughnut");
export const pygardonProject = catalogProject("Pygardon");

function urlProjectId(published: Project): string | null {
  if (published === openDoughProject) {
    return null;
  }
  const id = published.repository.split("/")[1];
  if (id === undefined) {
    throw new Error(`Repository ${published.repository} has no project id.`);
  }
  return id;
}

export async function publishCatalogProjects(page: Page): Promise<void> {
  for (const published of projects) {
    await publishFiles(page, {
      repository: published.repository,
      revision: published.revision,
      files: filesOf(published),
    });
  }
}

export async function expectSelectedProject(
  page: Page,
  published: Project,
  {
    view = null,
    checkDirection = true,
  }: {
    readonly view?: string | null;
    readonly checkDirection?: boolean;
  } = {},
): Promise<void> {
  const { project, source, direction } = parts(page);
  await expect(
    project.getByRole("radio", { name: published.label, exact: true }),
  ).toBeChecked();
  await expectMembership(page, {
    taken: [published.taken],
    backlog: [published.queued],
  });
  if (checkDirection) {
    await openDirection(page);
    await expect(direction).toContainText(published.direction);
  }
  await expect(source).toContainText(published.repository);
  await expect(source).toContainText(published.revision);
  for (const other of projects.filter((entry) => entry !== published)) {
    await expect(page.locator("body")).not.toContainText(other.taken);
    await expect(page.locator("body")).not.toContainText(other.queued);
    await expect(source).not.toContainText(other.revision);
  }
  const projectId = urlProjectId(published);
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
