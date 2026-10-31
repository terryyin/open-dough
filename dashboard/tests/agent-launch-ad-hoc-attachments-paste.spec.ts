// Start session: paste an image into the instruction field → listed as
// pasted.png with text unchanged; paste of text still inserts; Start sends
// the copied path list after the typed text (SEED-204 E1 / commitments 5b, 5c).

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
import {
  expectCopiedAttachmentPath,
  pasteImageInField,
  pngA,
} from "./support/launchAttachmentFixtures.ts";

test.use({
  projectFolders: ["open-dough"],
  permissions: ["clipboard-read", "clipboard-write"],
});

const openJourney = (page: Page, launchJourney: LaunchJourney) =>
  openTakenBacklog(page, launchJourney);

test("pasting an image into the instruction field attaches it as pasted.png and Start sends its path", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  await openJourney(page, launchJourney);

  const text = "Why is this card clipped?";
  const dialog = startSessionDialog(page, "Open Dough");
  await startSession(page, "Open Dough").click();
  const field = startSessionField(dialog);
  await field.fill(text);

  await pasteImageInField(field, pngA);

  const list = dialog.getByRole("list", { name: "Attached images" });
  await expect(list.getByText("Image 1 · pasted.png")).toBeVisible();
  await expect(list.locator("img")).toHaveCount(1);
  await expect(field).toHaveValue(text);

  await dialog.getByRole("button", { name: "Start" }).click();
  await expect(dialog).toBeHidden();

  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  const [call] = dashboard.claudeLaunchCalls();
  const prompt = call?.argv.at(-1) ?? "";
  const expectedPrefix = `${text}\n\nAttached images:\n1. `;
  expect(prompt.startsWith(expectedPrefix)).toBe(true);
  const attachedPath = prompt.slice(expectedPrefix.length);
  expectCopiedAttachmentPath(attachedPath, dashboard.home, "1-pasted.png");
  expect(readFileSync(attachedPath)).toEqual(pngA);
});

test("pasting text into the instruction field still inserts the text", async ({
  page,
  launchJourney,
}) => {
  await openJourney(page, launchJourney);

  const dialog = startSessionDialog(page, "Open Dough");
  await startSession(page, "Open Dough").click();
  const field = startSessionField(dialog);
  await field.fill("Why is this card clipped?");
  await field.focus();
  await field.evaluate((el: HTMLTextAreaElement) => {
    el.setSelectionRange(el.value.length, el.value.length);
  });

  await page.evaluate(() => navigator.clipboard.writeText(" Look closer."));
  await field.press("ControlOrMeta+v");

  await expect(field).toHaveValue("Why is this card clipped? Look closer.");
  await expect(
    dialog.getByRole("list", { name: "Attached images" }),
  ).toHaveCount(0);
});
