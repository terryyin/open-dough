// Start session Attach images: pick two PNGs, remove Image 1, Start → fake
// Claude's prompt ends with the remaining path under the test HOME's
// launch-attachments folder, and that file holds the picked bytes.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
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

test.use({ projectFolders: ["open-dough"] });

const openJourney = (page: Page, launchJourney: LaunchJourney) =>
  openTakenBacklog(page, launchJourney);

// Minimal distinct 1×1 PNGs so removal leaves the second file's bytes.
const pngA = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
const pngB = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

test("attaching two images, removing Image 1, then Start sends the remaining copied path", async ({
  page,
  dashboard,
  launchJourney,
}, testInfo) => {
  dashboard.claudeScenario("launched");
  await openJourney(page, launchJourney);

  const fixtureDir = testInfo.outputPath("launch-attachments");
  mkdirSync(fixtureDir, { recursive: true });
  const first = path.join(fixtureDir, "card-a.png");
  const second = path.join(fixtureDir, "card-b.png");
  writeFileSync(first, pngA);
  writeFileSync(second, pngB);

  const text = "Why is this card clipped?";
  const dialog = startSessionDialog(page, "Open Dough");
  await startSession(page, "Open Dough").click();
  await startSessionField(dialog).fill(text);

  const chooser = page.waitForEvent("filechooser");
  await dialog.getByRole("button", { name: "Attach images" }).click();
  await (await chooser).setFiles([first, second]);

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
  const attachmentsRoot = path.join(
    dashboard.home,
    ".open-dough",
    "dashboard",
    "launch-attachments",
  );
  expect(attachedPath.startsWith(`${attachmentsRoot}${path.sep}`)).toBe(true);
  expect(path.basename(attachedPath)).toBe("1-card-b.png");
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
