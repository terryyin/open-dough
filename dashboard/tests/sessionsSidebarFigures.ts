// Where a reader finds the Sessions sidebar title row's figures — the active
// and waiting counts, CPU usage and free disk — and what one figure shows.
// Browser-only: synthetic and integrated host-status cases both read through
// it while keeping their own host and session setup.

import { expect, type Locator, type Page } from "@playwright/test";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";

const activeName = /^\d+ active sessions?$/;
const waitingName = /^\d+ sessions? needs? attention$/;
const cpuName = /^CPU /;
const diskName = /( free|^Free disk unavailable)$/;

export function sessionsSidebarFigures(page: Page) {
  const { sidebar } = sessionsSidebarParts(page);
  const titleRow = sidebar.locator(".sessions-sidebar-title-row");
  return {
    heading: sidebar.getByRole("heading", { level: 2, name: "Sessions" }),
    figures: titleRow.getByRole("img"),
    active: titleRow.getByRole("img", { name: activeName }),
    waiting: titleRow.getByRole("img", { name: waitingName }),
    cpu: titleRow.getByRole("img", { name: cpuName }),
    disk: titleRow.getByRole("img", { name: diskName }),
    // Any of these figures, wherever the page shows one.
    shownAnywhere: page
      .getByRole("img", { name: activeName })
      .or(page.getByRole("img", { name: waitingName }))
      .or(page.getByRole("img", { name: cpuName }))
      .or(page.getByRole("img", { name: diskName })),
  };
}

// The figure shows the caller's count or value beside its icon, names itself
// and titles itself with the caller's words, and offers no action.
export async function expectFigure(
  figure: Locator,
  count: number | string,
  words: string,
): Promise<void> {
  await expect(figure).toHaveAccessibleName(words);
  await expect(figure).toHaveAttribute("title", words);
  await expect(figure).toHaveText(String(count));
  await expect(figure.locator("svg")).toBeVisible();
  await expect(figure.getByRole("button")).toHaveCount(0);
  await expect(figure.getByRole("link")).toHaveCount(0);
}
