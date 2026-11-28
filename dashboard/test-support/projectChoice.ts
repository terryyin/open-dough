// Project selection as journeys observe it: whichever control the banner
// shows (tab radio or compact title select), choosing one, and asserting the
// selected name. Shared by wide and phone-width callers.

import { expect, type Locator, type Page } from "@playwright/test";
import { parts } from "./dashboardParts.ts";

// Whichever project control the banner is showing: the compact select
// when the tabs do not fit on the banner's one row, otherwise the selected
// tab-shaped radio.
export function shownProjectControl(page: Page): Locator {
  const { project, projectCompact } = parts(page);
  return projectCompact.or(project.getByRole("radio", { checked: true }));
}

export async function selectedProjectId(page: Page): Promise<string> {
  return shownProjectControl(page).inputValue();
}

// The wide banner's tab-shaped radio for one project.
export function projectTab(page: Page, label: string): Locator {
  return parts(page).project.getByRole("radio", { name: label, exact: true });
}

export async function chooseProject(page: Page, label: string): Promise<void> {
  const { projectCompact } = parts(page);
  // A sidebar or panel opening or closing can swap the shown control while
  // the choice is made; choose again through whichever one then shows.
  await expect(async () => {
    if (await projectCompact.isVisible()) {
      await projectCompact.selectOption({ label }, { timeout: 2_000 });
    } else {
      await projectTab(page, label).check({ timeout: 2_000 });
    }
    await expectProjectChoice(page, label, { timeout: 1_000 });
  }).toPass();
}

export async function expectProjectChoice(
  page: Page,
  label: string,
  options?: { readonly timeout?: number },
): Promise<void> {
  const { project, projectCompact } = parts(page);
  // Opening a sidebar or panel can narrow the column and swap the shown
  // control, so wait for either one naming the project.
  await expect(
    projectCompact
      .filter({
        has: page
          .locator("option:checked")
          .and(page.getByText(label, { exact: true })),
      })
      .or(
        project.getByRole("radio", { name: label, exact: true, checked: true }),
      ),
  ).toBeVisible(options);
}

// The projects offered for selection, whether the banner shows tab radios or
// the compact title list (when Recent stories, a Sessions sidebar, or a
// narrow column leave too little room for the tabs).
export async function expectVisibleProjectLabels(
  page: Page,
  labels: readonly string[],
): Promise<void> {
  const { project, projectCompact } = parts(page);
  await expect(async () => {
    if (await projectCompact.isVisible()) {
      await expect(projectCompact.locator("option")).toHaveText(labels);
    } else {
      await expect(project.locator("label")).toHaveText([...labels]);
    }
  }).toPass();
}

const defaultVisibleProjectLabels = [
  "Open Dough",
  "Doughnut",
  "Pygardon",
  "Terry Talks",
] as const;

export async function expectCompactProjectSelect(
  page: Page,
  label: string,
  options: readonly string[] = defaultVisibleProjectLabels,
): Promise<void> {
  const { project, projectCompact } = parts(page);
  await expect(project).toHaveCount(0);
  await expect(projectCompact).toBeVisible();
  await expect(projectCompact.locator("option")).toHaveText(options);
  await expect(projectCompact.locator("option:checked")).toHaveText(label);
}
