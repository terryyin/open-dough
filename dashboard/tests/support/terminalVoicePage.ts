import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { launched } from "../agentTerminalBoundary.ts";
import { openTakenBacklog } from "../launchStoryCardPage.ts";
import type { LaunchJourney } from "../launchJourney.ts";
import {
  openSessionsSidebar,
  sessionsSidebarParts,
} from "../sessionsSidebarPage.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { stoppedTracks } from "./voicePage.ts";

// Safari buttons do not take pointer focus. Model that native default after
// the page handles mousedown, while respecting cancellation of that default.
export async function unfocusedPromptButtons(page: Page) {
  await page.addInitScript(() => {
    document.addEventListener("mousedown", (event) => {
      if (
        !event.defaultPrevented &&
        event.target instanceof Element &&
        event.target.closest('[role="menuitem"]') &&
        document.activeElement instanceof HTMLElement
      ) {
        event.preventDefault();
        document.activeElement.blur();
      }
    });
  });
}

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
    await openSessionsSidebar(page);
    await sessionsSidebarParts(page).entry(title).click();
    await expect(panel.locator(".xterm-rows")).toContainText("Claude Code");
    await expect(panel.getByRole("heading", { level: 2 })).toHaveText(title);
  };
  await open();
  return { panel, open, first, second };
}

export async function openTerminalPrompts(panel: Locator) {
  await panel.getByRole("button", { name: "Prompts", exact: true }).click();
  return panel.getByRole("menu", { name: "Prompts", exact: true });
}

export async function chooseTerminalDictation(panel: Locator) {
  const menu = await openTerminalPrompts(panel);
  await menu
    .getByRole("menuitem", { name: "Dictate into terminal", exact: true })
    .click();
  await expect(menu).toHaveCount(0);
}

export async function expectTerminalDictationAvailable(
  panel: Locator,
  enabled: boolean,
) {
  const menu = await openTerminalPrompts(panel);
  const choice = menu.getByRole("menuitem", {
    name: "Dictate into terminal",
    exact: true,
  });
  if (enabled) await expect(choice).toBeEnabled();
  else await expect(choice).toBeDisabled();
  await menu.press("Escape");
}

export async function beginTerminalClip(page: Page, panel: Locator) {
  const before = await page.evaluate(
    () =>
      (window as unknown as { voiceObservation: { bytes: number } })
        .voiceObservation.bytes,
  );
  await chooseTerminalDictation(panel);
  await expect(
    panel.getByRole("button", { name: "Prompts", exact: true }),
  ).toHaveCount(0);
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
  await expect(
    panel.getByRole("button", { name: "Prompts", exact: true }),
  ).toBeVisible();
}
