// Start session Attach images: pick two PNGs, remove Image 1, Start → fake
// Claude's prompt ends with the remaining path under the test HOME's
// launch-attachments folder, and that file holds the picked bytes.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchStoryCardPage.ts";
import type { LaunchJourney } from "./launchJourney.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  expectCopiedAttachmentPath,
  pickImagesInDialog,
  pngA,
  pngB,
  writePickedImages,
} from "./support/launchAttachmentFixtures.ts";

test.use({ projectFolders: ["open-dough"] });

const openJourney = (page: Page, launchJourney: LaunchJourney) =>
  openTakenBacklog(page, launchJourney);

test("attaching two images, removing Image 1, then Start sends the remaining copied path", async ({
  page,
  dashboard,
  launchJourney,
}, testInfo) => {
  dashboard.claudeScenario("launched");
  await openJourney(page, launchJourney);

  const picked = writePickedImages(testInfo, [
    { name: "card-a.png", bytes: pngA },
    { name: "card-b.png", bytes: pngB },
  ]);

  const text = "Why is this card clipped?";
  const dialog = startSessionDialog(page, "Open Dough");
  await startSession(page, "Open Dough").click();
  await startSessionField(dialog).fill(text);

  await pickImagesInDialog(page, dialog, picked);

  const list = dialog.getByRole("list", { name: "Attached images" });
  await expect(list.getByText("Image 1 · card-a.png")).toBeVisible();
  await expect(list.getByText("Image 2 · card-b.png")).toBeVisible();
  await expect(list.locator("img")).toHaveCount(2);
  await expect(
    list.getByRole("button", { name: "Remove Image 1" }),
  ).toBeVisible();
  await expect(
    list.getByRole("button", { name: "Remove Image 2" }),
  ).toBeVisible();

  await list.getByRole("button", { name: "Remove Image 1" }).click();
  await expect(list.getByText("Image 1 · card-b.png")).toBeVisible();
  await expect(list.getByText("card-a.png")).toHaveCount(0);
  await expect(list.locator("img")).toHaveCount(1);

  await dialog.getByRole("button", { name: "Start" }).click();
  await expect(dialog).toBeHidden();

  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  const [call] = dashboard.claudeLaunchCalls();
  const prompt = call?.argv.at(-1) ?? "";
  const expectedPrefix = `${text}\n\nAttached images:\n1. `;
  expect(prompt.startsWith(expectedPrefix)).toBe(true);
  const attachedPath = prompt.slice(expectedPrefix.length);
  expectCopiedAttachmentPath(attachedPath, dashboard.home, "1-card-b.png");
  expect(readFileSync(attachedPath)).toEqual(pngB);

  await expect
    .poll(async () => {
      const [record] = (await recordsOf(
        dashboard,
        "open-dough",
      )) as LaunchRecord[];
      return record?.request.attachments;
    })
    .toEqual([attachedPath]);
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(JSON.stringify(record?.request)).not.toMatch(/iVBOR/);
  expect(record?.request).not.toHaveProperty("attachmentClaims");
});

test("Start session with no text and one image sends the list alone and labels by time", async ({
  page,
  dashboard,
  launchJourney,
}, testInfo) => {
  dashboard.claudeScenario("launched");
  await openJourney(page, launchJourney);

  const picked = writePickedImages(testInfo, [
    { name: "card.png", bytes: pngA },
  ]);

  const dialog = startSessionDialog(page, "Open Dough");
  await startSession(page, "Open Dough").click();
  await expect(startSessionField(dialog)).toHaveValue("");
  await pickImagesInDialog(page, dialog, picked);
  await expect(
    dialog
      .getByRole("list", { name: "Attached images" })
      .getByText("Image 1 · card.png"),
  ).toBeVisible();

  await dialog.getByRole("button", { name: "Start" }).click();
  await expect(dialog).toBeHidden();

  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  const [call] = dashboard.claudeLaunchCalls();
  const prompt = call?.argv.at(-1) ?? "";
  const expectedPrefix = "Attached images:\n1. ";
  expect(prompt.startsWith(expectedPrefix)).toBe(true);
  const [attachedPath, ...rest] = prompt
    .slice(expectedPrefix.length)
    .split("\n\n");
  expect(rest).toEqual([]);
  expectCopiedAttachmentPath(attachedPath ?? "", dashboard.home, "1-card.png");
  expect(readFileSync(attachedPath ?? "")).toEqual(pngA);

  await expect
    .poll(async () => {
      const [record] = (await recordsOf(
        dashboard,
        "open-dough",
      )) as LaunchRecord[];
      return record?.request.title;
    })
    .toMatch(/^\d{1,2} \w{3}, \d\d:\d\d$/);
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(call?.argv[2]).toBe(`Open Dough · Ad hoc · ${record?.request.title}`);
  expect(record?.request.attachments).toEqual([attachedPath]);
  expect(record?.request.attachmentDigests).toEqual([
    createHash("sha256").update(pngA).digest("hex"),
  ]);
  expect(record?.request).not.toHaveProperty("instruction");
});
