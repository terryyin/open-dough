// The browser journey's emulated system preference and readable keyboard focus.

import { expect, type Locator, type Page } from "@playwright/test";
import {
  colorBehind,
  contrastRatio,
  expectFocusedAndIndicated,
} from "./accessibleReading.ts";

export async function setColorScheme(
  page: Page,
  colorScheme: "light" | "dark",
): Promise<void> {
  await page.emulateMedia({ colorScheme });
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
