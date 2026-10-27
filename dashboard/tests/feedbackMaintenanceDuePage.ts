// The dashboard and settings observations shared by feedback-maintenance journeys.
import type { Page } from "@playwright/test";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { expect } from "./dashboardTest.ts";
import { startSession } from "./launchStoryCardPage.ts";

// What Open Dough's project row says of feedback maintenance.
export const row = (page: Page) =>
  page.locator(".project-actions-end").getByRole("status");

// The Feedback maintenance section's line on the due date and last launch.
export const settingsLine = (page: Page) =>
  page
    .getByRole("region", { name: "Feedback maintenance", exact: true })
    .getByRole("status")
    .filter({ hasText: "Last automatic launch" });

export async function openDashboard(page: Page, server: DashboardServer) {
  await page.goto(server.baseURL);
  await expect(startSession(page, "Open Dough")).toBeVisible();
}

export async function openSettings(page: Page, server: DashboardServer) {
  await page.goto(`${server.baseURL}/?view=settings`);
}
