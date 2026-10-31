// Shared picked-image fixtures and Attach images dialog helpers for launch
// attachment journeys. One home for the tiny PNG bytes, the test HOME
// launch-attachments root, and the picker flow.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

/** Distinct 1×1 PNGs so removal leaves distinguishable bytes. */
export const pngA = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
export const pngB = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

export function writePickedImages(
  testInfo: { outputPath: (segment: string) => string },
  files: ReadonlyArray<{ name: string; bytes: Buffer }>,
): string[] {
  const fixtureDir = testInfo.outputPath("launch-attachments");
  mkdirSync(fixtureDir, { recursive: true });
  return files.map(({ name, bytes }) => {
    const filePath = path.join(fixtureDir, name);
    writeFileSync(filePath, bytes);
    return filePath;
  });
}

export function launchAttachmentsRoot(home: string): string {
  return path.join(home, ".open-dough", "dashboard", "launch-attachments");
}

export async function pickImagesInDialog(
  page: Page,
  dialog: Locator,
  files: string[],
): Promise<void> {
  const chooser = page.waitForEvent("filechooser");
  await dialog.getByRole("button", { name: "Attach images" }).click();
  await (await chooser).setFiles(files);
}

export function expectCopiedAttachmentPath(
  attachedPath: string,
  home: string,
  basename: string,
): void {
  const root = launchAttachmentsRoot(home);
  expect(attachedPath.startsWith(`${root}${path.sep}`)).toBe(true);
  expect(path.basename(attachedPath)).toBe(basename);
}
