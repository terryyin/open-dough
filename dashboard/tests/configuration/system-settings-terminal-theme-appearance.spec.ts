// Terminal theme sample stays independent of the dashboard's system
// appearance: choosing Light or Solarized keeps the sample palette while
// surrounding settings chrome follows prefers-color-scheme.

import { expect, test } from "../support/pageTest.ts";
import { systemSettingsMachine } from "../support/systemSettingsMachine.ts";
import {
  computedPalettes,
  sample,
  sampleColor,
  sampleScreen,
  themeChoice,
} from "../support/terminalThemeSettingsPage.ts";
import {
  expectDarkSurface,
  expectLightSurface,
  setColorScheme,
} from "../systemAppearanceReading.ts";
import { expectReadableContrast } from "../accessibleReading.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

test("terminal Light and Solarized samples keep their palette while settings chrome follows the system appearance", async ({
  page,
}) => {
  const server = await fixture.start("preview");
  await page.goto(`${server.baseURL}/?view=settings`);
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
