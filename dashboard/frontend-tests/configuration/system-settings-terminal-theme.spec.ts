// Terminal theme settings against controlled settings answers: the sample
// keeps its palette while the settings chrome follows the system appearance,
// and touch reading reaches Retry after a refused save and rotation while the
// saved theme stays shown. Saving, sharing across servers and the predecessor
// file are ../../../e2e/configuration/system-settings-terminal-theme.spec.ts.
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  installFrontendSettingsSubstitutes,
  productionSeedProjects,
} from "../../tests/support/frontendSettingsSubstitutes.ts";
import {
  computedPalettes,
  expectThemeShown,
  sample,
  sampleColor,
  sampleScreen,
  themeChoice,
} from "../../tests/support/terminalThemeSettingsPage.ts";
import {
  expectDarkSurface,
  expectLightSurface,
  setColorScheme,
} from "../../tests/systemAppearanceReading.ts";
import { expectReadableContrast } from "../../tests/accessibleReading.ts";
import { tapWhereShown } from "../../tests/pageLayout.ts";
import { phoneLaunchTouchViewport } from "../../tests/touchLaunchPage.ts";
import { readSetting } from "../../tests/support/settingsTouchPage.ts";
import { terminalThemeSaveEndpoint } from "../../src/terminalThemeSetting.ts";

test("terminal Light and Solarized samples keep their palette while settings chrome follows the system appearance", async ({
  page,
  frontendServices,
}) => {
  await installFrontendSettingsSubstitutes(page, frontendServices, {
    projects: productionSeedProjects,
  });
  await page.goto("/?view=settings");
  const theme = page.getByRole("region", {
    name: "Terminal theme",
    exact: true,
  });
  await expect(theme).toBeVisible();

  for (const label of ["Light", "Solarized Dark"] as const) {
    await themeChoice(page).selectOption({ label });
    await expect(themeChoice(page).locator("option:checked")).toHaveText(label);
    await expect(sample(page)).toContainText(`Sample: ${label}`);
    const { background, foreground, red } = computedPalettes[label];

    await setColorScheme(page, "dark");
    await expectDarkSurface(page);
    await expect(sampleScreen(page)).toHaveCSS("background-color", background);
    await expect(sampleScreen(page)).toHaveCSS("color", foreground);
    await expect(sampleColor(page, "red")).toHaveCSS("color", red);
    await expectReadableContrast(
      page.getByRole("heading", { name: "System settings", exact: true }),
    );
    await expectReadableContrast(
      page.getByRole("heading", { name: "Terminal theme", exact: true }),
    );

    await setColorScheme(page, "light");
    await expectLightSurface(page);
    await expect(sampleScreen(page)).toHaveCSS("background-color", background);
    await expect(sampleScreen(page)).toHaveCSS("color", foreground);
    await expect(sampleColor(page, "red")).toHaveCSS("color", red);
  }
});

const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} terminal theme recovery`, () => {
  test.use({ viewport: portrait, hasTouch: true });
  test("touch reads the theme, keeps the saved theme shown after a refused save, and reaches Retry after rotation", async ({
    page,
    frontendServices,
  }) => {
    const answers = await installFrontendSettingsSubstitutes(
      page,
      frontendServices,
      { projects: productionSeedProjects },
    );
    await page.goto("/?view=settings");
    const theme = page.getByRole("region", {
      name: "Terminal theme",
      exact: true,
    });
    await readSetting(theme.locator(".settings-note:not([role='status'])"));
    await themeChoice(page).scrollIntoViewIfNeeded();
    await expectThemeShown(page, "Default");
    await tapWhereShown(themeChoice(page));
    // The option is chosen through the browser's native select control;
    // its change still goes through the local save request.
    await themeChoice(page).selectOption({ label: "Solarized Dark" });
    await expect(themeChoice(page)).toBeEnabled();
    await expectThemeShown(page, "Solarized Dark");
    await page.setViewportSize({ width: portrait.width, height: 320 });
    await themeChoice(page).scrollIntoViewIfNeeded();
    await tapWhereShown(themeChoice(page));
    answers.refuseNext(
      terminalThemeSaveEndpoint,
      503,
      "The terminal theme could not be saved. Check the dashboard folder permissions and retry; the previous theme was kept.",
    );
    await themeChoice(page).selectOption({ label: "Light" });
    await expect(theme.getByRole("alert")).toContainText("could not be saved");
    await expectThemeShown(page, "Solarized Dark");
    await page.setViewportSize(landscape);
    await expectThemeShown(page, "Solarized Dark");
    await page.setViewportSize({ width: portrait.width, height: 320 });
    await readSetting(theme.getByRole("alert"));
    await tapWhereShown(
      theme.getByRole("button", { name: "Retry", exact: true }),
    );
    await expect(theme.getByRole("alert")).toHaveCount(0);
    await expect(themeChoice(page)).toBeEnabled();
    await expectThemeShown(page, "Light");
    await page.setViewportSize(portrait);
    await readSetting(sample(page).locator("figcaption"));
    await expect(sample(page)).toContainText("Sample: Light");
    // Retry saved the refused choice again; nothing else changed.
    expect(answers.changes).toEqual([
      {
        endpoint: terminalThemeSaveEndpoint,
        body: { theme: "solarized-dark" },
      },
      { endpoint: terminalThemeSaveEndpoint, body: { theme: "light" } },
      { endpoint: terminalThemeSaveEndpoint, body: { theme: "light" } },
    ]);
  });
});
