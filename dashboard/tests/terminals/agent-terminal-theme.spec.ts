import { closeSidePanel } from "../sidePanelFrame.ts";
// The page's terminal shows the terminal theme chosen in System settings
// (../configuration/system-settings-terminal-theme.spec.ts covers choosing and keeping it).
// With no saved choice it shows today's white on black. A choice made in
// Settings while a session is open reaches that same terminal on return, with
// its earlier output and without re-attaching; the next attachment, also
// after a reload, starts in it; Light leaves no black edge around it; and
// Default restores today's colours. Each test's dashboard runs in its own
// temporary HOME (../support/dashboardServer.ts), so the saved theme never
// leaves it. The synthetic `claude` (./fixtures/fake-claude) echoes what is
// typed; the real one is never reached.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import { openTakenBacklog } from "../launchStoryCardPage.ts";
import { parts } from "../dashboardPage.ts";
import { back, settings } from "../support/systemSettingsPage.ts";
import {
  openTerminalControl,
  terminalPanel,
  terminalScreenParts,
} from "../terminalScreenPage.ts";
import {
  computedPalettes,
  themeChoice,
  type ComputedPalette,
} from "../support/terminalThemeSettingsPage.ts";

test.use({ projectFolders: ["open-dough"] });

async function expectTheme(panel: Locator, label: ComputedPalette) {
  const { background, foreground } = computedPalettes[label];
  await expect(terminalScreenParts(panel).rows).toHaveCSS("color", foreground);
  for (const surface of [
    ".xterm-scrollable-element",
    ".xterm-viewport",
    ".terminal-screen",
  ])
    await expect(panel.locator(surface)).toHaveCSS(
      "background-color",
      background,
    );
}

async function chooseInSettings(page: Page, label: ComputedPalette) {
  await settings(page).click();
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeVisible();
  await themeChoice(page).selectOption({ label });
  await expect(themeChoice(page)).toBeEnabled();
  await expect(themeChoice(page).locator("option:checked")).toHaveText(label);
  await back(page).click();
}

test("the page's terminal shows the theme chosen in System settings, live without re-attaching, on the next attachment and after a reload", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  await openTakenBacklog(page, launchJourney);
  const panel = terminalPanel(page);
  const { rows } = terminalScreenParts(panel);
  const entry = parts(page).taken.locator(".session-entry");
  const openTerminal = openTerminalControl(entry, { exact: false });

  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  await page
    .getByRole("dialog", {
      name: "Start a session in Open Dough in Claude Code",
    })
    .getByRole("button", { name: "Start" })
    .click();
  await expect(rows).toContainText("attached");
  await page.keyboard.type("before the theme");
  await page.keyboard.press("Enter");
  await expect(rows).toContainText("echo before the theme");
  await expectTheme(panel, "Default");
  const attaches = dashboard.claudeAttaches().length;

  await chooseInSettings(page, "Solarized Dark");
  await expectTheme(panel, "Solarized Dark");
  await expect(rows).toContainText("echo before the theme");
  await expect(panel.locator(".terminal-status")).toBeEmpty();
  expect(dashboard.claudeAttaches()).toHaveLength(attaches);

  await closeSidePanel(panel);
  await expect(panel).toHaveCount(0);
  await openTerminal.click();
  await expect(rows).toContainText("attached");
  await expectTheme(panel, "Solarized Dark");

  await page.reload();
  await expect(panel).toHaveCount(0);
  await openTerminal.click();
  await expect(rows).toContainText("attached");
  await expectTheme(panel, "Solarized Dark");

  await chooseInSettings(page, "Light");
  await expectTheme(panel, "Light");

  await chooseInSettings(page, "Default");
  await expectTheme(panel, "Default");
  await expect(panel.locator(".terminal-status")).toBeEmpty();
  expect(dashboard.claudeAttaches()).toHaveLength(attaches + 2);
});
