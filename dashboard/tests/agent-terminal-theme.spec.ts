// The page's terminal shows the terminal theme chosen in System settings
// (./system-settings-terminal-theme.spec.ts covers choosing and keeping it).
// With no saved choice it shows today's white on black. A choice made in
// Settings while a session is open reaches that same terminal on return, with
// its earlier output and without re-attaching; the next attachment, also
// after a reload, starts in it; Light leaves no black edge around it; and
// Default restores today's colours. Each test's dashboard runs in its own
// temporary HOME (./support/dashboardServer.ts), so the saved theme never
// leaves it. The synthetic `claude` (./fixtures/fake-claude) echoes what is
// typed; the real one is never reached.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import { parts } from "./dashboardPage.ts";
import { publishLaunchJourney, type LaunchJourney } from "./launchJourney.ts";
import { back, settings } from "./support/systemSettingsPage.ts";
import {
  computedPalettes,
  themeChoice,
  type ComputedPalette,
} from "./support/terminalThemeSettingsPage.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

async function expectTheme(panel: Locator, label: ComputedPalette) {
  const { background, foreground } = computedPalettes[label];
  await expect(panel.locator(".xterm-rows")).toHaveCSS("color", foreground);
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
}) => {
  dashboard.claudeScenario("launched");
  await openTakenBacklog(page, journey);
  const panel = page.getByRole("region", { name: "Terminal", exact: true });
  const rows = panel.locator(".xterm-rows");
  const entry = parts(page).recentSessions.getByRole("article");
  const openTerminal = entry.getByRole("button", { name: "Open terminal" });

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

  await panel.getByRole("button", { name: "Close", exact: true }).click();
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
