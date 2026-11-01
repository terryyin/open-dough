// Project selection as journeys observe it: whichever control the banner
// shows (tab radio or compact title select), choosing one, and asserting the
// selected name. Shared by wide and phone-width callers.

import { expect, type Locator, type Page } from "@playwright/test";
import { parts } from "./dashboardParts.ts";

// Whichever project control the banner is showing: the compact title button
// when the tabs do not fit on the banner's one row, otherwise the selected
// tab-shaped radio.
export function shownProjectControl(page: Page): Locator {
  const { project, projectCompact } = parts(page);
  return projectCompact.or(project.getByRole("radio", { checked: true }));
}

// Selected project id from the shown control (radio value, or the compact
// title button's data-project-id).
export async function selectedProjectId(page: Page): Promise<string> {
  return shownProjectControl(page).evaluate((element) => {
    if (element instanceof HTMLInputElement) return element.value;
    return element.getAttribute("data-project-id") ?? "";
  });
}

export async function chooseProject(page: Page, label: string): Promise<void> {
  const { project, projectCompact, projectCompactList } = parts(page);
  // A sidebar or panel opening or closing can swap the shown control while
  // the choice is made; choose again through whichever one then shows.
  await expect(async () => {
    if (await projectCompact.isVisible()) {
      await projectCompact.click({ timeout: 2_000 });
      await projectCompactList
        .getByRole("option", { name: label, exact: true })
        .click({ timeout: 2_000 });
    } else {
      await project
        .getByRole("radio", { name: label, exact: true })
        .check({ timeout: 2_000 });
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
      .filter({ hasText: new RegExp(`^${label}$`) })
      .or(
        project.getByRole("radio", { name: label, exact: true, checked: true }),
      ),
  ).toBeVisible(options);
}

// Compact title select when the tabs do not fit: tabs are gone, the title control
// names the project, and Escape leaves the list without a choice while
// keeping focus on the control.
export async function expectCompactProjectSelect(
  page: Page,
  label: string,
): Promise<void> {
  const { project, projectCompact, projectCompactList } = parts(page);
  await expect(project).toHaveCount(0);
  await expect(projectCompact).toBeVisible();
  await expect(projectCompact).toHaveText(label);
  await projectCompact.click();
  await expect(projectCompactList).toBeVisible();
  await expect(projectCompactList.getByRole("option")).toHaveText([
    "Open Dough",
    "Doughnut",
    "Pygardon",
    "Terry Talks",
  ]);
  await expect(
    projectCompactList.getByRole("option", { selected: true }),
  ).toHaveText(label);
  await page.keyboard.press("Escape");
  await expect(projectCompactList).toHaveCount(0);
  await expect(projectCompact).toBeFocused();
  await expect(projectCompact).toHaveText(label);
}
