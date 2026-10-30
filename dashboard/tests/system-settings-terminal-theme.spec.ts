import { chmodSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { expect, test } from "./support/pageTest.ts";
import { systemSettingsMachine } from "./support/systemSettingsMachine.ts";
import { tapWhereShown } from "./pageLayout.ts";
import { phoneLaunchTouchViewport } from "./touchLaunchPage.ts";
import { readSetting } from "./support/settingsTouchPage.ts";
import {
  computedPalettes,
  sample,
  sampleColor,
  sampleScreen,
  terminalThemeFile,
  themeChoice,
  type ComputedPalette,
} from "./support/terminalThemeSettingsPage.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

async function expectShown(page: Page, label: ComputedPalette) {
  const { background, foreground, red } = computedPalettes[label];
  await expect(themeChoice(page).locator("option:checked")).toHaveText(label);
  await expect(sample(page)).toContainText(`Sample: ${label}`);
  await expect(sampleScreen(page)).toHaveCSS("background-color", background);
  await expect(sampleScreen(page)).toHaveCSS("color", foreground);
  await expect(sampleColor(page, "red")).toHaveCSS("color", red);
}

const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} terminal theme recovery`, () => {
  test.use({ viewport: portrait, hasTouch: true });
  test("touch reads the theme, preserves the saved predecessor after failure, and reaches Retry after rotation", async ({
    page,
  }) => {
    const server = await fixture.start("preview");
    await page.goto(`${server.baseURL}/?view=settings`);
    const projects = path.join(
      fixture.home,
      ".open-dough/dashboard/projects-production.json",
    );
    const beforeProjects = readFileSync(projects, "utf8");
    const theme = page.getByRole("region", {
      name: "Terminal theme",
      exact: true,
    });
    await readSetting(theme.locator(".settings-note:not([role='status'])"));
    await themeChoice(page).scrollIntoViewIfNeeded();
    await expectShown(page, "Default");
    await tapWhereShown(themeChoice(page));
    // The option is chosen through the browser's native select control;
    // its change still goes through the real local save boundary.
    await themeChoice(page).selectOption({ label: "Solarized Dark" });
    await expect(themeChoice(page)).toBeEnabled();
    await expectShown(page, "Solarized Dark");
    const file = terminalThemeFile(fixture.home);
    const predecessor = readFileSync(file, "utf8");
    expect(JSON.parse(predecessor)).toEqual({ theme: "solarized-dark" });
    await page.setViewportSize({ width: portrait.width, height: 320 });
    await themeChoice(page).scrollIntoViewIfNeeded();
    await tapWhereShown(themeChoice(page));
    chmodSync(path.dirname(file), 0o500);
    try {
      await themeChoice(page).selectOption({ label: "Light" });
      await expect(theme.getByRole("alert")).toContainText(
        "could not be saved",
      );
      await expectShown(page, "Solarized Dark");
      expect(readFileSync(file, "utf8")).toBe(predecessor);
    } finally {
      chmodSync(path.dirname(file), 0o700);
    }
    await page.setViewportSize(landscape);
    await expectShown(page, "Solarized Dark");
    expect(readFileSync(file, "utf8")).toBe(predecessor);
    await page.setViewportSize({ width: portrait.width, height: 320 });
    await readSetting(theme.getByRole("alert"));
    await tapWhereShown(
      theme.getByRole("button", { name: "Retry", exact: true }),
    );
    await expect(theme.getByRole("alert")).toHaveCount(0);
    await expect(themeChoice(page)).toBeEnabled();
    await expectShown(page, "Light");
    expect(savedTheme()).toEqual({ theme: "light" });
    await page.setViewportSize(portrait);
    await readSetting(sample(page).locator("figcaption"));
    await expect(sample(page)).toContainText("Sample: Light");
    expect(readFileSync(projects, "utf8")).toBe(beforeProjects);
    expect(existsSync(fixture.credentialFile)).toBe(false);
    expect(fixture.egress()).toBe("");
    expect(server.claudeCalls()).toEqual([]);
  });
});

const savedTheme = () =>
  JSON.parse(readFileSync(terminalThemeFile(fixture.home), "utf8")) as unknown;

// The theme file is one per machine, shared by the dev and preview servers'
// environments, so the theme chosen on one shows on the other. One order
// shows that sharing; the reverse order would read the same file through the
// same boundary (./boundary/serving-modes.spec.ts proves both servers mount it).
test("terminal theme is chosen in System settings, saved on choosing, kept across reload, restart and the dev server, and a failed save returns to the saved theme", async ({
  page,
  context,
}) => {
  const server = await fixture.start("preview");
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
  const restarted = await fixture.start("preview", port);
  await page.reload();
  await expectShown(page, "Solarized Dark");
  const second = await fixture.start("dev");
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
  // The choice shows while it is being saved; enabled means the save settled.
  await expect(themeChoice(page)).toBeEnabled();
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
