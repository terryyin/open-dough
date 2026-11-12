import { filesColumn } from "../intentModePage.ts";
// Captures Intent tree CI cues for review (light/dark × desktop/phone).

import type { Locator, Page } from "@playwright/test";
import path from "node:path";

const shots = [
  { name: "desktop-light", width: 1280, colorScheme: "light" },
  { name: "desktop-dark", width: 1280, colorScheme: "dark" },
  { name: "phone-light", width: 390, colorScheme: "light" },
  { name: "phone-dark", width: 390, colorScheme: "dark" },
] as const;

export async function captureTreeCiCueScreenshots(
  page: Page,
  intent: Locator,
  screenshotDir: string,
): Promise<void> {
  for (const shot of shots) {
    await page.setViewportSize({ width: shot.width, height: 844 });
    await page.emulateMedia({ colorScheme: shot.colorScheme });
    await filesColumn(intent).screenshot({
      path: path.join(screenshotDir, `tree-ci-cues-${shot.name}.png`),
    });
  }
  await page.emulateMedia({ colorScheme: "light" });
  await page.setViewportSize({ width: 1280, height: 800 });
}
