import { chmodSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { systemSettingsMachine } from "./support/systemSettingsMachine.ts";
import {
  sample,
  sampleColor,
  sampleScreen,
  terminalThemeFile,
  themeChoice,
} from "./support/terminalThemeSettingsPage.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

// Background, foreground and the red sample of each palette, as computed.
const palettes = {
  Default: ["rgb(0, 0, 0)", "rgb(255, 255, 255)", "rgb(204, 0, 0)"],
  Light: ["rgb(255, 255, 255)", "rgb(31, 35, 40)", "rgb(207, 34, 46)"],
  "Solarized Dark": [
    "rgb(0, 43, 54)",
    "rgb(131, 148, 150)",
    "rgb(220, 50, 47)",
  ],
} as const;

async function expectShown(page: Page, label: keyof typeof palettes) {
  const [background, foreground, red] = palettes[label];
  await expect(themeChoice(page).locator("option:checked")).toHaveText(label);
  await expect(sample(page)).toContainText(`Sample: ${label}`);
  await expect(sampleScreen(page)).toHaveCSS("background-color", background);
  await expect(sampleScreen(page)).toHaveCSS("color", foreground);
  await expect(sampleColor(page, "red")).toHaveCSS("color", red);
}

const savedTheme = () =>
  JSON.parse(readFileSync(terminalThemeFile(fixture.home), "utf8")) as unknown;

for (const [mode, other] of [
  ["dev", "preview"],
  ["preview", "dev"],
] as const) {
  test(`terminal theme is chosen in System settings, saved on choosing, kept across reload, restart and ${other}, and a failed save returns to the saved theme (${mode})`, async ({
    page,
    context,
  }) => {
    const server = await fixture.start(mode);
    await page.goto(`${server.baseURL}/?view=settings`);
    await expect(
      page.getByRole("heading", { name: "Terminal theme", exact: true }),
    ).toBeVisible();
    await expectShown(page, "Default");
    await expect(sampleColor(page, "bright white")).toBeVisible();
    expect(existsSync(terminalThemeFile(fixture.home))).toBe(false);

    await themeChoice(page).focus();
    await themeChoice(page).selectOption({ label: "Solarized Dark" });
    await expectShown(page, "Solarized Dark");
    await expect(themeChoice(page)).toBeEnabled();
    expect(savedTheme()).toEqual({ theme: "solarized-dark" });

    await page.reload();
    await expectShown(page, "Solarized Dark");
    const port = Number(new URL(server.baseURL).port);
    await fixture.stop(server);
    const restarted = await fixture.start(mode, port);
    await page.reload();
    await expectShown(page, "Solarized Dark");
    const second = await fixture.start(other);
    const otherPage = await context.newPage();
    await otherPage.goto(`${second.baseURL}/?view=settings`);
    await expectShown(otherPage, "Solarized Dark");

    const folder = path.dirname(terminalThemeFile(fixture.home));
    chmodSync(folder, 0o500);
    try {
      await themeChoice(page).selectOption({ label: "Light" });
      await expect(page.getByRole("alert")).toContainText("could not be saved");
      await expectShown(page, "Solarized Dark");
      expect(savedTheme()).toEqual({ theme: "solarized-dark" });
    } finally {
      chmodSync(folder, 0o700);
    }
    await page
      .getByRole("alert")
      .getByRole("button", { name: "Retry", exact: true })
      .click();
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expectShown(page, "Light");
    expect(savedTheme()).toEqual({ theme: "light" });

    await themeChoice(page).selectOption({ label: "Default" });
    await expectShown(page, "Default");
    await expect(themeChoice(page)).toBeEnabled();
    expect(savedTheme()).toEqual({ theme: "default" });
    await otherPage.reload();
    await expectShown(otherPage, "Default");
    for (const local of [restarted, second])
      expect(local.claudeCalls()).toEqual([]);
  });
}
