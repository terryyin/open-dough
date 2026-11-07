// Writes Intent tree CI-cue review screenshots under the running test's
// Playwright output path (light/dark × desktop/phone), so a run leaves the
// checkout clean.

import type { Locator, Page, TestInfo } from "@playwright/test";

const shots = [
  { name: "desktop-light", width: 1280, colorScheme: "light" },
  { name: "desktop-dark", width: 1280, colorScheme: "dark" },
  { name: "phone-light", width: 390, colorScheme: "light" },
  { name: "phone-dark", width: 390, colorScheme: "dark" },
] as const;

export async function captureTreeCiCueScreenshots(
  page: Page,
  intent: Locator,
  testInfo: TestInfo,
): Promise<void> {
  for (const shot of shots) {
    await page.setViewportSize({ width: shot.width, height: 844 });
    await page.emulateMedia({ colorScheme: shot.colorScheme });
    await intent.locator(".intent-locations").screenshot({
      path: testInfo.outputPath(`tree-ci-cues-${shot.name}.png`),
    });
  }
  await page.emulateMedia({ colorScheme: "light" });
  await page.setViewportSize({ width: 1280, height: 800 });
}
