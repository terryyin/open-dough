// Observations for the dashboard's system colour-scheme appearance: surface
// and text contrast under an emulated preference, live light↔dark updates
// without losing reading state, and the absence of a dashboard appearance
// switch. Journeys supply their own fixtures.

import { expect, type Locator, type Page } from "@playwright/test";
import {
  colorBehind,
  contrastRatio,
  expectControlContrast,
  expectFocusedAndIndicated,
  expectReadableContrast,
} from "./accessibleReading.ts";
import { tokenColour } from "./pageColours.ts";
import { fileSource, sourceLineNumbers } from "./intentCodeBrowsePage.ts";

// Source contrast and preference changes observe the same selected file.
export function sourceAppearance(intent: Locator, path: string) {
  const source = fileSource(intent, path);
  return { source, token: source.locator(".source-token").first() };
}

export async function expectSourceReadable(intent: Locator, path: string) {
  const { source, token } = sourceAppearance(intent, path);
  await expect(source).toBeVisible();
  await expectReadableContrast(sourceLineNumbers(source).first());
  if ((await token.count()) > 0) await expectReadableContrast(token);
}

export async function setColorScheme(
  page: Page,
  colorScheme: "light" | "dark",
): Promise<void> {
  await page.emulateMedia({ colorScheme });
}

export async function expectDarkSurface(page: Page): Promise<void> {
  const surface = await tokenColour(page, "--surface");
  const text = await tokenColour(page, "--text");
  expect(contrastRatio(text, surface)).toBeGreaterThanOrEqual(4.5);
  const root = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return { color: style.color, background: style.backgroundColor };
  });
  expect(root.background).toBe(surface);
  expect(root.color).toBe(text);
  // Dark surfaces stay darker than today's light page fill.
  expect(surface).not.toBe("rgb(246, 246, 243)");
}

export async function expectLightSurface(page: Page): Promise<void> {
  expect(await tokenColour(page, "--surface")).toBe("rgb(246, 246, 243)");
  expect(await tokenColour(page, "--text")).toBe("rgb(29, 29, 27)");
}

export async function expectPrimaryControlReadable(
  control: Locator,
): Promise<void> {
  await expectReadableContrast(control);
  await expectControlContrast(control);
}

// Focus indication remains visible and meets control contrast against the
// composed surface behind the focused control.
export async function expectFocusReadable(page: Page, control: Locator) {
  await control.focus();
  await expectFocusedAndIndicated(page, control);
  const outline = await control.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.outlineColor, width: parseFloat(style.outlineWidth) };
  });
  expect(outline.width).toBeGreaterThanOrEqual(2);
  const behind = await colorBehind(control, { includingItself: false });
  expect(contrastRatio(outline.color, behind)).toBeGreaterThanOrEqual(3);
}

export async function expectNoAppearanceSwitch(page: Page): Promise<void> {
  // Terminal theme remains an explicit palette choice; it is not a dashboard
  // appearance switch. Match only dashboard appearance controls.
  await expect(
    page.getByRole("button", {
      name: /^(dark mode|light mode|appearance|color scheme)$/i,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("combobox", {
      name: /^(appearance|color scheme|dashboard theme)$/i,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("switch", {
      name: /^(appearance|dark mode|light mode|color scheme)$/i,
    }),
  ).toHaveCount(0);
}
