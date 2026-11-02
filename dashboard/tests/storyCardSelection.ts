// Shared assertions for the page's story-card selected mark: class and the
// inset accent ring that distinguishes selection from Side panel outline.

import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";

export async function expectSelected(card: Locator, on: boolean) {
  if (on) {
    await expect(card).toHaveClass(/story-card-selected/);
    expect(
      await card.evaluate((element) => getComputedStyle(element).boxShadow),
    ).toMatch(/inset/);
  } else {
    await expect(card).not.toHaveClass(/story-card-selected/);
  }
}
