import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { launched } from "../agentTerminalBoundary.ts";
import { openTakenBacklog } from "../launchStoryCardPage.ts";
import type { LaunchJourney } from "../launchJourney.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { stoppedTracks } from "./voicePage.ts";

export async function openTerminalVoice(
  page: Page,
  dashboard: DashboardServer,
  journey: LaunchJourney,
) {
  const first = await launched(dashboard, "open-dough", {
    title: "Voice session A",
  });
  const second = await launched(dashboard, "open-dough", {
    title: "Voice session B",
  });
  await openTakenBacklog(page, journey);
  const panel = page.getByRole("region", { name: "Terminal", exact: true });
  const open = async (title = "Voice session A") => {
    const sidebar = sessionsSidebarParts(page);
    if (!(await sidebar.sidebar.isVisible())) await sidebar.button.click();
    await sidebar.entry(title).click();
    await expect(panel.locator(".xterm-rows")).toContainText("Claude Code");
    await expect(panel.getByRole("heading", { level: 2 })).toHaveText(title);
  };
  await open();
  return { panel, open, first, second };
}

export async function beginTerminalClip(page: Page, panel: Locator) {
  const before = await page.evaluate(
    () =>
      (window as unknown as { voiceObservation: { bytes: number } })
        .voiceObservation.bytes,
  );
  await panel
    .getByRole("button", { name: "Dictate into terminal", exact: true })
    .click();
  await expect(panel.getByRole("status")).toHaveText(
    "Recording… Stop recording when you are finished.",
  );
  await page.waitForFunction(
    (previous) =>
      (window as unknown as { voiceObservation: { bytes: number } })
        .voiceObservation.bytes > previous,
    before,
  );
}

export async function stopTerminalClip(page: Page, panel: Locator) {
  await panel
    .getByRole("button", { name: "Stop recording", exact: true })
    .click();
  await expect.poll(() => stoppedTracks(page)).toBe(true);
}
