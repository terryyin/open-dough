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

/** Paste image bytes into the instruction field (empty name → pasted.png). */
export async function pasteImageInField(
  field: Locator,
  bytes: Buffer,
  options: { readonly name?: string; readonly type?: string } = {},
): Promise<void> {
  await field.evaluate(
    (el, payload: { base64: string; name: string; type: string }) => {
      const binary = atob(payload.base64);
      const data = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        data[i] = binary.charCodeAt(i);
      }
      const file = new File([data], payload.name, { type: payload.type });
      const transfer = new DataTransfer();
      transfer.items.add(file);
      const event = new Event("paste", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "clipboardData", { value: transfer });
      el.dispatchEvent(event);
    },
    {
      base64: bytes.toString("base64"),
      name: options.name ?? "",
      type: options.type ?? "image/png",
    },
  );
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
